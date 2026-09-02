import { access, readFile } from "node:fs/promises";
import { services } from "./services-data.mjs";

const productionFiles = [
  "index.html",
  "services.html",
  "about.html",
  "contact.html",
  "styles.css",
  "script.js",
  "icons.svg",
  "favicon.svg",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "vercel.json"
];

const servicePages = services.map((service) => `services/${service.slug}.html`);
const serviceImages = services.map((service) => `assets/services/${service.image}`);
const htmlFiles = [...productionFiles.filter((file) => file.endsWith(".html")), ...servicePages];

await Promise.all([...productionFiles, ...servicePages, ...serviceImages].map((file) => access(file)));

const pageEntries = await Promise.all(htmlFiles.map(async (file) => [file, await readFile(file, "utf8")]));
const iconSprite = await readFile("icons.svg", "utf8");
const iconIds = new Set([...iconSprite.matchAll(/<symbol id="([^"]+)"/g)].map((match) => match[1]));
const required = ["أبو تالين", "0534078570", "966534078570"];

for (const [file, page] of pageEntries) {
  for (const value of required) {
    if (!page.includes(value)) throw new Error(`${file}: missing required value ${value}`);
  }
  if (page.includes("mobile-bar")) throw new Error(`${file}: legacy mobile bar is still present`);
  if (!page.includes('class="floating-actions"')) throw new Error(`${file}: floating actions are missing`);
  if (!page.includes("styles.css?v=20260905")) throw new Error(`${file}: stylesheet cache version is stale`);

  for (const match of page.matchAll(/icons\.svg(?:\?v=\d+)?#([a-z-]+)/g)) {
    if (!iconIds.has(match[1])) throw new Error(`${file}: unknown icon reference ${match[1]}`);
  }

  for (const match of page.matchAll(/<img[^>]+src="\/([^"]+)"/g)) {
    await access(match[1]);
  }
}

const forbidden = ["يوسف للكهرباء", "أبو ريان", "0557466230", "966557466230", "codex-preview", "google-site-verification", "googletagmanager"];
for (const value of forbidden) {
  if (pageEntries.some(([, page]) => page.includes(value))) throw new Error(`Found source-project data: ${value}`);
}

for (const service of services) {
  const detailPage = pageEntries.find(([file]) => file === `services/${service.slug}.html`)?.[1] ?? "";
  if (!detailPage.includes(service.title) || !detailPage.includes(`/assets/services/${service.image}`)) {
    throw new Error(`Incomplete detail page for ${service.slug}`);
  }
}

const sitemap = await readFile("sitemap.xml", "utf8");
for (const service of services) {
  if (!sitemap.includes(`/services/${service.slug}`)) throw new Error(`Sitemap missing ${service.slug}`);
}

console.log(`Validated ${pageEntries.length} HTML pages, ${serviceImages.length} generated service images, and ${iconIds.size} SVG icons.`);
