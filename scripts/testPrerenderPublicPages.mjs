import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { gamesList } from "../js/games.js?v=20261127-19";
import { libraryCategories, libraryModesFor } from "../js/gameCategories.js?v=20261118-30";
import { homeSeoMetadata, categorySeoMetadata, publicSeoMetadata } from "../js/seoMetadata.js?v=20261127-1";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://grygrupowe.pages.dev";
const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
const routes = [...sitemap.matchAll(/<loc>\s*([^<]+)\s*<\/loc>/g)].map(([, href]) => new URL(href.trim()).pathname);
const filenameFor = route => path.join(root, route === "/" ? "index.html" : `${route.slice(1)}.html`);

test("sitemap has eleven unique static pages", () => {
  assert.equal(routes.length, 11);
  assert.equal(new Set(routes).size, routes.length);
});

test("each sitemap page has unique metadata and readable content before JavaScript", async () => {
  const canonicalUrls = new Set();
  for (const route of routes) {
    const html = await readFile(filenameFor(route), "utf8");
    const category = libraryCategories.find(item => item.path === route);
    const metadata = route === "/"
      ? homeSeoMetadata
      : Object.values(publicSeoMetadata).find(item => item.path === route)
        || (category ? { path: category.path, ...categorySeoMetadata[category.id] } : null);
    assert.ok(metadata, `SEO metadata for ${route}`);
    const expectedTitle = route === "/" ? metadata.title : `${metadata.title} · Gry grupowe`;
    assert.ok(html.includes(`<title>${expectedTitle}</title>`), `title for ${route}`);
    assert.ok(html.includes(`<meta name="description" content="${metadata.description}">`), `description for ${route}`);
    const canonical = `${origin}${route}`;
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}">`), `canonical for ${route}`);
    assert.ok(!canonicalUrls.has(canonical), `canonical is unique: ${canonical}`);
    canonicalUrls.add(canonical);
    assert.doesNotMatch(html, /Ładuję stronę…|route-loading/);
    assert.match(html, /<h1\b[^>]*>[^<]+/);
    assert.ok(html.indexOf("<h1") < html.indexOf("<script type=\"module\""), `content precedes JavaScript for ${route}`);
  }
});

test("category pages list the games that belong to each category", async () => {
  for (const category of libraryCategories) {
    const html = await readFile(filenameFor(category.path), "utf8");
    const expected = libraryModesFor(gamesList, category.id);
    const actual = [...html.matchAll(/class="seo-mode-card" id="mode-([^"]+)"/g)];
    assert.equal(actual.length, expected.length, `${category.name} game count`);
    for (const mode of expected) {
      const anchor = String(mode.id).replace(/[^a-z0-9_-]/gi, "-");
      assert.ok(html.includes(`id="mode-${anchor}"`), `${category.name}: ${mode.name}`);
    }
    assert.match(html, /href="\/tryby-gry"/);
  }
});

test("all-games page includes descriptions and category links", async () => {
  const html = await readFile(filenameFor("/tryby-gry"), "utf8");
  const entries = [...html.matchAll(/<article id="mode-[^"]+"/g)];
  assert.equal(entries.length, gamesList.length);
  for (const category of libraryCategories) assert.ok(html.includes(`href="${category.path}"`), `${category.name} link`);
});
