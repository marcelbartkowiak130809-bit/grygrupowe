import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gamesList } from "../js/games.js?v=20261127-19";
import { libraryCategories } from "../js/gameCategories.js?v=20261118-30";
import { homeSeoMarkup, collectionSeoMarkup } from "../js/platform.js?v=20261127-20";
import { publicPageMarkup } from "../js/publicPages.js?v=20261127-20";
import { categorySeoMetadata, homeSeoMetadata, publicSeoMetadata } from "../js/seoMetadata.js?v=20261127-1";
import { buildCssBundle } from "./buildCssBundle.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://grygrupowe.pages.dev";
const templatePath = path.join(root, "index.html");
const sitemapPath = path.join(root, "sitemap.xml");
const checkOnly = process.argv.includes("--check");
await buildCssBundle(checkOnly);

const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

function replaceBlock(html, start, end, content) {
  const expression = new RegExp(`(${start})[\\s\\S]*?(${end})`);
  if (!expression.test(html)) throw new Error(`Missing prerender marker: ${start}`);
  return html.replace(expression, (_match, opening, closing) => `${opening}\n${content}\n${closing}`);
}

function metadataHtml({ path: routePath, title, description }) {
  const canonical = new URL(routePath, `${origin}/`).href;
  const pageTitle = routePath === "/" ? title : `${title} · Gry grupowe`;
  const safeTitle = escapeHtml(pageTitle);
  const safeDescription = escapeHtml(description);
  return `    <meta name="description" content="${safeDescription}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Gry grupowe">
    <meta property="og:title" content="${safeTitle}">
    <meta property="og:description" content="${safeDescription}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${origin}/assets/icons/game-icon-512.png">
    <meta property="og:image:secure_url" content="${origin}/assets/icons/game-icon-512.png">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="512">
    <meta property="og:image:height" content="512">
    <meta property="og:image:alt" content="Ikona Gry grupowe">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${safeTitle}">
    <meta name="twitter:description" content="${safeDescription}">
    <meta name="twitter:image" content="${origin}/assets/icons/game-icon-512.png">
    <meta name="google-site-verification" content="hTBHbojM7wM2OlixT9Hy4hjBFmLN6LubKi7z4lSXfd4">
    <title>${safeTitle}</title>`;
}

function routeData(routePath) {
  if (routePath === "/") return { seo: homeSeoMetadata, screen: "platform", content: homeSeoMarkup() };
  const publicPage = Object.entries(publicSeoMetadata).find(([, item]) => item.path === routePath);
  if (publicPage) {
    const [screen, seo] = publicPage;
    return { seo, screen, content: publicPageMarkup(screen) };
  }
  const category = libraryCategories.find(item => item.path === routePath);
  if (category) {
    return { seo: { path: category.path, ...categorySeoMetadata[category.id] }, screen: category.screen, content: collectionSeoMarkup(category.id) };
  }
  throw new Error(`No static page configured for sitemap path: ${routePath}`);
}

const sitemap = await readFile(sitemapPath, "utf8");
const sitemapUrls = [...sitemap.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(([, href]) => new URL(href.trim()));
if (sitemapUrls.some(url => url.origin !== origin)) throw new Error("Sitemap contains an unexpected host.");
const sitemapRoutes = sitemapUrls.map(url => url.pathname);
if (!sitemapRoutes.length || new Set(sitemapRoutes).size !== sitemapRoutes.length) throw new Error("Sitemap is empty or contains duplicate routes.");

const template = await readFile(templatePath, "utf8");
const outputFiles = [];
for (const routePath of sitemapRoutes) {
  const { seo, screen, content } = routeData(routePath);
  let html = replaceBlock(template, "<!-- SEO_PAGE_METADATA_START -->", "<!-- SEO_PAGE_METADATA_END -->", metadataHtml(seo));
  html = replaceBlock(html, "<!-- PRERENDERED_PAGE_START -->", "<!-- PRERENDERED_PAGE_END -->", `<div class="route-view route-${String(screen).replace(/[^a-z0-9_-]/gi, "-")} initial-route">${content}</div>`);
  const filename = routePath === "/" ? "index.html" : `${routePath.slice(1).replace(/\/$/, "")}.html`;
  const destination = path.join(root, filename);
  const previous = await readFile(destination, "utf8").catch(() => "");
  if (checkOnly) {
    if (previous !== html) throw new Error(`Prerendered page is outdated: ${filename}`);
  } else if (previous !== html) {
    await writeFile(destination, html, "utf8");
  }
  outputFiles.push(filename);
}

if (outputFiles.length !== 11) throw new Error(`Expected 11 sitemap pages, received ${outputFiles.length}.`);
const modeCount = gamesList.filter(mode => !mode.hiddenFromLibrary).length;
process.stdout.write(`${checkOnly ? "Verified" : "Generated"} ${outputFiles.length} static pages (${modeCount} visible games): ${outputFiles.join(", ")}\n`);
