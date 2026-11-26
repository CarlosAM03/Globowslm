"""Run the seven V2 release checks in a disposable local Docker Compose project."""

from argparse import ArgumentParser
import os
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parent.parent


def main():
    parser = ArgumentParser(description=__doc__)
    parser.add_argument("--project", default="globows-v2-2c0de20001")
    opt = parser.parse_args()
    if not re.fullmatch(r"globows-v2-[0-9a-f]{10}", opt.project):
        parser.error("El proyecto QA debe ser globows-v2- seguido de diez caracteres hexadecimales.")
    envfile = ROOT / ".env.harness.local"
    if not envfile.is_file():
        parser.error("Se requiere .env.harness.local generado por el runner.")
    env = {key: value for key, value in os.environ.items() if not re.match(
        r"^(DATABASE_URL|DIRECT_URL|POSTGRES_.*|HARNESS_.*|CMS_.*|APP_ORIGIN|MEDIA_ROOT|VERCEL.*|AWS_.*|COMPOSE_.*|DOCKER_HOST|DOCKER_CONTEXT)$",
        key, re.I,
    )}
    context = subprocess.check_output(["docker", "context", "inspect", "--format", "{{.Endpoints.docker.Host}}"], cwd=ROOT, env=env, text=True)
    if not context.strip().startswith(("npipe://", "unix://")):
        parser.error("Se requiere Docker local.")
    env["HARNESS_COMPOSE_PROJECT"] = opt.project
    compose = ["docker", "compose", "-p", opt.project, "-f", "compose.local.yml", "--env-file", str(envfile)]
    gates = [
        [*compose, "run", "--rm", "--build", "web-qa", "npm", "run", "gate:web"],
        [*compose, "run", "--rm", "--build", "api-qa", "npm", "run", "gate:api"],
        [*compose, "up", "-d", "--build", "--wait", "--wait-timeout", "120", "db", "api", "web"],
        [*compose, "run", "--rm", "web-qa", "npm", "run", "gate:stack"],
        [sys.executable, "scripts/v2-resilience.py"],
        [*compose, "run", "--rm", "web-qa", "npm", "run", "gate:audit"],
        [*compose, "run", "--rm", "api-qa", "npm", "run", "gate:audit"],
    ]
    try:
        for gate in gates:
            print(" ".join(gate), flush=True)
            subprocess.run(gate, cwd=ROOT, env=env, check=True, timeout=2700)
    finally:
        subprocess.run([*compose, "down"], cwd=ROOT, env=env, check=False, timeout=120)


if __name__ == "__main__":
    main()
