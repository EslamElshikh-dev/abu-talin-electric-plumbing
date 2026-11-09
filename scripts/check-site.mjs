import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { services, site, retiredServiceSlugs } from './services-data.mjs';

const activePages = ['index.html', 'services.html', 'about.html', 'contact.html', ...services.map(s => `services/${s.slug}.html`)];
const retiredPages = retiredServiceSlugs.map(slug => `services/${slug}.html`);
const pages = [...activePages, ...retiredPages];
const iconIds = new Set([...(await readFile('icons.svg', 'utf8')).matchAll(/<symbol id="([^"]+)"/g)].map(m => m[1]));
const allHtml = new Map(await Promise.all(pages.map(async file => [file, await readFile(file, 'utf8')])));
const urlFor = file => `${site.origin}/${file === 'index.html' ? '' : file.replace(/\.html$/, '')}`;
const fileFor = path => path === '/' ? 'index.html' : `${path.replace(/^\//, '').replace(/\.html$/, '')}.html`;

for (const [file, html] of allHtml) {
  const active = activePages.includes(file);
  assert(html.includes('<html lang="ar" dir="rtl">'), `${file}: Arabic RTL document missing`);
  assert.equal([...html.matchAll(/<h1(?:\s[^>]*)?>/g)].length, 1, `${file}: expected one H1`);
  assert(html.includes(site.name) && html.includes(site.phoneDisplay), `${file}: business identity missing`);
  assert(html.includes('styles.css?v=2026110903'), `${file}: stale stylesheet URL`);
  assert(html.includes('class="floating-actions"'), `${file}: floating contacts missing`);
  assert(!html.includes('mobile-bar'), `${file}: legacy fixed mobile bar`);
  const canonical = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)];
  assert.equal(canonical.length, 1, `${file}: expected one canonical`);
  assert.equal(canonical[0][1], urlFor(file), `${file}: incorrect canonical`);
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1] ?? '';
  assert(active ? !robots.includes('noindex') : robots.includes('noindex'), `${file}: wrong indexing policy`);
  const blocks = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
  assert.equal(blocks.length, 1, `${file}: expected one centralized JSON-LD graph`);
  const schema = JSON.parse(blocks[0][1]);
  assert.equal(schema['@context'], 'https://schema.org');
  assert(Array.isArray(schema['@graph']), `${file}: graph missing`);
  const graph = schema['@graph'];
  const ids = graph.filter(n => n['@id']).map(n => n['@id']);
  assert.equal(ids.length, new Set(ids).size, `${file}: duplicate graph definitions`);
  const business = graph.find(n => n['@id'] === `${site.origin}/#business`);
  assert.equal(business?.name, site.name, `${file}: schema name mismatch`);
  assert.equal(business?.telephone, site.phoneInternational, `${file}: schema phone mismatch`);
  assert.equal(business?.areaServed?.name, 'الرياض', `${file}: wrong service area`);
  assert(!business.aggregateRating && !business.review && !business.geo, `${file}: unverified ratings or coordinates`);
  assert.equal(graph.filter(n => n['@type'] === 'WebSite').length, 1, `${file}: WebSite duplicates`);
  const offers = business.hasOfferCatalog.itemListElement;
  assert.equal(offers.length, services.length, `${file}: catalog mismatch`);
  for (const offer of offers) assert(ids.includes(offer.itemOffered['@id']), `${file}: unresolved catalog reference`);
  for (const service of graph.filter(n => n['@type'] === 'Service')) {
    assert.equal(service.provider['@id'], business['@id'], `${file}: wrong provider`);
    assert(services.some(s => s.title === service.name), `${file}: inactive service in schema`);
  }
  for (const m of html.matchAll(/icons\.svg(?:\?v=\d+)?#([a-z-]+)/g)) assert(iconIds.has(m[1]), `${file}: unknown icon ${m[1]}`);
  for (const m of html.matchAll(/<img\b([^>]+)>/g)) {
    const a = m[1];
    assert(/\balt="[^"]*"/.test(a), `${file}: image alt missing`);
    assert(/\bwidth="\d+"/.test(a) && /\bheight="\d+"/.test(a), `${file}: image dimensions missing`);
    const src = a.match(/\bsrc="([^"]+)"/)?.[1];
    if (src?.startsWith('/')) await access(src.slice(1));
  }
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (href.startsWith('tel:')) assert.equal(href, `tel:${site.phoneInternational}`, `${file}: wrong phone link`);
    if (href.includes('wa.me/')) assert.equal(new URL(href).pathname, `/${site.whatsapp}`, `${file}: wrong WhatsApp target`);
    if (!href.startsWith('/') || href.startsWith('//')) continue;
    const target = new URL(href, site.origin);
    if (/\.(svg|png|webp|css|js|webmanifest|xml)$/.test(target.pathname)) { await access(target.pathname.slice(1)); continue; }
    const linkedFile = fileFor(target.pathname);
    assert(allHtml.has(linkedFile), `${file}: broken link ${href}`);
    if (active) assert(!retiredPages.includes(linkedFile), `${file}: inactive service link`);
    if (target.hash) assert(allHtml.get(linkedFile).includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `${file}: missing anchor ${href}`);
  }
  for (const value of ['0534078570', '966534078570', 'أبو تالين للكهرباء والسباكة', 'خدمات الكهرباء', 'خدمات السباكة', 'googletagmanager', 'google-site-verification', 'codex-preview']) {
    assert(!html.includes(value), `${file}: stale content ${value}`);
  }
}
const sitemap = await readFile('sitemap.xml', 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
assert.deepEqual(urls.sort(), activePages.map(urlFor).sort(), 'Sitemap must contain exactly the active pages');
const listGraph = JSON.parse([...allHtml.get('services.html').matchAll(/type="application\/ld\+json">([\s\S]*?)<\/script>/g)][0][1])['@graph'];
const list = listGraph.find(n => n['@type'] === 'ItemList');
assert.equal(list.numberOfItems, services.length);
assert.deepEqual(list.itemListElement.map(n => n.position), [1, 2, 3]);
JSON.parse(await readFile('manifest.webmanifest', 'utf8'));
JSON.parse(await readFile('vercel.json', 'utf8'));
console.log(`Validated ${activePages.length} active pages, ${retiredPages.length} noindex legacy pages, schema references, canonicals, sitemap, assets and contact links.`);
