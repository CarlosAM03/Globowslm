// SSR fixture tests compile the real TSX with the already installed TypeScript.
// CSS is verified separately by Playwright; this helper does not simulate layout.
import ts from "typescript";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const output = path.join(root, ".visual-evidence", "unit-components");
const compiled = new Map();

async function compile(relative) {
  if (compiled.has(relative)) return compiled.get(relative);
  const task = (async () => {
    await mkdir(output, { recursive: true });
    const source = await readFile(path.join(root, relative), "utf8");
    let code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    code = code.replace(/^import\s+["'][^"']+\.css["'];?\s*$/gm, "");
    for (const match of [...code.matchAll(/from\s+["']([^"']+)["']/g)]) {
      const specifier = match[1];
      if (!specifier.startsWith("@/") && !specifier.startsWith(".")) continue;
      const target = specifier.startsWith("@/") ? path.join("src", specifier.slice(2)) : path.join(path.dirname(relative), specifier);
      let resolved;
      for (const extension of [".tsx", ".ts"]) {
        try { await readFile(path.join(root, target + extension)); resolved = target + extension; break; } catch { /* Try the other source extension. */ }
      }
      if (!resolved) throw new Error(`Cannot resolve ${specifier} from ${relative}`);
      const file = await compile(resolved);
      code = code.replaceAll(`"${specifier}"`, `"./${path.basename(file)}"`).replaceAll(`'${specifier}'`, `"./${path.basename(file)}"`);
    }
    code = code.replace('import Image from "next/image";', 'import nextImageModule from "next/image.js"; const Image = nextImageModule.default ?? nextImageModule;');
    const file = path.join(output, relative.replace(/[^a-z0-9.-]/gi, "_") + ".mjs");
    await writeFile(file, code);
    return file;
  })();
  compiled.set(relative, task);
  return task;
}

export async function importComponent(relative) {
  const file = await compile(relative);
  return import(pathToFileURL(file).href);
}
