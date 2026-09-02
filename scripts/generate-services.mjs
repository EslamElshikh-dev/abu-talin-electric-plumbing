import { mkdir, writeFile } from "node:fs/promises";
import { services, site } from "./services-data.mjs";

const cssVersion = "20260905";
const iconVersion = "20260903";
const scriptVersion = "20260902";

const categoryLabel = (service) => service.category === "electric" ? "كهرباء" : "سباكة";
const categoryHeading = (service) => service.category === "electric" ? "خدمة كهربائية" : "خدمة سباكة";
const categoryClass = (service) => service.category === "water" ? " catalog-card--water" : "";
const serviceUrl = (service) => `${site.origin}/services/${service.slug}`;
const imageUrl = (service) => `${site.origin}/assets/services/${service.image}`;
const whatsappUrl = (service) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(`مرحبًا، أريد طلب خدمة ${service.title} في الرياض.`)}`;
const icon = (name, fill = false) => `<svg class="icon-svg${fill ? " icon-svg--fill" : ""}" aria-hidden="true"><use href="/icons.svg?v=${iconVersion}#${name}"></use></svg>`;

function header(active = "services") {
  return `<a class="skip-link" href="#main-content">انتقل إلى المحتوى</a>
  <div class="topbar"><div class="container topbar__inner"><p><span class="status-dot"></span> استقبال طلبات الكهرباء والسباكة في الرياض</p><span><a href="tel:${site.phoneInternational}">اتصال: <bdi>${site.phoneDisplay}</bdi></a> · نطاق الخدمة: مدينة الرياض</span></div></div>
  <header class="site-header"><div class="container header-shell">
    <a class="brand" href="/" aria-label="أبو تالين للكهرباء والسباكة - الرئيسية"><span class="brand-mark" aria-hidden="true"><svg class="brand-mark__logo"><use href="/icons.svg?v=${iconVersion}#brand"></use></svg></span><span><strong>أبو تالين للكهرباء والسباكة</strong><small>تأسيس · صيانة · كهرباء · سباكة</small></span></a>
    <nav class="desktop-nav" aria-label="التنقل الرئيسي"><a href="/"${active === "home" ? " aria-current=\"page\"" : ""}>الرئيسية</a><a href="/services"${active === "services" ? " aria-current=\"page\"" : ""}>الخدمات</a><a href="/about"${active === "about" ? " aria-current=\"page\"" : ""}>من نحن</a><a href="/contact"${active === "contact" ? " aria-current=\"page\"" : ""}>تواصل معنا</a></nav>
    <a class="header-cta" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noreferrer">${icon("whatsapp", true)}اطلب الخدمة</a>
    <button class="menu-button" type="button" aria-label="فتح قائمة التنقل" aria-expanded="false" data-menu-button><span></span><span></span><span></span></button>
  </div></header>
  <nav class="mobile-menu" aria-label="التنقل على الجوال" data-mobile-menu hidden><a href="/">الرئيسية</a><a href="/services">جميع الخدمات</a><a href="/about">من نحن</a><a href="/contact">تواصل معنا</a><a class="menu-call" href="tel:${site.phoneInternational}">اتصل الآن — <bdi>${site.phoneDisplay}</bdi></a></nav>`;
}

function footer() {
  return `<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand"><a class="brand" href="/"><span class="brand-mark" aria-hidden="true"><svg class="brand-mark__logo"><use href="/icons.svg?v=${iconVersion}#brand"></use></svg></span><span><strong>أبو تالين للكهرباء والسباكة</strong><small>خدمات منزلية داخل مدينة الرياض</small></span></a><p>تأسيس وصيانة الكهرباء والسباكة للمنازل والفلل والمكاتب، مع قنوات تواصل مباشرة لتحديد نطاق الطلب.</p></div><div class="footer-links"><h2>روابط الموقع</h2><a href="/services">الخدمات</a><a href="/about">من نحن</a><a href="/contact">تواصل معنا</a></div><div class="footer-links"><h2>التواصل</h2><a href="tel:${site.phoneInternational}"><bdi>${site.phoneDisplay}</bdi></a><a href="https://wa.me/${site.whatsapp}" target="_blank" rel="noreferrer">واتساب</a><span>مدينة الرياض</span></div></div><div class="footer-bottom"><span>© <span data-year>2026</span> أبو تالين للكهرباء والسباكة — جميع الحقوق محفوظة.</span><div class="developer-credit">تم التصميم والتطوير بواسطة <a href="https://eslam-elshikh.com/" target="_blank" rel="noreferrer">المهندس إسلام الشيخ</a><small>Cybersecurity Engineer | Web Developer | Google Product Expert</small></div></div></div></footer>
  <div class="floating-actions" aria-label="تواصل سريع">
    <a class="float-btn float-btn--call" href="tel:${site.phoneInternational}" aria-label="اتصل الآن على ${site.phoneDisplay}" title="اتصل الآن">${icon("phone")}</a>
    <a class="float-btn float-btn--whatsapp" href="https://wa.me/${site.whatsapp}" target="_blank" rel="noreferrer" aria-label="تواصل عبر واتساب" title="واتساب">${icon("whatsapp", true)}</a>
  </div>
  <script src="/script.js?v=${scriptVersion}" defer></script>`;
}

function serviceCard(service, heading = "h3", eager = false) {
  return `<article class="catalog-card${categoryClass(service)}">
    <a class="catalog-card__media" href="/services/${service.slug}" aria-label="تفاصيل ${service.title}"><img src="/assets/services/${service.image}" alt="فني أبو تالين ينفذ خدمة ${service.title} في الرياض" width="1200" height="800" ${eager ? "fetchpriority=\"high\"" : "loading=\"lazy\""} decoding="async"></a>
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
</head>`;
}

function renderServicesIndex() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "خدمات الكهرباء والسباكة بالرياض",
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
  return `${documentHead({ title: "خدمات الكهرباء والسباكة بالرياض | أبو تالين", description: "دليل متكامل لخدمات أبو تالين في الرياض: 18 خدمة كهرباء وسباكة للمنازل والفلل، مع صفحة تفصيلية وصورة أصلية لكل خدمة.", canonical: `${site.origin}/services`, schema })}
<body>
  ${header("services")}
  <main id="main-content">
    <section class="page-hero services-hero"><div class="container"><div class="breadcrumbs"><a href="/">الرئيسية</a> / الخدمات</div><span class="eyebrow">18 خدمة متخصصة</span><h1>خدمات الكهرباء والسباكة في الرياض</h1><p>اختر الخدمة المناسبة لعرض النطاق والخطوات والأسئلة الشائعة. كل صفحة صُممت لتمنحك صورة واضحة قبل التواصل.</p><div class="service-jump"><a href="#electric-services">${icon("bolt")} خدمات الكهرباء</a><a href="#water-services">${icon("droplet")} خدمات السباكة</a></div></div></section>

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
  const prep = isElectric
    ? ["لا تلمس أي سلك مكشوف أو نقطة ساخنة.", "أوقف استخدام الجهاز المرتبط بالعطل.", "جهّز صورة اللوحة أو النقطة من مسافة آمنة.", "أرسل الحي ونوع العقار ووقت ظهور المشكلة."]
    : ["أغلق المحبس القريب إذا كان الوصول إليه آمنًا.", "أبعد الأغراض عن منطقة الماء من دون لمس كهرباء.", "التقط صورًا من مسافة آمنة توضح المصدر الظاهر.", "أرسل الحي ونوع العقار ووقت ظهور المشكلة."];

  return `${documentHead({ title: `${service.title} في الرياض | أبو تالين`, description: `${service.summary} اطلب الخدمة في مدينة الرياض عبر الاتصال أو واتساب على ${site.phoneDisplay}.`, canonical: serviceUrl(service), ogType: "article", image: imageUrl(service), schema })}
<body>
  ${header("services")}
  <main id="main-content">
    <section class="service-detail-hero${service.category === "water" ? " service-detail-hero--water" : ""}"><div class="container service-hero-grid"><div class="service-hero-copy"><div class="breadcrumbs"><a href="/">الرئيسية</a> / <a href="/services">الخدمات</a> / ${service.title}</div><span class="eyebrow${service.category === "water" ? " eyebrow--water" : ""}">${categoryHeading(service)} في الرياض</span><h1>${service.title}</h1><p>${service.lede}</p><div class="hero__actions"><a class="button button--primary" href="${whatsappUrl(service)}" target="_blank" rel="noreferrer">${icon("whatsapp", true)}اطلب الخدمة عبر واتساب</a><a class="button button--outline" href="tel:${site.phoneInternational}">${icon("phone")}اتصل الآن</a></div><ul class="service-hero-points"><li>${icon("shield")} فحص واضح قبل التنفيذ</li><li>${icon("services")} للمنازل والفلل والمنشآت</li><li>${icon("home")} داخل مدينة الرياض</li></ul></div><figure class="service-hero-media"><img src="/assets/services/${service.image}" alt="تنفيذ خدمة ${service.title} في منزل بمدينة الرياض" width="1200" height="800" fetchpriority="high" decoding="async"><figcaption><span>${icon(service.icon)}</span><div><b>${service.title}</b><small>خدمة ميدانية داخل مدينة الرياض</small></div></figcaption></figure></div></section>

    <section class="section service-detail-section"><div class="container service-layout"><article class="service-content">
      <section class="content-block"><span class="eyebrow${service.category === "water" ? " eyebrow--water" : ""}">نطاق الخدمة</span><h2>ماذا تشمل خدمة ${service.title}؟</h2><p>${service.summary} يبدأ تحديد النطاق من حالة الموقع الفعلية والمواد الموجودة، ثم تُوضح الأعمال المطلوبة قبل التنفيذ قدر الإمكان.</p><ul class="check-grid">${service.scope.map((item) => `<li>${icon("shield")}<span>${item}</span></li>`).join("")}</ul></section>

      <section class="content-block content-block--soft"><span class="eyebrow eyebrow--water">مؤشرات مهمة</span><h2>متى تحتاج هذه الخدمة؟</h2><p>وجود إحدى العلامات التالية لا يحدد السبب وحده، لكنه يساعد على وصف الحالة وتجهيز الفحص المناسب:</p><div class="signal-grid">${service.signals.map((item, index) => `<div><b>${String(index + 1).padStart(2, "0")}</b><span>${item}</span></div>`).join("")}</div></section>

      <section class="content-block"><span class="eyebrow">طريقة التنفيذ</span><h2>خطوات مرتبة من الفحص إلى الاختبار</h2><div class="detail-process">${service.steps.map((step, index) => `<div><b>${index + 1}</b><span>${step}</span></div>`).join("")}</div><p class="content-note">قد يتغير ترتيب الخطوات حسب حالة الموقع، ولا يُنفذ أي عمل إضافي خارج النطاق إلا بعد توضيح الحاجة إليه.</p></section>

      <section class="content-block content-block--split"><div><span class="eyebrow eyebrow--water">قبل الزيارة</span><h2>معلومات تساعد على تجهيز الطلب</h2><ul class="plain-checks">${prep.map((item) => `<li>${item}</li>`).join("")}</ul></div><aside class="safety-card"><span>${icon("shield")}</span><h3>السلامة أولًا</h3><p>${isElectric ? "عند وجود دخان أو شرر أو رائحة احتراق، ابتعد عن الموقع ولا تستخدم الماء. افصل المصدر فقط إذا كان الوصول إلى القاطع آمنًا، واتصل بالطوارئ عند الخطر المباشر." : "إذا وصل الماء إلى مقبس أو جهاز كهربائي، لا تلمس الماء أو المفتاح. ابتعد عن المكان وافصل الكهرباء من نقطة آمنة فقط، واتصل بالطوارئ عند الخطر المباشر."}</p></aside></section>

      <section class="content-block" id="faq"><span class="eyebrow">أسئلة شائعة</span><h2>أسئلة عن ${service.title}</h2><div class="faq">${service.faqs.map(([question, answer]) => `<details><summary>${question}</summary><p>${answer}</p></details>`).join("")}</div></section>
    </article>

    <aside class="service-aside"><div class="request-card"><span class="request-card__icon">${icon(service.icon)}</span><small>${categoryHeading(service)}</small><h2>اطلب تقييم حالتك</h2><p>أرسل اسم الحي ونوع الموقع ووصف المشكلة وصورًا آمنة إن أمكن.</p><a class="button button--primary" href="${whatsappUrl(service)}" target="_blank" rel="noreferrer">${icon("whatsapp", true)}فتح واتساب</a><a class="button button--secondary" href="tel:${site.phoneInternational}">${icon("phone")}<bdi>${site.phoneDisplay}</bdi></a><div class="request-card__meta"><span>نطاق الخدمة</span><b>مدينة الرياض</b></div></div><a class="back-services" href="/services">${icon("services")} تصفح جميع الخدمات</a></aside>
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
