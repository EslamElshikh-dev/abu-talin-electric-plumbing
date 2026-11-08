import { mkdir, writeFile } from "node:fs/promises";
import { services, site } from "./services-data.mjs";

const cssVersion = "20261109";
const iconVersion = "20260903";
const scriptVersion = "20260902";

const categoryLabel = (service) => ({ electric: "كهرباء", water: "سباكة", finishing: "ديكور وتشطيب" })[service.category];
const categoryHeading = (service) => ({ electric: "خدمة كهربائية", water: "خدمة سباكة", finishing: "خدمة ديكور وتشطيب" })[service.category];
const categoryClass = (service) => service.category === "water" ? " catalog-card--water" : service.category === "finishing" ? " catalog-card--finishing" : "";
const serviceUrl = (service) => `${site.origin}/services/${service.slug}`;
const imageUrl = (service) => `${site.origin}/assets/services/${service.image}`;
const whatsappUrl = (service) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`مرحبًا، أريد طلب خدمة ${service.title} في الرياض.`)}`;
const icon = (name, fill = false) => `<svg class="icon-svg${fill ? " icon-svg--fill" : ""}" aria-hidden="true"><use href="/icons.svg?v=${iconVersion}#${name}"></use></svg>`;

function header(active = "services") {
  return `<a class="skip-link" href="#main-content">انتقل إلى المحتوى</a>
  <div class="topbar"><div class="container topbar__inner"><p><span class="status-dot"></span> خدمات الكهرباء والسباكة والديكور في الرياض</p><span><a href="tel:${site.phoneInternational}">اتصال: <bdi>${site.phoneDisplay}</bdi></a> · نطاق الخدمة: مدينة الرياض</span></div></div>
  <header class="site-header"><div class="container header-shell">
    <a class="brand" href="/" aria-label="أبو تالين للكهرباء والسباكة - الرئيسية"><span class="brand-mark" aria-hidden="true"><svg class="brand-mark__logo"><use href="/icons.svg?v=${iconVersion}#brand"></use></svg></span><span><strong>أبو تالين للكهرباء والسباكة</strong><small>كهرباء · سباكة · ديكور</small></span></a>
    <nav class="desktop-nav" aria-label="التنقل الرئيسي"><a href="/"${active === "home" ? " aria-current=\"page\"" : ""}>الرئيسية</a><a href="/services"${active === "services" ? " aria-current=\"page\"" : ""}>الخدمات</a><a href="/about"${active === "about" ? " aria-current=\"page\"" : ""}>من نحن</a><a href="/contact"${active === "contact" ? " aria-current=\"page\"" : ""}>تواصل معنا</a></nav>
    <a class="header-cta" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noreferrer">${icon("whatsapp", true)}اطلب الخدمة</a>
    <button class="menu-button" type="button" aria-label="فتح قائمة التنقل" aria-expanded="false" data-menu-button><span></span><span></span><span></span></button>
  </div></header>
  <nav class="mobile-menu" aria-label="التنقل على الجوال" data-mobile-menu hidden><a href="/">الرئيسية</a><a href="/services">جميع الخدمات</a><a href="/about">من نحن</a><a href="/contact">تواصل معنا</a><a class="menu-call" href="tel:${site.phoneInternational}">اتصل الآن — <bdi>${site.phoneDisplay}</bdi></a></nav>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true"><svg class="brand-mark__logo"><use href="/icons.svg?v=${iconVersion}#brand"></use></svg></span><span><strong>أبو تالين للكهرباء والسباكة</strong><small>خدمات منزلية داخل مدينة الرياض</small></span></a><p>كهرباء وسباكة وساندوتش بانل وديكورات للمنازل والفلل والمنشآت في الرياض.</p></div><div class="footer-links"><h2>روابط الموقع</h2><a href="/services">الخدمات</a><a href="/about">من نحن</a><a href="/contact">تواصل معنا</a></div><div class="footer-links"><h2>التواصل</h2><a href="tel:${site.phoneInternational}"><bdi>${site.phoneDisplay}</bdi></a><a href="https://wa.me/${site.whatsapp}" target="_blank" rel="noreferrer">واتساب</a><span>مدينة الرياض</span></div></div><div class="footer-bottom"><span>© <span data-year>2026</span> أبو تالين للكهرباء والسباكة — جميع الحقوق محفوظة.</span><a class="developer-signature eslam-credit" data-eslam-signature="v1" href="https://www.eslam-elshikh.com/" target="_blank" rel="noopener noreferrer" aria-label="موقع المهندس إسلام الشيخ — تصميم وبرمجة وتطوير الموقع، يفتح في تبويب جديد" dir="rtl"><span class="eslam-credit__mark" aria-hidden="true"><img src="data:image/webp;base64,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" width="30" height="30" loading="lazy" decoding="async" alt=""></span><span class="eslam-credit__copy"><span class="eslam-credit__role">تصميم وتطوير</span><strong class="eslam-credit__name">المهندس إسلام الشيخ</strong></span><svg class="eslam-credit__arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg></a></div></div></footer>
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

function documentHead({ title, description, canonical, ogType = "website", image, schema }) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
  <meta name="theme-color" content="#071d35">
  <link rel="canonical" href="${canonical}">
  <link rel="manifest" href="/manifest.webmanifest?v=${iconVersion}">
  <link rel="icon" href="/favicon.svg?v=${iconVersion}" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="/styles.css?v=${cssVersion}">
  <meta property="og:locale" content="ar_SA">
  <meta property="og:type" content="${ogType}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:site_name" content="أبو تالين للكهرباء والسباكة">
${image ? `  <meta property="og:image" content="${image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="800">\n` : ""}  <meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}">
  <script type="application/ld+json">${JSON.stringify(schema)}</script>
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
</style><script id="eslam-developer-credit-schema" type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"Person","@id":"https://www.eslam-elshikh.com/#person","name":"إسلام الشيخ","alternateName":["المهندس إسلام الشيخ","Eslam Elshikh"],"url":"https://www.eslam-elshikh.com/","sameAs":["https://github.com/EslamElshikh-dev"]},{"@type":"WebSite","@id":"https://abu-talin-electric-plumbing.vercel.app/#website","url":"https://abu-talin-electric-plumbing.vercel.app/","creator":{"@id":"https://www.eslam-elshikh.com/#person"},"creditText":"تصميم وبرمجة وتطوير الموقع: المهندس إسلام الشيخ — https://www.eslam-elshikh.com/","name":"أبو تالين للكهرباء والسباكة"}]}</script></head>`;
}

function renderServicesIndex() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "خدمات الكهرباء والسباكة والديكور بالرياض",
    url: `${site.origin}/services`,
    inLanguage: "ar-SA",
    isPartOf: { "@id": `${site.origin}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: services.length,
      itemListElement: services.map((service, index) => ({ "@type": "ListItem", position: index + 1, name: service.title, url: serviceUrl(service) }))
    }
  };
  const electric = services.filter((service) => service.category === "electric");
  const water = services.filter((service) => service.category === "water");
  const finishing = services.filter((service) => service.category === "finishing");
  return `${documentHead({ title: "خدمات الكهرباء والسباكة والديكور بالرياض | أبو تالين", description: "استعرض خدمات الساندوتش بانل والجبس وديكورات الجدران والأسقف، إلى جانب الكهرباء والسباكة في الرياض.", canonical: `${site.origin}/services`, schema })}
<body>
  ${header("services")}
  <main id="main-content">
    <section class="page-hero services-hero"><div class="container"><div class="breadcrumbs"><a href="/">الرئيسية</a> / الخدمات</div><span class="eyebrow">خدمات للمنازل والمنشآت</span><h1>خدمات الكهرباء والسباكة والديكور في الرياض</h1><p>تصفح خدمات الساندوتش بانل والجبس والديكور، إلى جانب أعمال الكهرباء والسباكة؛ لكل خدمة تفاصيل تساعدك على وصف طلبك.</p><div class="service-jump"><a href="#finishing-services">${icon("services")} الساندوتش بانل والديكور</a><a href="#electric-services">${icon("bolt")} خدمات الكهرباء</a><a href="#water-services">${icon("droplet")} خدمات السباكة</a></div></div></section>

    <section class="section section--finishing" id="finishing-services"><div class="container"><div class="section-head"><span class="eyebrow">أعمال التشطيب</span><h2>تفاصيل تصنع المكان</h2><p>ساندوتش بانل، وجبس بورد، وأفكار للجدران والأسقف بتفاصيل تناسب مساحة المشروع.</p></div><div class="catalog">${finishing.map((service, index) => serviceCard(service, "h3", index === 0)).join("\n")}</div></div></section>

    <section class="section section--soft" id="electric-services"><div class="container"><div class="section-head"><span class="eyebrow">قسم الكهرباء</span><h2>من التأسيس حتى تشخيص الأعطال</h2><p>تسع خدمات تغطي الدوائر واللوحات والإنارة والمفاتيح والأجهزة عالية الأحمال داخل المنازل والفلل والمنشآت.</p></div><div class="catalog">${electric.map((service, index) => serviceCard(service, "h3", index < 3)).join("\n")}</div></div></section>

    <section class="section" id="water-services"><div class="container"><div class="section-head"><span class="eyebrow eyebrow--water">قسم السباكة</span><h2>تمديدات وصيانة المياه والصرف</h2><p>تسع خدمات للتأسيس والتسربات والانسدادات والأدوات الصحية والسخانات والخزانات والمضخات.</p></div><div class="catalog">${water.map((service) => serviceCard(service)).join("\n")}</div><div class="section-action"><a class="button button--dark" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noreferrer">أرسل تفاصيل الخدمة عبر واتساب</a></div></div></section>

    <section class="contact-banner"><div class="container contact-banner__inner"><div><span class="eyebrow eyebrow--light">تحتاج مساعدة في الاختيار؟</span><h2>صف الحالة وسنرتب نوع الخدمة</h2><p>أرسل الحي ونوع الموقع ووصف المشكلة وصورًا آمنة إن أمكن.</p></div><div class="contact-banner__actions"><a class="button button--primary" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noreferrer">${icon("whatsapp", true)}واتساب</a><a class="button button--water" href="tel:${site.phoneInternational}">${icon("phone")}<bdi>${site.phoneDisplay}</bdi></a></div></div></section>
  </main>
  ${footer()}
</body>
</html>`;
}

function renderServicePage(service) {
  const related = service.related.map((slug) => services.find((candidate) => candidate.slug === slug)).filter(Boolean);
  const category = categoryLabel(service);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${serviceUrl(service)}#service`,
        name: service.title,
        description: service.summary,
        url: serviceUrl(service),
        image: imageUrl(service),
        serviceType: `${category} منازل وفلل`,
        areaServed: { "@type": "City", name: "الرياض" },
        provider: { "@id": `${site.origin}/#business` }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "الرئيسية", item: `${site.origin}/` },
          { "@type": "ListItem", position: 2, name: "الخدمات", item: `${site.origin}/services` },
          { "@type": "ListItem", position: 3, name: service.title, item: serviceUrl(service) }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: service.faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } }))
      }
    ]
  };
  const isElectric = service.category === "electric";
  const isFinishing = service.category === "finishing";
  const prep = isFinishing
    ? ["أرسل أبعاد المساحة التقريبية ونوع الموقع.", "شارك فكرة التصميم أو صورة مرجعية إن توفرت.", "وضح المواد أو الألوان المفضلة والفتحات المطلوبة.", "أرسل اسم الحي وصورًا آمنة للموقع."]
    : isElectric
      ? ["لا تلمس أي سلك مكشوف أو نقطة ساخنة.", "أوقف استخدام الجهاز المرتبط بالعطل.", "جهّز صورة اللوحة أو النقطة من مسافة آمنة.", "أرسل الحي ونوع العقار ووقت ظهور المشكلة."]
      : ["أغلق المحبس القريب إذا كان الوصول إليه آمنًا.", "أبعد الأغراض عن منطقة الماء من دون لمس كهرباء.", "التقط صورًا من مسافة آمنة توضح المصدر الظاهر.", "أرسل الحي ونوع العقار ووقت ظهور المشكلة."];
  const safetyNote = isFinishing
    ? "تُراجع حالة السقف أو الجدار ونقاط التثبيت والتمديدات القائمة قبل العمل، ويُترك تنفيذ الأعمال المرتفعة والمكونات الكهربائية للمختصين."
    : isElectric
      ? "عند وجود دخان أو شرر أو رائحة احتراق، ابتعد عن الموقع ولا تستخدم الماء. افصل المصدر فقط إذا كان الوصول إلى القاطع آمنًا، واتصل بالطوارئ عند الخطر المباشر."
      : "إذا وصل الماء إلى مقبس أو جهاز كهربائي، لا تلمس الماء أو المفتاح. ابتعد عن المكان وافصل الكهرباء من نقطة آمنة فقط، واتصل بالطوارئ عند الخطر المباشر.";

  return `${documentHead({ title: `${service.title} في الرياض | أبو تالين`, description: `${service.summary} اطلب الخدمة في مدينة الرياض عبر الاتصال أو واتساب على ${site.phoneDisplay}.`, canonical: serviceUrl(service), ogType: "article", image: imageUrl(service), schema })}
<body>
  ${header("services")}
  <main id="main-content">
    <section class="service-detail-hero${service.category === "water" ? " service-detail-hero--water" : ""}"><div class="container service-hero-grid"><div class="service-hero-copy"><div class="breadcrumbs"><a href="/">الرئيسية</a> / <a href="/services">الخدمات</a> / ${service.title}</div><span class="eyebrow${service.category === "water" ? " eyebrow--water" : ""}">${categoryHeading(service)} في الرياض</span><h1>${service.title}</h1><p>${service.lede}</p><div class="hero__actions"><a class="button button--primary" href="${whatsappUrl(service)}" target="_blank" rel="noreferrer">${icon("whatsapp", true)}اطلب الخدمة عبر واتساب</a><a class="button button--outline" href="tel:${site.phoneInternational}">${icon("phone")}اتصل الآن</a></div><ul class="service-hero-points"><li>${icon("shield")} فحص واضح قبل التنفيذ</li><li>${icon("services")} للمنازل والفلل والمنشآت</li><li>${icon("home")} داخل مدينة الرياض</li></ul></div><figure class="service-hero-media"><img src="/assets/services/${service.image}" alt="${service.imageAlt ?? `صورة توضيحية لخدمة ${service.title} في الرياض`}" width="1200" height="800" fetchpriority="high" decoding="async"><figcaption><span>${icon(service.icon)}</span><div><b>${service.title}</b><small>${isFinishing ? "رسم توضيحي · خدمة داخل الرياض" : "خدمة ميدانية داخل مدينة الرياض"}</small></div></figcaption></figure></div></section>

    <section class="section service-detail-section"><div class="container service-layout"><article class="service-content">
      <section class="content-block"><span class="eyebrow${service.category === "water" ? " eyebrow--water" : ""}">نطاق الخدمة</span><h2>ماذا تشمل خدمة ${service.title}؟</h2><p>${service.summary} يبدأ تحديد النطاق من حالة الموقع الفعلية والمواد الموجودة، ثم تُوضح الأعمال المطلوبة قبل التنفيذ قدر الإمكان.</p><ul class="check-grid">${service.scope.map((item) => `<li>${icon("shield")}<span>${item}</span></li>`).join("")}</ul></section>

      <section class="content-block content-block--soft"><span class="eyebrow eyebrow--water">مؤشرات مهمة</span><h2>متى تحتاج هذه الخدمة؟</h2><p>${isFinishing ? "أمثلة تساعدك على تحديد احتياجك قبل التواصل:" : "وجود إحدى العلامات التالية لا يحدد السبب وحده، لكنه يساعد على وصف الحالة وتجهيز الفحص المناسب:"}</p><div class="signal-grid">${service.signals.map((item, index) => `<div><b>${String(index + 1).padStart(2, "0")}</b><span>${item}</span></div>`).join("")}</div></section>

      <section class="content-block"><span class="eyebrow">طريقة التنفيذ</span><h2>${isFinishing ? "خطوات مرتبة من الفكرة إلى التنفيذ" : "خطوات مرتبة من الفحص إلى الاختبار"}</h2><div class="detail-process">${service.steps.map((step, index) => `<div><b>${index + 1}</b><span>${step}</span></div>`).join("")}</div><p class="content-note">قد يتغير ترتيب الخطوات حسب حالة الموقع، ولا يُنفذ أي عمل إضافي خارج النطاق إلا بعد توضيح الحاجة إليه.</p></section>

      <section class="content-block content-block--split"><div><span class="eyebrow eyebrow--water">قبل الزيارة</span><h2>معلومات تساعد على تجهيز الطلب</h2><ul class="plain-checks">${prep.map((item) => `<li>${item}</li>`).join("")}</ul></div><aside class="safety-card"><span>${icon("shield")}</span><h3>السلامة أولًا</h3><p>${safetyNote}</p></aside></section>

      <section class="content-block" id="faq"><span class="eyebrow">أسئلة شائعة</span><h2>أسئلة عن ${service.title}</h2><div class="faq">${service.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</div></section>
    </article>

    <aside class="service-aside"><div class="request-card"><span class="request-card__icon">${icon(service.icon)}</span><small>${categoryHeading(service)}</small><h2>${isFinishing ? "حدثنا عن مشروعك" : "اطلب تقييم حالتك"}</h2><p>${isFinishing ? "أرسل الحي ونوع الموقع والمقاسات والفكرة المطلوبة وصورًا آمنة إن أمكن." : "أرسل اسم الحي ونوع الموقع ووصف المشكلة وصورًا آمنة إن أمكن."}</p><a class="button button--primary" href="${whatsappUrl(service)}" target="_blank" rel="noreferrer">${icon("whatsapp", true)}فتح واتساب</a><a class="button button--secondary" href="tel:${site.phoneInternational}">${icon("phone")}<bdi>${site.phoneDisplay}</bdi></a><div class="request-card__meta"><span>نطاق الخدمة</span><b>مدينة الرياض</b></div></div><a class="back-services" href="/services">${icon("services")} تصفح جميع الخدمات</a></aside>
    </div></section>

    <section class="section section--soft related-services"><div class="container"><div class="section-head"><span class="eyebrow${service.category === "water" ? " eyebrow--water" : ""}">خدمات مرتبطة</span><h2>قد تحتاج أيضًا إلى</h2><p>صفحات تساعدك على مقارنة نطاق الأعمال القريبة من طلبك.</p></div><div class="catalog catalog--related">${related.map((item) => serviceCard(item, "h3")).join("")}</div></div></section>

    <section class="contact-banner"><div class="container contact-banner__inner"><div><span class="eyebrow eyebrow--light">تواصل مباشر</span><h2>جاهز لطلب ${service.title}؟</h2><p>اتصال أو واتساب على الرقم الموحد لخدمات أبو تالين داخل الرياض.</p></div><div class="contact-banner__actions"><a class="button button--primary" href="${whatsappUrl(service)}" target="_blank" rel="noreferrer">${icon("whatsapp", true)}واتساب</a><a class="button button--water" href="tel:${site.phoneInternational}">${icon("phone")}<bdi>${site.phoneDisplay}</bdi></a></div></div></section>
  </main>
  ${footer()}
</body>
</html>`;
}

function renderSitemap() {
  const routes = ["/", "/services", "/about", "/contact", ...services.map((service) => `/services/${service.slug}`)];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map((route) => `  <url><loc>${site.origin}${route}</loc><changefreq>${route === "/" ? "weekly" : "monthly"}</changefreq><priority>${route === "/" ? "1.0" : route === "/services" ? "0.9" : route.startsWith("/services/") ? "0.8" : "0.7"}</priority></url>`).join("\n")}\n</urlset>\n`;
}

await mkdir("services", { recursive: true });
await writeFile("services.html", renderServicesIndex());
await Promise.all(services.map((service) => writeFile(`services/${service.slug}.html`, renderServicePage(service))));
await writeFile("sitemap.xml", renderSitemap());
console.log(`Generated services index, ${services.length} detail pages, and sitemap.`);
