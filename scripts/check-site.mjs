import { readFile, access } from "node:fs/promises";

const files = [
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

await Promise.all(files.map((file) => access(file)));

const pages = await Promise.all(files.filter((file) => file.endsWith(".html")).map((file) => readFile(file, "utf8")));
const iconSprite = await readFile("icons.svg", "utf8");
const iconIds = new Set([...iconSprite.matchAll(/<symbol id="([^"]+)"/g)].map((match) => match[1]));
const required = ["أبو تالين", "0534078570", "966534078570"];

for (const value of required) {
  if (!pages.every((page) => page.includes(value))) {
    throw new Error(`Missing required value: ${value}`);
  }
}

const forbidden = ["يوسف للكهرباء", "أبو ريان", "0557466230", "966557466230", "codex-preview", "google-site-verification", "googletagmanager"];
for (const value of forbidden) {
  if (pages.some((page) => page.includes(value))) {
    throw new Error(`Found source-project data: ${value}`);
  }
}

for (const page of pages) {
  for (const match of page.matchAll(/icons\.svg#([a-z-]+)/g)) {
    if (!iconIds.has(match[1])) {
      throw new Error(`Unknown icon reference: ${match[1]}`);
    }
  }
}

console.log(`Validated ${pages.length} HTML pages, ${files.length} production files, and ${iconIds.size} icons.`);
