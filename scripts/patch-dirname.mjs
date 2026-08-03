/**
 * Nitro/Vercel ESM bundles of @google-cloud/* still contain `__dirname`.
 * Node ESM throws: ReferenceError: __dirname is not defined in ES module scope
 * Patch output after `vite build`.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOTS = [".vercel/output/functions", ".output/server", "dist/server"];

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (name.endsWith(".mjs") || name.endsWith(".js")) out.push(full);
  }
  return out;
}

let patched = 0;
for (const root of ROOTS) {
  for (const file of walk(root)) {
    const code = readFileSync(file, "utf8");
    if (!code.includes("__dirname")) continue;
    writeFileSync(file, code.replaceAll("__dirname", "import.meta.dirname"), "utf8");
    patched += 1;
    console.log(`patched ${file}`);
  }
}

console.log(`[patch-dirname] done — ${patched} file(s)`);
