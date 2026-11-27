import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function buildCssBundle(checkOnly = false) {
  const cssFiles = JSON.parse(await readFile(path.join(root, "scripts/cssBundleSources.json"), "utf8"));
  const indexPath = path.join(root, "index.html");
  const bundlePath = path.join(root, "css/app.css");
  const index = await readFile(indexPath, "utf8");

  if (!Array.isArray(cssFiles) || cssFiles.length < 2 || cssFiles.some(file => typeof file !== "string" || !/^[a-zA-Z0-9_-]+\.css$/.test(file))) {
    throw new Error("CSS bundle source list is invalid.");
  }

  const contents = await Promise.all(cssFiles.map(async file => {
    const absolute = path.join(root, "css", file);
    const resolved = path.resolve(absolute);
    if (!resolved.startsWith(`${path.join(root, "css")}${path.sep}`)) throw new Error(`Invalid CSS source: ${file}`);
    return `\n/* source: ${file} */\n${await readFile(absolute, "utf8")}`;
  }));
  const bundle = `${contents.join("\n")}\n`;
  const version = createHash("sha256").update(bundle).digest("hex").slice(0, 12);
  const links = [...index.matchAll(/<link\s+rel="stylesheet"\s+href="\.\/css\/([^"?]+\.css)(?:\?v=[^"]+)?"\s*>/g)];
  const expected = `<link rel="stylesheet" href="./css/app.css?v=${version}">`;
  let nextIndex = index;

  if (links.length === cssFiles.length && links.every(([, file], i) => file === cssFiles[i])) {
    nextIndex = index.replace(/<link\s+rel="stylesheet"\s+href="\.\/css\/[^"?]+\.css(?:\?v=[^"]+)?"\s*>\s*/g, "");
    const insertionPoint = nextIndex.indexOf("<!-- SEO_PAGE_METADATA_END -->");
    if (insertionPoint < 0) throw new Error("Could not find stylesheet insertion point.");
    nextIndex = `${nextIndex.slice(0, insertionPoint + "<!-- SEO_PAGE_METADATA_END -->".length)}\n    ${expected}${nextIndex.slice(insertionPoint + "<!-- SEO_PAGE_METADATA_END -->".length)}`;
  } else if (links.length === 1 && links[0][1] === "app.css") {
    nextIndex = index.replace(links[0][0], expected);
  } else {
    throw new Error(`Expected ${cssFiles.length} source stylesheets or the current bundle link; found ${links.length}.`);
  }

  const oldBundle = await readFile(bundlePath, "utf8").catch(() => "");
  if (checkOnly) {
    if (oldBundle !== bundle || nextIndex !== index) throw new Error("CSS bundle is stale; rerun the prerender command.");
  } else {
    if (oldBundle !== bundle) await writeFile(bundlePath, bundle, "utf8");
    if (nextIndex !== index) await writeFile(indexPath, nextIndex, "utf8");
  }

  process.stdout.write(`${checkOnly ? "Verified" : "Built"} one CSS file from ${cssFiles.length} stylesheets (${Buffer.byteLength(bundle)} bytes before compression).\n`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isDirectRun) await buildCssBundle(process.argv.includes("--check"));
