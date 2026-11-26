import { spawnSync } from "node:child_process";

const severities = ["info", "low", "moderate", "high", "critical"];
const registry = "https://registry.npmjs.org/";
let failed = false;

for (const scope of ["runtime", "full"]) {
  const args = ["audit", "--json", `--registry=${registry}`, ...(scope === "runtime" ? ["--omit=dev"] : [])];
  const child = spawnSync("npm", args, { encoding: "utf8", timeout: 120_000, maxBuffer: 4 * 1024 * 1024 });
  if (child.error || ![0, 1].includes(child.status)) throw new Error(`npm audit ${scope} falló.`);
  const result = JSON.parse(child.stdout);
  const counts = result.metadata?.vulnerabilities;
  if (result.error || !counts || !severities.every((key) => Number.isSafeInteger(counts[key]) && counts[key] >= 0)) {
    throw new Error(`El registro no devolvió un resultado de auditoría para ${scope}.`);
  }
  if (child.status === 1 && !severities.some((key) => counts[key] > 0)) {
    throw new Error(`npm audit ${scope} devolvió un error sin hallazgos.`);
  }
  console.log(JSON.stringify({ scope, counts, vulnerabilities: Object.values(result.vulnerabilities ?? {}).map((item) => ({
    name: item.name, severity: item.severity, range: item.range,
    advisories: item.via.filter((advisory) => typeof advisory === "object").map(({ url }) => url),
  })) }));
  failed ||= scope === "runtime" && (counts.high > 0 || counts.critical > 0);
}
if (failed) process.exitCode = 1;
