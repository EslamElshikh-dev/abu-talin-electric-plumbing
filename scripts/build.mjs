import { cp, mkdir } from "node:fs/promises";

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
  "sitemap.xml"
];

await mkdir("public", { recursive: true });
await Promise.all(files.map((file) => cp(file, `public/${file}`)));
console.log(`Prepared ${files.length} static files in public/.`);
