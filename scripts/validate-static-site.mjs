import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../dist");
const files = [];
const problems = [];

function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else files.push(path);
  }
}

if (!existsSync(join(root, "index.html"))) {
  throw new Error("dist/index.html is required");
}

walk(root);

for (const file of files.filter((path) => path.endsWith(".html"))) {
  const html = readFileSync(file, "utf8");
  if (/<script(?![^>]*\bsrc=)[^>]*>/i.test(html)) {
    problems.push(`${relative(root, file)} -> inline script blocked by production CSP`);
  }
  if (/\son[a-z]+\s*=/i.test(html)) {
    problems.push(`${relative(root, file)} -> inline event handler blocked by production CSP`);
  }
  for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    const url = match[1];
    if (/^(?:https?:|data:|mailto:|tel:|#)/.test(url)) continue;

    const reference = url.split(/[?#]/)[0];
    if (!reference) continue;

    let target = reference.startsWith("/")
      ? join(root, reference)
      : resolve(dirname(file), reference);

    if (existsSync(target) && statSync(target).isDirectory()) {
      target = join(target, "index.html");
    }

    if (!existsSync(target)) {
      problems.push(`${relative(root, file)} -> ${url}`);
    }
  }
}

if (problems.length) {
  throw new Error(`Broken local references:\n${problems.join("\n")}`);
}

console.log(`Validated ${files.length} static files in dist.`);
