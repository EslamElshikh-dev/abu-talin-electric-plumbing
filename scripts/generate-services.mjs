import { mkdir, writeFile } from "node:fs/promises";
import { services, site, retiredServiceSlugs } from "./services-data.mjs";

const cssVersion = "2026111401";
const iconVersion = "2026110903";
const scriptVersion = "2026110903";

const categoryLabel = (service) => ({ electric: "كهرباء", water: "سباكة", finishing: "ديكور وتشطيب" })[service.category];
const categoryHeading = (service) => ({ electric: "خدمة كهربائية", water: "خدمة سباكة", finishing: "خدمة ديكور وتشطيب" })[service.category];
const categoryClass = (service) => service.category === "water" ? " catalog-card--water" : service.category === "finishing" ? " catalog-card--finishing" : "";
const serviceUrl = (service) => `${site.origin}/services/${service.slug}`;
const imageUrl = (service) => `${site.origin}/assets/services/${service.image}`;
const whatsappUrl = (service) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`مرحبًا، أريد طلب خدمة ${service.title} في الرياض.`)}`;
const icon = (name, fill = false) => `<svg class="icon-svg${fill ? " icon-svg--fill" : ""}" aria-hidden="true"><use href="/icons.svg?v=${iconVersion}#${name}"></use></svg>`;

function header(active = "services") {
  return `<a class="skip-link" href="#main-content">انتقل إلى المحتوى</a>
  <div class="topbar"><div class="container topbar__inner"><p><span class="status-dot"></span> ساندويتش بانل وجبس وديكور في الرياض</p><span><a href="tel:${site.phoneInternational}">اتصال: <bdi>${site.phoneDisplay}</bdi></a> · نطاق الخدمة: مدينة الرياض</span></div></div>
  <header class="site-header"><div class="container header-shell">
    <a class="brand" href="/" aria-label="${site.name} - الرئيسية"><span class="brand-mark" aria-hidden="true"><svg class="brand-mark__logo"><use href="/icons.svg?v=${iconVersion}#brand"></use></svg></span><span><strong>${site.name}</strong><small>ساندويتش بانل · جبس · ديكور</small></span></a>
    <nav class="desktop-nav" aria-label="التنقل الرئيسي"><a href="/"${active === "home" ? " aria-current=\"page\"" : ""}>الرئيسية</a><a href="/services"${active === "services" ? " aria-current=\"page\"" : ""}>الخدمات</a><a href="/about"${active === "about" ? " aria-current=\"page\"" : ""}>من نحن</a><a href="/contact"${active === "contact" ? " aria-current=\"page\"" : ""}>تواصل معنا</a></nav>
    <a class="header-cta" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noreferrer">${icon("whatsapp", true)}ناقش مشروعك</a>
    <button class="menu-button" type="button" aria-label="فتح قائمة التنقل" aria-expanded="false" data-menu-button><span></span><span></span><span></span></button>
  </div></header>
  <nav class="mobile-menu" aria-label="التنقل على الجوال" data-mobile-menu hidden><a href="/">الرئيسية</a><a href="/services">جميع الخدمات</a><a href="/about">من نحن</a><a href="/contact">تواصل معنا</a><a class="menu-call" href="tel:${site.phoneInternational}">اتصل الآن — <bdi>${site.phoneDisplay}</bdi></a></nav>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true"><svg class="brand-mark__logo"><use href="/icons.svg?v=${iconVersion}#brand"></use></svg></span><span><strong>${site.name}</strong><small>للأسقف والجدران داخل مدينة الرياض</small></span></a><p>تركيب ساندويتش بانل وديكورات جبس بورد وجدران وأسقف للمنازل والفلل والمنشآت في الرياض.</p></div><div class="footer-links"><h2>روابط الموقع</h2><a href="/services">الخدمات</a><a href="/about">من نحن</a><a href="/contact">تواصل معنا</a></div><div class="footer-links"><h2>التواصل</h2><a href="tel:${site.phoneInternational}"><bdi>${site.phoneDisplay}</bdi></a><a href="https://wa.me/${site.whatsapp}" target="_blank" rel="noreferrer">واتساب</a><span>مدينة الرياض</span></div></div><div class="footer-bottom"><span>© <span data-year>2026</span> ${site.name} — جميع الحقوق محفوظة.</span><a class="developer-signature eslam-credit" data-eslam-signature="v1" href="https://www.eslam-elshikh.com/" target="_blank" rel="noopener noreferrer" aria-label="موقع المهندس إسلام الشيخ — تصميم وبرمجة وتطوير الموقع، يفتح في تبويب جديد" dir="rtl"><span class="eslam-credit__mark" aria-hidden="true"><img src="data:image/webp;base64,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" width="30" height="30" loading="lazy" decoding="async" alt=""></span><span class="eslam-credit__copy"><span class="eslam-credit__role">تصميم وتطوير</span><strong class="eslam-credit__name">المهندس إسلام الشيخ</strong></span><svg class="eslam-credit__arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg></a></div></div></footer>
  <div class="floating-actions" aria-label="تواصل سريع">
    <a class="float-btn float-btn--call" href="tel:${site.phoneInternational}" aria-label="اتصل الآن على ${site.phoneDisplay}" title="اتصل الآن">${icon("phone")}</a>
    <a class="float-btn float-btn--whatsapp" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noreferrer" aria-label="تواصل عبر واتساب" title="واتساب">${icon("whatsapp", true)}</a>
  </div>
  <script src="/script.js?v=${scriptVersion}" defer></script>`;
}

function serviceCard(service, heading = "h3", eager = false) {
  return `<article class="catalog-card${categoryClass(service)}">
    <a class="catalog-card__media" href="/services/${service.slug}" aria-label="تفاصيل ${service.title}"><img src="/assets/services/${service.image}" alt="${service.imageAlt ?? `صورة توضيحية لخدمة ${service.title} في الرياض`}" width="1200" height="800" ${eager ? "fetchpriority=\"high\"" : "loading=\"lazy\""} decoding="async">${service.category === "finishing" ? '<span class="illustration-label">رسم توضيحي</span>' : ""}</a>
    <div class="catalog-card__body"><div class="catalog-card__top"><b>${icon(service.icon)}</b><span>${categoryLabel(service)}</span></div><${heading}><a href="/services/${service.slug}">${service.title}</a></${heading}><p>${service.summary}</p><a class="catalog-card__link" href="/services/${service.slug}">تفاصيل الخدمة <span aria-hidden="true">←</span></a></div>
  </article>`;
}

function documentHead({ title, description, canonical, ogType = "website", image = site.shareImage, schema = [], robots = "index, follow, max-image-preview:large, max-snippet:-1" }) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="#071d35">
  <link rel="canonical" href="${canonical}">
  <link rel="manifest" href="/manifest.webmanifest?v=${iconVersion}">
  <link rel="icon" href="/assets/brand/icon-48.png?v=${iconVersion}" sizes="48x48" type="image/png">
  <link rel="icon" href="/favicon.svg?v=${iconVersion}" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png?v=${iconVersion}" sizes="180x180">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="/styles.css?v=${cssVersion}">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:type" content="${ogType}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="${site.name}">
${image ? `  <meta property="og:image" content="${image}"><meta property="og:image:width" content="${image === site.shareImage ? site.shareImageWidth : 1200}"><meta property="og:image:height" content="${image === site.shareImage ? site.shareImageHeight : 800}">\n` : ""}  <meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">
  <meta property="og:image:alt" content="${image === site.shareImage ? site.name : title}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">
  <meta name="twitter:image:alt" content="${image === site.shareImage ? site.name : title}">
  <script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": [...commonGraph(), ...schema] }).replace(/</g, "\\u003c")}</script>
<meta name="creator" content="المهندس إسلام الشيخ"><style id="eslam-developer-credit-style">:root{--es-credit-accent:var(--electric,#ffbd48)}
/* Unified developer signature: Eslam Elshikh. Keep client branding and rights intact. */
.eslam-credit.eslam-credit{display:inline-flex;align-items:center;justify-content:flex-start;gap:10px;position:relative;isolation:isolate;flex:0 1 auto;max-width:100%;min-height:52px;width:max-content;padding:8px 12px;border:1px solid color-mix(in srgb,var(--es-credit-accent) 36%,transparent);border-radius:14px;background:color-mix(in srgb,var(--es-credit-accent) 7%,transparent);color:inherit;font:inherit;line-height:1.6;text-align:start;text-decoration:none;box-shadow:inset 0 1px 0 #ffffff0c;transition:border-color .2s ease,background-color .2s ease,transform .2s ease;white-space:normal;vertical-align:middle;box-sizing:border-box}
.eslam-credit.eslam-credit::before,.eslam-credit.eslam-credit::after{content:none;display:none}
.eslam-credit.eslam-credit:hover{color:inherit;border-color:var(--es-credit-accent);background:color-mix(in srgb,var(--es-credit-accent) 13%,transparent);transform:translateY(-2px);text-decoration:none}
.eslam-credit.eslam-credit:focus-visible{outline:2px solid var(--es-credit-accent);outline-offset:4px}
.eslam-credit .eslam-credit__mark{display:grid;place-items:center;flex:0 0 34px;width:34px;height:36px;border:1px solid color-mix(in srgb,var(--es-credit-accent) 35%,transparent);border-radius:10px;background:color-mix(in srgb,var(--es-credit-accent) 22%,#11151b);overflow:hidden}
.eslam-credit .eslam-credit__mark img{display:block;position:static;width:30px;height:30px;max-width:none;object-fit:contain;border:0;border-radius:0;filter:grayscale(1);mix-blend-mode:screen;opacity:1;transform:none}
.eslam-credit .eslam-credit__copy{display:block;min-width:0;text-align:start}
.eslam-credit .eslam-credit__role{display:block;font-size:10px;font-weight:400;line-height:1.5;letter-spacing:0;opacity:.78}
.eslam-credit .eslam-credit__name{display:block;margin:2px 0 0;font-size:12px;font-weight:600;line-height:1.7;letter-spacing:0;color:inherit;overflow-wrap:anywhere}
.eslam-credit .eslam-credit__arrow{display:block;position:static;flex:0 0 14px;width:14px;height:14px;margin-inline-start:3px;fill:none;stroke:var(--es-credit-accent);stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.eslam-credit-slot{display:flex;align-items:center;justify-content:flex-end;flex-wrap:wrap;gap:12px;width:100%;max-width:1200px;margin:0 auto;padding:16px 20px;box-sizing:border-box}
@media(max-width:480px){.eslam-credit.eslam-credit{gap:8px;padding:8px 10px;min-height:50px}.eslam-credit .eslam-credit__name{font-size:11px}.eslam-credit .eslam-credit__role{font-size:9px}.eslam-credit-slot{justify-content:center;padding:16px}}
@media(prefers-reduced-motion:reduce){.eslam-credit.eslam-credit{transition:none}.eslam-credit.eslam-credit:hover{transform:none}}
</style></head>`;
}


const modified = "2026-11-14";
const businessId = `${site.origin}/#business`;
const websiteId = `${site.origin}/#website`;
const city = { "@type": "City", name: "الرياض" };
const serviceId = (service) => `${serviceUrl(service)}#service`;
const contactLink = (service) => `/contact${service ? `?service=${service.slug}` : ""}`;

function commonGraph() {
  return [
    {
      "@type": "HomeAndConstructionBusiness", "@id": businessId,
      name: site.name, url: `${site.origin}/`, description: site.description,
      telephone: site.phoneInternational,
      address: { "@type": "PostalAddress", addressLocality: "الرياض", addressRegion: "منطقة الرياض", addressCountry: "SA" },
      areaServed: city,
      openingHoursSpecification: site.hours.map((period) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: period.days.map((day) => `https://schema.org/${day}`),
        opens: period.closed ? "00:00" : period.opens,
        closes: period.closed ? "00:00" : period.closes
      })),
      logo: { "@type": "ImageObject", "@id": `${site.origin}/#logo`, url: `${site.origin}/assets/brand/icon-512.png`, width: 512, height: 512, caption: site.name },
      image: { "@id": `${site.origin}/#brand-image` },
      contactPoint: { "@type": "ContactPoint", telephone: site.phoneInternational, contactType: "customer service", availableLanguage: ["ar"], areaServed: city },
      hasOfferCatalog: { "@type": "OfferCatalog", name: "خدمات الساندويتش بانل والجبس والديكور", itemListElement: services.map((service) => ({ "@type": "Offer", itemOffered: { "@id": serviceId(service) } })) }
    },
    { "@type": "WebSite", "@id": websiteId, url: `${site.origin}/`, name: site.name, inLanguage: "ar-SA", publisher: { "@id": businessId }, creator: { "@id": "https://www.eslam-elshikh.com/#person" }, creditText: "تصميم وبرمجة وتطوير الموقع: المهندس إسلام الشيخ" },
    { "@type": "Person", "@id": "https://www.eslam-elshikh.com/#person", name: "إسلام الشيخ", alternateName: ["المهندس إسلام الشيخ", "Eslam Elshikh"], url: "https://www.eslam-elshikh.com/", sameAs: ["https://github.com/EslamElshikh-dev"] },
    { "@type": "ImageObject", "@id": `${site.origin}/#brand-image`, url: site.shareImage, contentUrl: site.shareImage, width: site.shareImageWidth, height: site.shareImageHeight, caption: site.name, inLanguage: "ar-SA" },
    ...services.map((service) => ({ "@type": "Service", "@id": serviceId(service), name: service.title, serviceType: service.title, description: service.summary, url: serviceUrl(service), image: imageUrl(service), areaServed: city, provider: { "@id": businessId } }))
  ];
}

function pageSchema(path, name, description, type = "WebPage", extra = {}) {
  const url = `${site.origin}${path}`;
  const page = { "@type": type, "@id": `${url}#webpage`, url, name, description, inLanguage: "ar-SA", isPartOf: { "@id": websiteId }, about: { "@id": businessId }, primaryImageOfPage: { "@id": `${site.origin}/#brand-image` }, ...extra };
  if (path === "/") return [page];
  const crumbs = [{ "@type": "ListItem", position: 1, name: "الرئيسية", item: `${site.origin}/` }];
  if (path.startsWith("/services/")) crumbs.push({ "@type": "ListItem", position: 2, name: "الخدمات", item: `${site.origin}/services` });
  crumbs.push({ "@type": "ListItem", position: crumbs.length + 1, name, item: url });
  page.breadcrumb = { "@id": `${url}#breadcrumb` };
  return [page, { "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: crumbs }];
}

function actions(service, dark = false) {
  return `<div class="hero__actions"><a class="button button--primary" href="${service ? whatsappUrl(service) : `https://wa.me/${site.whatsapp}`}" target="_blank" rel="noopener noreferrer">${icon("whatsapp", true)}ناقش مشروعك عبر واتساب</a><a class="button ${dark ? "button--outline" : "button--dark"}" href="tel:${site.phoneInternational}">${icon("phone")}<bdi>${site.phoneDisplay}</bdi></a></div>`;
}
function banner(title = "خلّ الفكرة تبدأ من التفاصيل", description = "أرسل الحي والمقاسات التقريبية وصورة الفكرة، لنحدد معك نطاق العمل والخامات المناسبة.") {
  return `<section class="contact-banner"><div class="container contact-banner__inner"><div><span class="eyebrow eyebrow--light">مشروعك القادم</span><h2>${title}</h2><p>${description}</p></div><div class="contact-banner__actions"><a class="button button--primary" href="/contact">جهّز طلبك ${icon("services")}</a><a class="button button--water" href="tel:${site.phoneInternational}">${icon("phone")}اتصل بأبو تالين</a></div></div></section>`;
}
function faq(items, title = "تفاصيل تساعدك قبل البداية") {
  return `<section class="section section--soft" id="faq"><div class="container faq-layout"><div><span class="eyebrow">أسئلة شائعة</span><h2>${title}</h2><p>اختيار الخامة والتصميم يبدأ بفهم المساحة ونطاق الاستخدام.</p><a class="text-link" href="/contact">ناقش تفاصيل موقعك معنا ←</a></div><div class="faq">${items.map(([q,a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join("")}</div></div></section>`;
}
const homeFaqs = [
  ["ما الخدمات التي يقدمها أبو تالين في الرياض؟", "تشمل الخدمات تركيب الساندويتش بانل للأسقف والجدران، وأعمال الجبس بورد والقواطع، وديكورات الجدران والأسقف. يُحدد نطاق كل مشروع والمواد المناسبة بعد مراجعة الموقع والتفاصيل."],
  ["ما الفرق بين الساندويتش بانل والجبس بورد؟", "يختلف الاستخدام والخامة وطريقة التثبيت بينهما. تُراجع حاجة الموقع أولًا: تغطية أو تقسيم بألواح بانل، أم سقف أو قاطع جبس بورد وتفاصيل ديكور داخلية. لا تُعامل الخامتان كبديلين متطابقين لكل استخدام."],
  ["كيف يتحدد سعر المشروع؟", "يعتمد على المساحة والخامة وسماكتها والتصميم وحالة الموقع والهيكل والفتحات المطلوبة. أرسل الأبعاد التقريبية والفكرة، وقد تحتاج بعض المواقع إلى معاينة قبل اعتماد العرض."],
  ["هل يمكن تنفيذ فكرة من صورة مرجعية؟", "نراجع الصورة مع أبعاد المساحة وارتفاعها والخامات المتاحة، ثم نحدد ما يناسب الموقع ونطاق التنفيذ المتفق عليه."],
  ["هل تخدمون أحياء الرياض؟", "نطاق الخدمة مدينة الرياض. أرسل اسم الحي ونوع الموقع لتأكيد إمكانية الزيارة والموعد المناسب."],
  ["ماذا أجهز قبل التواصل؟", "نوع الخدمة، اسم الحي، نوع المساحة، أبعاد تقريبية إن توفرت، وصورة آمنة للموقع أو مرجع للتصميم. لا يلزم توفر مخطط متكامل لبدء مناقشة الطلب."]
];

function requestForm() {
 return `<section class="section request-section" id="request"><div class="container request-layout"><div class="request-intro"><span class="eyebrow">طلب مرتب من أول رسالة</span><h2>عندك مساحة؟<br><span>خلّنا نعرف فكرتك.</span></h2><p>اختر الخدمة وأضف ما تعرفه عن الموقع. سنجهّز لك رسالة لمراجعتها داخل واتساب قبل إرسالها.</p><div class="brief-points"><span>${icon("home")}الحي ونوع المساحة</span><span>${icon("services")}المقاسات أو الفكرة</span><span>${icon("shield")}نطاق واضح قبل التنفيذ</span></div><a class="direct-contact" href="tel:${site.phoneInternational}">تفضّل الاتصال؟ <bdi>${site.phoneDisplay}</bdi> ←</a></div><form class="project-form" data-project-form aria-label="تجهيز طلب مشروع عبر واتساب"><div class="project-form__top"><span>تفاصيل مشروعك</span><small>المقاسات التقريبية تكفي للبدء</small></div><label for="project-service">الخدمة المطلوبة</label><select name="service" id="project-service">${services.map((s) => `<option value="${s.slug}">${s.title}</option>`).join("")}</select><div class="form-row"><div><label for="project-district">الحي في الرياض <small>اختياري</small></label><input id="project-district" name="district" type="text" maxlength="80" autocomplete="address-level3" placeholder="مثال: حي الياسمين"></div><div><label for="project-space">نوع المساحة <small>اختياري</small></label><select id="project-space" name="space"><option value="">اختر نوع الموقع</option><option>منزل أو فيلا</option><option>مكتب أو محل</option><option>ملحق أو مساحة أخرى</option></select></div></div><label for="project-details">المقاسات والفكرة <small>اختياري</small></label><textarea name="details" id="project-details" rows="3" maxlength="700" placeholder="أبعاد تقريبية، سقف أو جدار، أو وصف الفكرة المطلوبة..."></textarea><a class="button button--dark project-form__submit" data-quote-link href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener noreferrer">${icon("whatsapp",true)}جهّز رسالتي على واتساب <span aria-hidden="true">←</span></a><p class="form-note">راجع الرسالة وأضف صور الموقع داخل واتساب قبل الإرسال. السعر والموعد بعد مراجعة التفاصيل.</p></form></div></section>`;
}

function home() {
 const schema = pageSchema("/", site.name, site.description, "WebPage", { mainEntity: { "@id": businessId } });
 return `${documentHead({title:`${site.name} | الرياض`,description:site.description,canonical:`${site.origin}/`,schema})}<body>${header("home")}<main id="main-content">
 <section class="atelier-hero"><div class="container atelier-hero__grid"><div class="atelier-hero__copy"><span class="eyebrow eyebrow--light">حلول للأسقف والجدران · الرياض</span><h1>ساندويتش بانل<br> <span>وديكور ابو تالين</span></h1><p class="atelier-hero__lede">من تغطية المساحة إلى تفاصيلها الأخيرة.</p><p>تركيب ألواح الساندويتش بانل، وأعمال الجبس بورد وديكورات الجدران والأسقف؛ بفكرة تناسب المكان، ونطاق عمل واضح قبل البداية.</p>${actions(null,true)}<div class="hero-facts"><span>${icon("home")}منازل ومنشآت</span><span>${icon("services")}بانل · جبس · ديكور</span><span>${icon("shield")}داخل الرياض</span></div></div><div class="blueprint-visual"><div class="blueprint-visual__top"><span>من الخامة إلى المساحة</span><b>01 / 03</b></div><div class="blueprint-visual__image"><img src="/assets/services/sandwich-panel.webp" width="1200" height="800" alt="رسم توضيحي لطبقات ألواح الساندويتش بانل وتفاصيل تكوينها" fetchpriority="high" decoding="async"></div><div class="blueprint-visual__caption"><span class="illustration-label">رسم توضيحي</span><strong>طبقات متكاملة.<br>وتفاصيل تستحق الاهتمام.</strong><small>تُحدد مواصفات الألواح والتثبيت حسب الاستخدام وحالة الموقع.</small></div><div class="visual-services">${services.map((s,i)=>`<a href="/services/${s.slug}"><b>0${i+1}</b><span>${s.title}</span>${icon(s.icon)}</a>`).join("")}</div></div></div></section>
 <section class="service-overview section" id="services"><div class="container"><div class="section-head section-head--split"><div><span class="eyebrow">ثلاثة مسارات. وتفاصيل تخص مكانك.</span><h2>اختَر الخدمة الأقرب لفكرتك</h2></div><p>لكل مساحة احتياج مختلف. استعرض نطاق كل خدمة، ثم أرسل لنا تفاصيل موقعك.</p></div><div class="catalog">${services.map(s=>serviceCard(s)).join("")}</div></div></section>
 <section class="section section--warm"><div class="container design-story"><div class="design-story__media"><img src="/assets/services/gypsum-board.webp" width="1200" height="800" loading="lazy" decoding="async" alt="رسم توضيحي لتنسيق سقف جبس بورد مع الإضاءة المحيطية"><span class="media-note">تصوّر توضيحي للديكور</span></div><div class="design-story__copy"><span class="eyebrow">التفاصيل قبل التنفيذ</span><h2>مساحة متناسقة<br><em>تبدأ بقرارات واضحة.</em></h2><p>المقاسات، وارتفاع السقف، والخامة، والفتحات؛ تفاصيل صغيرة تصنع فرقًا في شكل المكان واستخدامه. نناقشها معك قبل تحديد الأعمال المطلوبة.</p><div class="decision-list"><div><b>01</b><span><strong>نفهم المساحة</strong><small>نوع الموقع، أبعاده، وحالته الحالية.</small></span></div><div><b>02</b><span><strong>ننسّق الفكرة والخامة</strong><small>التصميم، الألواح، الحواف، ومواقع الفتحات.</small></span></div><div><b>03</b><span><strong>نوضح نطاق العمل</strong><small>بنود التنفيذ وما يحتاج إلى معاينة أو تنسيق إضافي.</small></span></div></div><a class="text-link" href="/about">تعرّف على طريقة عملنا ←</a></div></div></section>
 <section class="section"><div class="container"><div class="section-head"><span class="eyebrow">من الفكرة إلى مراجعة التفاصيل</span><h2>خطوات مشروعك مع أبو تالين</h2></div><div class="project-steps">${[["أرسل فكرتك","الخدمة والحي والمقاسات التقريبية أو صورة مرجعية."],["مراجعة الموقع","تحديد حالة المساحة والحاجة إلى معاينة."],["اتفاق على النطاق","توضيح الخامة والتصميم وبنود التنفيذ والموعد."],["تنفيذ ومراجعة","متابعة التركيب وتفاصيل الحواف والفتحات والتشطيب."]].map(([t,d],i)=>`<article><span>0${i+1}</span><h3>${t}</h3><p>${d}</p></article>`).join("")}</div></div></section>
 ${requestForm()}${faq(homeFaqs)}${banner()}</main>${footer()}</body></html>`;
}

function serviceIndex() {
 const name="خدمات الساندويتش بانل والجبس والديكور في الرياض";
 const description="استعرض تركيب الساندويتش بانل وأعمال الجبس بورد وديكورات الجدران والأسقف في الرياض، مع نطاق كل خدمة وخطوات تجهيز طلبك.";
 const list={"@type":"ItemList","@id":`${site.origin}/services#list`,name,numberOfItems:services.length,itemListElement:services.map((s,i)=>({"@type":"ListItem",position:i+1,url:serviceUrl(s),item:{"@id":serviceId(s)}}))};
 const schema=[...pageSchema("/services",name,description,"CollectionPage",{mainEntity:{"@id":list["@id"]}}),list];
 return `${documentHead({title:`الخدمات | ${site.name} بالرياض`,description,canonical:`${site.origin}/services`,schema})}<body>${header("services")}<main id="main-content"><section class="page-hero"><div class="container"><nav class="breadcrumbs" aria-label="مسار الصفحة"><a href="/">الرئيسية</a> / الخدمات</nav><span class="eyebrow">خدمات مترابطة للمساحة</span><h1>${name}</h1><p>من الألواح والتغطيات إلى الأسقف الداخلية والتفاصيل الجدارية. اختر الخدمة، واستعرض ما يشمله نطاقها قبل التواصل.</p></div></section><section class="section section--finishing" id="finishing-services"><div class="container"><div class="catalog">${services.map((s,i)=>serviceCard(s,"h2",i===0)).join("")}</div></div></section><section class="section section--warm"><div class="container"><div class="section-head"><span class="eyebrow">وضوح يساعدك في الاختيار</span><h2>أي خدمة أقرب لطلبك؟</h2></div><div class="service-comparison">${[[services[0],"تغطية أو تقسيم بألواح بانل","الأبعاد، حالة الهيكل، نوع الألواح، الفتحات والتثبيت."],[services[1],"سقف داخلي أو قاطع جبس بورد","ارتفاع السقف، التصميم، مواقع الإنارة، والتجهيز للتشطيب."],[services[2],"خلفية جدارية وتفاصيل ديكور","المقاسات، صورة الفكرة، مادة التكسية وتناسق التشطيبات."]].map(([s,t,d])=>`<article><span>${icon(s.icon)}</span><h3>${t}</h3><p>${d}</p><a class="text-link" href="/services/${s.slug}">تفاصيل ${s.title} ←</a></article>`).join("")}</div><p class="content-note">قد يجمع المشروع أكثر من خدمة؛ يُحدد نطاق كل جزء والخامات والموعد بعد مراجعة تفاصيل الموقع.</p></div></section>${requestForm()}${banner()}</main>${footer()}</body></html>`;
}

function servicePage(service) {
 const description=`${service.summary} اطلب ${service.title} في الرياض على ${site.phoneDisplay}.`;
 const schema=pageSchema(`/services/${service.slug}`,`${service.title} في الرياض`,description,"WebPage",{mainEntity:{"@id":serviceId(service)},primaryImageOfPage:{"@type":"ImageObject",url:imageUrl(service),width:1200,height:800,caption:service.imageAlt}});
 return `${documentHead({title:`${service.title} في الرياض | ${site.name}`,description,canonical:serviceUrl(service),image:imageUrl(service),schema})}<body>${header("services")}<main id="main-content"><section class="service-detail-hero"><div class="container service-hero-grid"><div class="service-hero-copy"><nav class="breadcrumbs" aria-label="مسار الصفحة"><a href="/">الرئيسية</a> / <a href="/services">الخدمات</a> / ${service.title}</nav><span class="eyebrow">${service.category==="finishing"?"حلول الأسقف والجدران":"خدمات أبو تالين"} · الرياض</span><h1>${service.title}</h1><p>${service.lede}</p>${actions(service,true)}<div class="hero-facts"><span>${icon("home")}منازل ومنشآت</span><span>${icon("shield")}نطاق واضح</span><span>${icon("services")}خدمة داخل الرياض</span></div></div><figure class="service-hero-media"><img src="/assets/services/${service.image}" width="1200" height="800" fetchpriority="high" decoding="async" alt="${service.imageAlt}"><figcaption><span>${icon(service.icon)}</span><div><b>${service.title}</b><small>رسم توضيحي للخدمة</small></div></figcaption></figure></div></section><section class="section service-detail-section"><div class="container service-layout"><article class="service-content"><section class="content-block"><span class="eyebrow">نطاق الخدمة</span><h2>ماذا تشمل ${service.title}؟</h2><p>${service.summary} تحدد حالة الموقع والخامة والتصميم تفاصيل العرض النهائي.</p><ul class="check-grid">${service.scope.map(t=>`<li>${icon("shield")}<span>${t}</span></li>`).join("")}</ul></section><section class="content-block content-block--soft"><span class="eyebrow eyebrow--water">حدّد احتياجك</span><h2>متى تناسبك هذه الخدمة؟</h2><div class="signal-grid">${service.signals.map((t,i)=>`<div><b>0${i+1}</b><span>${t}</span></div>`).join("")}</div></section><section class="content-block"><span class="eyebrow">طريقة العمل</span><h2>خطوات من الفكرة إلى التنفيذ</h2><div class="detail-process">${service.steps.map((t,i)=>`<div><b>${i+1}</b><span>${t}</span></div>`).join("")}</div><p class="content-note">تُناقش الأعمال الإضافية والخامات والفتحات المطلوبة ضمن نطاق واضح قبل التنفيذ.</p></section><section class="content-block content-block--split"><div><span class="eyebrow eyebrow--water">قبل المعاينة</span><h2>جهّز تفاصيل موقعك</h2><ul class="plain-checks"><li>اسم الحي ونوع المساحة واستخدامها.</li><li>المقاسات التقريبية وارتفاع السقف إن توفر.</li><li>صورة مرجعية للفكرة أو الخامة المطلوبة.</li><li>صور آمنة توضح الموقع والفتحات القائمة.</li></ul></div><aside class="safety-card"><span>${icon("shield")}</span><h3>تنسيق يراعي الموقع</h3><p>تُراجع نقاط التثبيت والتمديدات والفتحات قبل العمل، وتُنسّق الأعمال التي تتطلب مختصين بحسب نطاق المشروع.</p></aside></section></article><aside class="service-aside"><div class="request-card"><span class="request-card__icon">${icon(service.icon)}</span><small>مشروع داخل الرياض</small><h2>لنفهم فكرتك أكثر</h2><p>أرسل المقاسات والحي والفكرة المطلوبة. نراجع التفاصيل معك لتحديد النطاق والخامات المناسبة.</p><a class="button button--primary" href="${contactLink(service)}">جهّز تفاصيل طلبك ←</a><a class="button button--secondary" href="tel:${site.phoneInternational}">${icon("phone")}<bdi>${site.phoneDisplay}</bdi></a><div class="request-card__meta"><span>نطاق الخدمة</span><b>مدينة الرياض</b></div></div><a class="back-services" href="/services">${icon("services")}جميع الخدمات</a></aside></div></section>${faq(service.faqs,`أسئلة عن ${service.title}`)}<section class="section"><div class="container"><div class="section-head"><span class="eyebrow">تفاصيل تكمل مشروعك</span><h2>خدمات مرتبطة</h2></div><div class="catalog catalog--pair">${services.filter(s=>s.slug!==service.slug).map(s=>serviceCard(s)).join("")}</div></div></section>${banner(`عندك فكرة لـ${service.title}؟`)}</main>${footer()}</body></html>`;
}

function about() {
 const description="تعرّف على خدمات أبو تالين للساندويتش بانل والجبس والديكور في الرياض، وطريقة تحديد المقاسات والخامات ونطاق التنفيذ في موقع العميل.";
 return `${documentHead({title:`من نحن | ${site.name}`,description,canonical:`${site.origin}/about`,schema:pageSchema("/about",`من نحن | ${site.name}`,description,"AboutPage")})}<body>${header("about")}<main id="main-content"><section class="page-hero"><div class="container"><nav class="breadcrumbs" aria-label="مسار الصفحة"><a href="/">الرئيسية</a> / من نحن</nav><span class="eyebrow">أبو تالين · الرياض</span><h1>نرتّب التفاصيل<br>لتناسب فكرتك ومكانك.</h1><p>تركيب ساندويتش بانل، وأعمال جبس بورد، وديكورات جدران وأسقف للمنازل والفلل والمنشآت داخل مدينة الرياض.</p></div></section><section class="section"><div class="container design-story"><div class="design-story__media"><img src="/assets/services/wall-decor.webp" width="1200" height="800" alt="رسم توضيحي لتفاصيل ديكور جدار وإطارات وتكسية" loading="lazy" decoding="async"><span class="media-note">رسم توضيحي للفكرة</span></div><div class="design-story__copy"><span class="eyebrow">وضوح من أول خطوة</span><h2>نبدأ بفهم المساحة.<br><em>ونحدد ما تحتاجه.</em></h2><p>يختلف تركيب الألواح عن سقف الجبس أو تفاصيل الجدار. لذلك نبدأ بمعرفة الاستخدام والمقاسات وحالة الموقع، ثم نناقش الخامة والتصميم والفتحات وبنود العمل.</p><div class="decision-list"><div><b>01</b><span><strong>اختيار الخدمة</strong><small>بانل أو جبس بورد أو تفاصيل ديكور، وقد يجمع المشروع أكثر من مسار.</small></span></div><div><b>02</b><span><strong>مراجعة الموقع</strong><small>رفع الاحتياج وتحديد ما يحتاج إلى معاينة وتنسيق قبل التنفيذ.</small></span></div><div><b>03</b><span><strong>تحديد النطاق</strong><small>خامات وبنود وموعد يُتفق عليها بعد مراجعة التفاصيل.</small></span></div></div></div></div></section><section class="section section--warm"><div class="container"><div class="section-head"><span class="eyebrow">ما الذي تناقشه معنا؟</span><h2>تفاصيل عملية قبل شكل نهائي</h2></div><div class="project-steps">${[["استخدام المساحة","منزل أو فيلا أو مكتب أو محل، وطبيعة السقف أو الجدار."],["الخامة والتصميم","نوع الألواح أو التكسية، والمقاسات والشكل المناسب."],["الفتحات والالتقاءات","مواقع الفتحات والإنارة والحواف والتشطيبات القائمة."],["خدمة داخل الرياض","تأكيد الزيارة والموعد حسب الحي ونطاق المشروع."]].map(([t,d],i)=>`<article><span>0${i+1}</span><h3>${t}</h3><p>${d}</p></article>`).join("")}</div></div></section>${banner()}</main>${footer()}</body></html>`;
}

function businessHours() {
 const time = (value) => {
   const [hour, minute] = value.split(":");
   return `<time datetime="${value}"><bdi>${Number(hour) % 12 || 12}:${minute}</bdi> ${Number(hour) < 12 ? "صباحًا" : "مساءً"}</time>`;
 };
 return `<section class="section section--soft" aria-labelledby="working-hours-heading"><div class="container"><div class="section-head"><span class="eyebrow">تواصل مباشر</span><h2 id="working-hours-heading">ساعات العمل</h2><p>بتوقيت الرياض. تُنسّق الزيارة حسب موقع العميل ونطاق العمل.</p></div><div class="business-hours"><table aria-labelledby="working-hours-heading"><tbody>${site.hours.map((period) => `<tr><th scope="row">${period.label}</th><td>${period.closed ? '<span class="business-hours__closed">مغلق</span>' : `${time(period.opens)} <span aria-hidden="true">–</span> ${time(period.closes)}`}</td></tr>`).join("")}</tbody></table></div></div></section>`;
}

function contact() {
 const description=`تواصل مع ${site.name} بالرياض على ${site.phoneDisplay}. جهّز طلب البانل أو الجبس والديكور بالمقاسات والحي والفكرة المطلوبة عبر واتساب.`;
 return `${documentHead({title:`تواصل معنا | ${site.name}`,description,canonical:`${site.origin}/contact`,schema:pageSchema("/contact",`تواصل مع ${site.name}`,description,"ContactPage",{mainEntity:{"@id":businessId}})})}<body>${header("contact")}<main id="main-content"><section class="page-hero"><div class="container"><nav class="breadcrumbs" aria-label="مسار الصفحة"><a href="/">الرئيسية</a> / تواصل معنا</nav><span class="eyebrow">تواصل مباشر مع أبو تالين</span><h1>خلّنا نبدأ<br>بتفاصيل مشروعك.</h1><p>ساندويتش بانل أو جبس بورد أو ديكور للجدران والأسقف. أرسل اسم الحي والمقاسات التقريبية وصورة فكرتك إن توفرت.</p></div></section><section class="contact-options"><div class="container contact-options__grid"><a href="tel:${site.phoneInternational}" class="contact-option"><span>${icon("phone")}</span><div><small>اتصال مباشر</small><strong><bdi>${site.phoneDisplay}</bdi></strong><p>ناقش طلبك ونطاق العمل المطلوب.</p></div></a><a href="https://wa.me/${site.whatsapp}" target="_blank" rel="noopener noreferrer" class="contact-option"><span>${icon("whatsapp",true)}</span><div><small>واتساب</small><strong>شارك المقاسات والفكرة</strong><p>أضف صور الموقع أو مرجع التصميم.</p></div></a><div class="contact-option"><span>${icon("home")}</span><div><small>نطاق الخدمة</small><strong>مدينة الرياض</strong><p>الخدمة في موقع العميل؛ الموعد بالتنسيق.</p></div></div></div></section>${businessHours()}${requestForm()}<section class="section section--soft"><div class="container contact-area"><span class="eyebrow">زيارة تناسب نطاق طلبك</span><h2>نصل إلى موقعك داخل الرياض</h2><p>أرسل اسم الحي ونوع المساحة لتأكيد الموعد وإمكانية الزيارة. لا يوجد عنوان استقبال عملاء منشور؛ تُنفذ الخدمة في موقع العميل.</p><div class="chips"><span class="chip">شمال الرياض</span><span class="chip">شرق الرياض</span><span class="chip">وسط الرياض</span><span class="chip">غرب الرياض</span><span class="chip">جنوب الرياض</span></div></div></section></main>${footer()}</body></html>`;
}

function archivedPage(slug) {
 const description="استعرض خدمات أبو تالين الحالية للساندويتش بانل والجبس بورد وديكورات الجدران والأسقف في الرياض.";
 return `${documentHead({title:`الخدمات الحالية | ${site.name}`,description,canonical:`${site.origin}/services/${slug}`,robots:"noindex, follow",schema:pageSchema(`/services/${slug}`,"خدمات أبو تالين الحالية",description)})}<body>${header("services")}<main id="main-content"><section class="page-hero"><div class="container"><span class="eyebrow">أبو تالين · خدمات الأسقف والجدران</span><h1>تعرّف على خدماتنا الحالية</h1><p>${description}</p><a class="button button--dark" href="/services">استعرض الخدمات ←</a></div></section><section class="section"><div class="container"><div class="catalog">${services.map(s=>serviceCard(s)).join("")}</div></div></section>${banner()}</main>${footer()}</body></html>`;
}

function sitemap() {
 const routes=["/","/services","/about","/contact",...services.map(s=>`/services/${s.slug}`)];
 return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route=>`  <url><loc>${site.origin}${route}</loc><lastmod>${modified}</lastmod></url>`).join("\n")}\n</urlset>\n`;
}
await mkdir("services",{recursive:true});
await writeFile("index.html",home());
await writeFile("services.html",serviceIndex());
await writeFile("about.html",about());
await writeFile("contact.html",contact());
await Promise.all(services.map(service=>writeFile(`services/${service.slug}.html`,servicePage(service))));
await Promise.all(retiredServiceSlugs.map(slug=>writeFile(`services/${slug}.html`,archivedPage(slug))));
await writeFile("sitemap.xml",sitemap());
console.log(`Generated 7 active pages, ${retiredServiceSlugs.length} noindex legacy destinations, one schema graph per page, and sitemap.`);
