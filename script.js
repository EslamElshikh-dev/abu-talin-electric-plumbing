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
