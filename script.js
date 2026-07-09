document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initActiveNavigation();
  initCountdown();
  initImageFallbacks();
  initScrollReveal();
});

function initNavigation() {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector(".nav-menu");

  if (!toggle || !menu) {
    return;
  }

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.classList.toggle("is-open", !isOpen);
    menu.classList.toggle("is-open", !isOpen);
  });

  menu.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.classList.remove("is-open");
      menu.classList.remove("is-open");
    }
  });
}

function initActiveNavigation() {
  const fileName = window.location.pathname.split("/").pop() || "index.html";
  const pageKey = fileName.replace(".html", "") || "index";

  document.querySelectorAll(".nav-menu a").forEach((link) => {
    const target = link.getAttribute("data-page");
    if (target === pageKey) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    }
  });
}

function initCountdown() {
  const countdown = document.querySelector("[data-countdown]");
  if (!countdown) {
    return;
  }

  const targetDate = new Date(countdown.getAttribute("data-countdown"));
  const days = countdown.querySelector("[data-days]");
  const hours = countdown.querySelector("[data-hours]");
  const minutes = countdown.querySelector("[data-minutes]");
  const seconds = countdown.querySelector("[data-seconds]");

  const updateCountdown = () => {
    const distance = Math.max(0, targetDate.getTime() - Date.now());
    const totalSeconds = Math.floor(distance / 1000);

    const remainingDays = Math.floor(totalSeconds / 86400);
    const remainingHours = Math.floor((totalSeconds % 86400) / 3600);
    const remainingMinutes = Math.floor((totalSeconds % 3600) / 60);
    const remainingSeconds = totalSeconds % 60;

    days.textContent = String(remainingDays);
    hours.textContent = String(remainingHours).padStart(2, "0");
    minutes.textContent = String(remainingMinutes).padStart(2, "0");
    seconds.textContent = String(remainingSeconds).padStart(2, "0");
  };

  updateCountdown();
  window.setInterval(updateCountdown, 1000);
}

function initImageFallbacks() {
  document.querySelectorAll("[data-fallback-image]").forEach((image) => {
    const showFallback = () => {
      const placeholder = document.createElement("div");
      placeholder.className = "image-placeholder";
      placeholder.setAttribute("role", "img");
      placeholder.setAttribute("aria-label", image.alt || "Bild folgt");
      placeholder.innerHTML = "<span>Bild folgt</span>";
      image.replaceWith(placeholder);
    };

    image.addEventListener("error", showFallback, { once: true });

    if (image.complete && image.naturalWidth === 0) {
      showFallback();
    }
  });
}

function initScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealElements.forEach((element) => observer.observe(element));
}
