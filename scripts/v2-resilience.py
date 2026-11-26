"""Exercise migrations and database/media recovery in two disposable Compose projects."""

from argparse import ArgumentParser
from hashlib import sha256
import json
import os
from pathlib import Path
import re
import secrets
import subprocess
from tempfile import TemporaryDirectory
from uuid import uuid4

ROOT = Path(__file__).resolve().parent.parent
APP = "dist/src/resilience-probe.js"
OWNER = "dist/src/auth/owner-cli.js"
CLEANUP = "dist/src/media/cleanup-cli.js"
OLD_MIGRATION = "20261124000400_import_origin"
ACCOUNT_MIGRATION = "20261124000500_account_roles"
SENTINEL_VALUE = 818


def run(args, env, *, output=None, source=None, check=True):
    result = subprocess.run(
        ["docker", *args], cwd=ROOT, env=env, stdin=source,
        stdout=output if output else subprocess.PIPE, stderr=subprocess.PIPE,
        check=False, timeout=300,
    )
    if check and result.returncode:
        message = result.stderr.decode("utf-8", errors="replace").strip()
        raise RuntimeError(f"Docker {args[0]} terminó con {result.returncode}. {message[-500:]}")
    return result.stdout.decode("utf-8", errors="replace").strip() if result.stdout else ""


class Stack:
    def __init__(self, name, env):
        if not re.fullmatch(r"globows-v2-resilience-(src|dst)-[0-9a-f]{12}", name):
            raise ValueError("El nombre de prueba debe ser nuevo y aislado.")
        self.name = name
        self.container = f"{name}-app"
        self.env = env
        self.command = [
            "compose", "-p", name, "-f", "compose.local.yml", "-f", "docker/compose.resilience.yml",
            "--env-file", ".env.harness.local",
        ]

    def compose(self, *args, **kwargs):
        return run([*self.command, *args], self.env, **kwargs)

    def database(self):
        self.compose("up", "-d", "--wait", "--wait-timeout", "90", "--no-build", "db")

    def migrate(self, *, omit=()):
        command = ["npm", "run", "db:deploy"]
        if omit:
            moves = " ".join(f"prisma/migrations/{name}" for name in omit)
            command = ["sh", "-ec", f"mv {moves} /tmp/ && npm run db:deploy"]
        self.compose("run", "-T", "--rm", "--no-deps", "migrate", *command)

    def sql(self, statement):
        return self.compose(
            "exec", "-T", "db", "psql", "-U", "globows", "-d", "globows",
            "-v", "ON_ERROR_STOP=1", "-tA", "-c", statement,
        )

    def runtime(self, *args, credentials=False, **kwargs):
        flags = ["-e", "HARNESS_OWNER_EMAIL", "-e", "HARNESS_OWNER_PASSWORD"] if credentials else []
        return self.compose("run", "-T", "--rm", "--no-deps", *flags, "api", *args, **kwargs)

    def start_api(self):
        self.compose("run", "-d", "--no-deps", "--name", self.container, "api")

    def probe(self, action, *, credentials=False):
        flags = ["-e", "HARNESS_OWNER_EMAIL", "-e", "HARNESS_OWNER_PASSWORD"] if credentials else []
        return run(["exec", "-e", "RESILIENCE_PROBE=1", *flags, self.container, "node", APP, action], self.env)

    def backup(self, sql_path, media_path):
        with sql_path.open("wb") as target:
            self.compose("exec", "-T", "db", "pg_dump", "-U", "globows", "-d", "globows", "-Fc", output=target)
        with media_path.open("wb") as target:
            run(["exec", self.container, "tar", "-C", "/var/lib/globows/media", "-czf", "-", "."], self.env, output=target)

    def restore(self, sql_path, media_path):
        with sql_path.open("rb") as source:
            self.compose(
                "exec", "-T", "db", "pg_restore", "-U", "globows", "-d", "globows", "--clean", "--if-exists",
                "--exit-on-error", "--no-owner", "--single-transaction", source=source,
            )
        with media_path.open("rb") as source:
            self.runtime("tar", "-C", "/var/lib/globows/media", "-xzf", "-", source=source)

    def close(self):
        run(["rm", "-f", self.container], self.env, check=False)
        self.compose("down", "-v", "--remove-orphans", check=False)


def assert_equal(actual, expected, label):
    if actual != expected:
        raise RuntimeError(f"Comprobación fallida: {label}")


def exercise(source, target, workspace):
    source.database()
    source.migrate(omit=(OLD_MIGRATION, ACCOUNT_MIGRATION))
    assert_equal(source.sql('select count(*) from "_prisma_migrations" where finished_at is not null'), "4", "esquema previo")
    source.sql(f"create table resilience_probe (value integer primary key); insert into resilience_probe values ({SENTINEL_VALUE});")
    source.migrate(omit=(ACCOUNT_MIGRATION,))
    assert_equal(source.sql("select value from resilience_probe"), str(SENTINEL_VALUE), "fila tras upgrade")
    assert_equal(source.sql('select count(*) from "_prisma_migrations" where finished_at is not null'), "5", "upgrade")
    print("upgrade_4_to_5_preserved_row", flush=True)

    # Create a baseline account and its related rows before the sixth migration.
    identity = "89a1a4e0-b0f4-4fcc-88a1-abcc352b9170"
    legacy_email = "migration-probe@example.invalid"
    source.sql(
        f"""INSERT INTO owners (id, "emailNormalized", "passwordHash", "updatedAt")
            VALUES ('{identity}', '{legacy_email}', 'opaque baseline fixture', now());
            INSERT INTO sessions (id, "tokenHash", "ownerId", "expiresAt", "csrfHash")
            VALUES ('89a1a4e0-b0f4-4fcc-88a1-abcc352b9171', repeat('a',64), '{identity}', now(), repeat('b',64));"""
    )
    source.migrate()
    assert_equal(source.sql('select count(*) from "_prisma_migrations" where finished_at is not null'), "6", "upgrade de roles")
    assert_equal(
        source.sql(f"""SELECT role || ':' || "emailNormalized" FROM owners WHERE id = '{identity}'"""),
        f"OWNER:{legacy_email}", "identidad OWNER conservada",
    )
    assert_equal(source.sql(f"""SELECT count(*) FROM sessions WHERE "ownerId" = '{identity}'"""), "1", "FK de sesión conservada")
    print("upgrade_5_to_6_preserved_owner_and_session", flush=True)

    source.runtime("node", OWNER, "recover", credentials=True)
    source.compose("run", "-T", "--rm", "--no-deps", "import-v1", "--apply")
    assert "demo_draft_created" in source.runtime("npm", "run", "seed:demo", "--", "--apply")
    assert "demo_existing" in source.runtime("npm", "run", "seed:demo", "--", "--apply")
    source.start_api()
    before = source.probe("healthy")
    print(before, flush=True)
    source.probe("capture-session", credentials=True)
    source.env["HARNESS_OWNER_PASSWORD"] = secrets.token_hex(24)
    source.runtime("node", OWNER, "recover", credentials=True)
    print(source.probe("verify-recovery", credentials=True), flush=True)

    source.compose("stop", "db")
    print(source.probe("database-down"), flush=True)
    source.database()
    run(["restart", source.container], source.env)
    assert_equal(source.probe("healthy"), before, "datos tras reinicio")
    print("database_and_api_restart_verified", flush=True)

    sql_path = workspace / "database.dump"
    media_path = workspace / "media.tgz"
    source.backup(sql_path, media_path)
    for artifact in (sql_path, media_path):
        size = artifact.stat().st_size
        if not size:
            raise RuntimeError(f"Respaldo vacío: {artifact.name}")
        print(f"{artifact.name} bytes={size} sha256={sha256(artifact.read_bytes()).hexdigest()}", flush=True)

    target.database()
    target.migrate()
    assert_equal(target.sql('select count(*) from "_prisma_migrations" where finished_at is not null'), "6", "migración fresh")
    assert_equal(target.sql('select count(*) from "content_entries"'), "0", "destino inicialmente vacío")
    target.restore(sql_path, media_path)
    assert_equal(target.sql("select value from resilience_probe"), str(SENTINEL_VALUE), "fila restaurada")
    assert_equal(target.sql('select count(*) from "content_entries"'), "16", "inventario y fixture privado")
    target.start_api()
    assert_equal(target.probe("healthy"), before, "snapshot y media restaurados")
    print("fresh_database_and_media_restore_verified", flush=True)

    target.probe("create-orphan")
    orphan = target.probe("check-orphan")
    name = json.loads(orphan)["name"]
    report = json.loads(target.runtime("node", CLEANUP, "--dry-run"))
    assert_equal(report["dryRun"] and any(record["file"] == name for record in report["candidates"]), True, "detección dry-run")
    assert_equal(target.probe("check-orphan"), orphan, "simulacro sin pérdida de archivo")
    print("media_cleanup_dry_run_verified", flush=True)


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--image-project", default=os.environ.get("HARNESS_COMPOSE_PROJECT"), help="Proyecto local con api y migrate ya construidos")
    options = parser.parse_args()
    if not options.image_project or not re.fullmatch(r"globows-v2-(?:[0-9a-f]{10}|review)", options.image_project):
        parser.error("Indica el proyecto local del runner o globows-v2-review.")
    env = {k: v for k, v in os.environ.items() if not re.match(
        r"^(DATABASE_URL|DIRECT_URL|POSTGRES_.*|HARNESS_.*|CMS_.*|APP_ORIGIN|MEDIA_ROOT|VERCEL.*|AWS_.*|COMPOSE_.*|DOCKER_HOST|DOCKER_CONTEXT)$", k, re.I
    )}
    context = run(["context", "inspect", "--format", "{{.Endpoints.docker.Host}}"], env)
    if not context.startswith(("npipe://", "unix://")):
        raise RuntimeError("Se requiere un motor Docker local.")
    env.update(
        RESILIENCE_API_IMAGE=f"{options.image_project}-api:latest",
        RESILIENCE_MIGRATE_IMAGE=f"{options.image_project}-migrate:latest",
        HARNESS_OWNER_EMAIL=f"resilience-{uuid4().hex}@example.invalid",
        HARNESS_OWNER_PASSWORD=secrets.token_hex(24),
    )
    run(["image", "inspect", "--format", "{{.Id}}", env["RESILIENCE_API_IMAGE"], env["RESILIENCE_MIGRATE_IMAGE"]], env)
    suffix = uuid4().hex[:12]
    source = Stack(f"globows-v2-resilience-src-{suffix}", env.copy())
    target = Stack(f"globows-v2-resilience-dst-{suffix}", env.copy())
    try:
        with TemporaryDirectory(prefix="globows-resilience-") as workspace:
            exercise(source, target, Path(workspace))
    finally:
        target.close()
        source.close()


if __name__ == "__main__":
    main()
