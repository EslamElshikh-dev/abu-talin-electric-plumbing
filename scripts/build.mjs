import { cp, mkdir, rm } from "node:fs/promises";

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

const directories = ["assets", "services"];

await rm("public", { recursive: true, force: true });
await mkdir("public", { recursive: true });
await Promise.all([
  ...files.map((file) => cp(file, `public/${file}`)),
  ...directories.map((directory) => cp(directory, `public/${directory}`, { recursive: true }))
]);
console.log(`Prepared ${files.length} root files and ${directories.length} asset directories in public/.`);
