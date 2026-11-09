const menuButton = document.querySelector("[data-menu-button]");
const menu = document.querySelector("[data-mobile-menu]");
const siteHeader = document.querySelector(".site-header");

if (menuButton && menu) {
  const syncMenuPosition = () => {
    const headerBottom = siteHeader?.getBoundingClientRect().bottom ?? 0;
    document.documentElement.style.setProperty("--menu-top", `${Math.max(0, headerBottom)}px`);
  };

  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "فتح قائمة التنقل");
    menu.hidden = true;
    document.body.classList.remove("menu-open");
  };

  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    if (!expanded) syncMenuPosition();
    menuButton.setAttribute("aria-expanded", String(!expanded));
    menuButton.setAttribute("aria-label", expanded ? "فتح قائمة التنقل" : "إغلاق قائمة التنقل");
    menu.hidden = expanded;
    document.body.classList.toggle("menu-open", !expanded);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
    else if (!menu.hidden) syncMenuPosition();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      closeMenu();
      menuButton.focus();
    }
  });
}

if (siteHeader) {
  const updateHeader = () => siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = new Date().getFullYear();
});

// Build a reviewable WhatsApp message locally; the visitor sends it in WhatsApp.
document.querySelectorAll("[data-project-form]").forEach((form) => {
  const service = form.querySelector('[name="service"]');
  const district = form.querySelector('[name="district"]');
  const space = form.querySelector('[name="space"]');
  const details = form.querySelector('[name="details"]');
  const link = form.querySelector("[data-quote-link]");
  if (!service || !district || !space || !details || !link) return;

  const requestedService = new URLSearchParams(window.location.search).get("service");
  if ([...service.options].some((option) => option.value === requestedService)) {
    service.value = requestedService;
  }

  const updateMessage = () => {
    const lines = [
      "مرحبًا أبو تالين، أرغب في مناقشة مشروع داخل الرياض.",
      `الخدمة: ${service.options[service.selectedIndex].textContent.trim()}`,
    ];
    if (district.value.trim()) lines.push(`الحي: ${district.value.trim()}`);
    if (space.value) lines.push(`نوع المساحة: ${space.value}`);
    if (details.value.trim()) lines.push(`المقاسات والفكرة: ${details.value.trim()}`);
    link.href = `https://wa.me/966505174342?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  form.addEventListener("input", updateMessage);
  form.addEventListener("change", updateMessage);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateMessage();
    link.focus();
  });
  updateMessage();
});
