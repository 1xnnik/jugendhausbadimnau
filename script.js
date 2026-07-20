document.addEventListener("DOMContentLoaded", () => {
  enhanceLegacyHeader();
  initNavigation();
  initActiveNavigation();
  initCountdown();
  initImageFallbacks();
  initScrollReveal();
  initModelViewer();
  updateCopyrightYears();
});

const pageName = () => window.location.pathname.split("/").pop() || "index.html";

function enhanceLegacyHeader() {
  const header = document.querySelector(".site-header");
  if (!header || header.querySelector(".navbar")) return;

  header.innerHTML = `
    <nav class="navbar container" aria-label="Hauptnavigation">
      <a class="brand" href="index.html" aria-label="Jugendhaus Bad Imnau – Startseite">
        <img src="images/logo/logo-white.webp" alt="" width="80" height="80">
      </a>
      <button class="nav-toggle" type="button" aria-controls="primary-navigation" aria-expanded="false">
        <span></span><span></span><span></span><span class="sr-only">Menü öffnen</span>
      </button>
      <ul id="primary-navigation" class="nav-menu">
        <li><a href="index.html" data-page="index">Start</a></li>
        <li><a href="historie.html" data-page="historie">Historie</a></li>
        <li><a href="vorstandschaft.html" data-page="vorstandschaft">Vorstandschaft</a></li>
        <li><a href="galerie.html" data-page="galerie">Galerie</a></li>
        <li><a href="veranstaltungen.html" data-page="veranstaltungen">Veranstaltungen</a></li>
        <li><a href="karibische-nacht.html" data-page="karibische-nacht">Karibische Nacht</a></li>
        <li><a href="kontakt.html" data-page="kontakt">Kontakt</a></li>
      </ul>
    </nav>`;
}

function initNavigation() {
  const pairs = [
    [document.querySelector(".nav-toggle"), document.querySelector(".nav-menu")],
    [document.querySelector(".v2-menu-button"), document.querySelector(".v2-mobile-menu")],
  ];

  pairs.forEach(([button, menu]) => {
    if (!button || !menu) return;
    const label = button.querySelector(".sr-only");

    const setOpen = (open, returnFocus = false) => {
      button.setAttribute("aria-expanded", String(open));
      button.classList.toggle("is-open", open);
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      if (label) label.textContent = open ? "Menü schließen" : "Menü öffnen";
      if (returnFocus) button.focus();
    };

    button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") setOpen(false, true);
    });
    document.addEventListener("click", (event) => {
      if (button.getAttribute("aria-expanded") === "true" && !button.contains(event.target) && !menu.contains(event.target)) setOpen(false);
    });
  });
}

function initActiveNavigation() {
  const key = pageName().replace(".html", "");
  document.querySelectorAll("[data-page]").forEach((link) => {
    const active = link.dataset.page === key;
    link.classList.toggle("is-active", active);
    link.toggleAttribute("aria-current", active);
    if (active) link.setAttribute("aria-current", "page");
  });

  document.querySelectorAll('.v2-nav a[href], .v2-mobile-menu a[href]').forEach((link) => {
    const active = link.getAttribute("href") === pageName();
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
  });
}

function initCountdown() {
  const countdown = document.querySelector("[data-countdown]");
  if (!countdown) return;
  const target = new Date(countdown.dataset.countdown).getTime();
  const fields = {
    days: countdown.querySelector("[data-days]"),
    hours: countdown.querySelector("[data-hours]"),
    minutes: countdown.querySelector("[data-minutes]"),
    seconds: countdown.querySelector("[data-seconds]"),
  };

  const update = () => {
    const remaining = Math.max(0, target - Date.now());
    const seconds = Math.floor(remaining / 1000);
    fields.days.textContent = String(Math.floor(seconds / 86400));
    fields.hours.textContent = String(Math.floor((seconds % 86400) / 3600)).padStart(2, "0");
    fields.minutes.textContent = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    fields.seconds.textContent = String(seconds % 60).padStart(2, "0");
  };
  update();
  window.setInterval(update, 1000);
}

function initImageFallbacks() {
  document.querySelectorAll("[data-fallback-image]").forEach((image) => {
    const replace = () => {
      const placeholder = document.createElement("div");
      placeholder.className = "image-placeholder";
      placeholder.setAttribute("role", "img");
      placeholder.setAttribute("aria-label", image.alt || "Bild folgt");
      placeholder.textContent = "Bild folgt";
      image.replaceWith(placeholder);
    };
    image.addEventListener("error", replace, { once: true });
    if (image.complete && image.naturalWidth === 0) replace();
  });
}

function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
  elements.forEach((element) => observer.observe(element));
}

function initModelViewer() {
  document.querySelectorAll("model-viewer[data-fallback-src]").forEach((model) => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => model.toggleAttribute("auto-rotate", !motion.matches);
    updateMotion();
    motion.addEventListener?.("change", updateMotion);
    model.addEventListener("error", () => {
      if (model.src.endsWith(model.dataset.fallbackSrc)) return;
      model.src = model.dataset.fallbackSrc;
    }, { once: true });
  });
}

function updateCopyrightYears() {
  document.querySelectorAll(".copyright, .footer-bottom, .v2-footer > p:last-child").forEach((element) => {
    element.textContent = element.textContent.replace(/©(?:\s+2026)?/, `© ${new Date().getFullYear()}`);
  });
}
