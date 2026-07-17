document.addEventListener("DOMContentLoaded", () => {
  upgradeLegacyHeader();
  initNavigation();
  initActiveNavigation();
  initCountdown();
  initImageFallbacks();
  initScrollReveal();
  initV2Menu();
  initHouseModel();
  initModelFallback();
});

function initModelFallback() {
  document.querySelectorAll("model-viewer[data-fallback-src]").forEach((model) => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => model.toggleAttribute("auto-rotate", !reducedMotion.matches);
    updateMotion();
    reducedMotion.addEventListener?.("change", updateMotion);
    model.addEventListener("error", () => {
      const fallbackSrc = model.dataset.fallbackSrc;
      if (fallbackSrc && model.getAttribute("src") !== fallbackSrc) {
        model.setAttribute("src", fallbackSrc);
      }
    });
  });
}

function upgradeLegacyHeader() {
  const oldHeader = document.querySelector(".site-header");
  if (!oldHeader) return;

  const fileName = window.location.pathname.split("/").pop() || "index.html";
  const active = (file) => fileName === file ? ' class="active" aria-current="page"' : "";
  oldHeader.outerHTML = `
    <header class="v2-header">
      <nav class="v2-nav" aria-label="Hauptnavigation">
        <div class="v2-nav-side v2-nav-left">
          <a href="index.html"${active("index.html")}>Home</a>
          <a href="historie.html"${active("historie.html")}>Historie</a>
          <a href="vorstandschaft.html"${active("vorstandschaft.html")}>Vorstandschaft</a>
          <a href="galerie.html"${active("galerie.html")}>Galerie</a>
        </div>
        <a class="v2-brand" href="index.html" aria-label="Jugendhaus Bad Imnau – Startseite">
          <img src="images/logo-white.png" alt="Jugendhaus Bad Imnau">
        </a>
        <div class="v2-nav-side v2-nav-right">
          <a href="karibische-nacht.html"${active("karibische-nacht.html")}>Karibische Nacht</a>
          <a href="veranstaltungen.html"${active("veranstaltungen.html")}>Veranstaltungen</a>
          <a href="kontakt.html"${active("kontakt.html")}>Kontakt</a>
        </div>
        <button class="v2-menu-button" type="button" aria-expanded="false" aria-controls="v2-mobile-menu">
          <span></span><span></span><span></span><span class="sr-only">Menü öffnen</span>
        </button>
        <div class="v2-mobile-menu" id="v2-mobile-menu">
          <a href="index.html">Home</a><a href="historie.html">Historie</a>
          <a href="vorstandschaft.html">Vorstandschaft</a><a href="galerie.html">Galerie</a>
          <a href="karibische-nacht.html">Karibische Nacht</a>
          <a href="veranstaltungen.html">Veranstaltungen</a><a href="kontakt.html">Kontakt</a>
        </div>
      </nav>
    </header>`;
}

function initV2Menu() {
  const button = document.querySelector(".v2-menu-button");
  const menu = document.querySelector(".v2-mobile-menu");
  if (!button || !menu) return;
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    const label = button.querySelector(".sr-only");
    if (label) label.textContent = open ? "Menü schließen" : "Menü öffnen";
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || button.getAttribute("aria-expanded") !== "true") return;
    button.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
    const label = button.querySelector(".sr-only");
    if (label) label.textContent = "Menü öffnen";
    button.focus();
  });
  menu.addEventListener("click", (event) => {
    if (!(event.target instanceof HTMLAnchorElement)) return;
    button.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  });
}

function initHouseModel() {
  const canvas = document.querySelector("#house-model");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let angle = -0.55, target = angle, dragging = false, lastX = 0, auto = true;
  const V = (x,y,z) => ({x,y,z});
  const faces = [];
  const face = (points, fill, stroke="#342f2a", width=1) => faces.push({points,fill,stroke,width});
  // Main building and side extension
  face([V(-2,-1.35,-1.25),V(2,-1.35,-1.25),V(2,1.05,-1.25),V(-2,1.05,-1.25)],"#e5e0d7");
  face([V(2,-1.35,-1.25),V(2,-1.35,1.25),V(2,1.05,1.25),V(2,1.05,-1.25)],"#c9c1b5");
  face([V(-2,-1.35,1.25),V(-2,-1.35,-1.25),V(-2,1.05,-1.25),V(-2,1.05,1.25)],"#d8d1c8");
  face([V(-2,-1.35,1.25),V(2,-1.35,1.25),V(2,1.05,1.25),V(-2,1.05,1.25)],"#f2eee7");
  // Gables and roof
  face([V(-2,1.05,1.25),V(2,1.05,1.25),V(0,2.45,1.25)],"#f3efe8");
  face([V(2,1.05,-1.25),V(-2,1.05,-1.25),V(0,2.45,-1.25)],"#d5cec4");
  face([V(-2,1.05,-1.38),V(0,2.45,-1.38),V(0,2.45,1.38),V(-2,1.05,1.38)],"#a54137","#6e2923",1.3);
  face([V(0,2.45,-1.38),V(2,1.05,-1.38),V(2,1.05,1.38),V(0,2.45,1.38)],"#bd5145","#6e2923",1.3);
  // Windows and door on front z=1.26
  const panel=(x1,y1,x2,y2,fill="#30434a")=>face([V(x1,y1,1.27),V(x2,y1,1.27),V(x2,y2,1.27),V(x1,y2,1.27)],fill,"#1d2528",1.2);
  panel(-1.63,-1.05,-.38,.25); panel(.65,-1.25,1.52,.35,"#eee9df");
  panel(-1.45,.55,-.72,1.12); panel(-.38,.5,.38,1.35); panel(.7,.55,1.42,1.12);
  // Window crossbars
  [[-1.005,-1.05,-1.005,.25],[-1.63,-.4,-.38,-.4],[-.0,.5,-.0,1.35],[-.38,.92,.38,.92]].forEach(l=>face([V(l[0]-.018,l[1],1.29),V(l[0]+.018,l[1],1.29),V(l[2]+.018,l[3],1.29),V(l[2]-.018,l[3],1.29)],"#e9e4dc","#e9e4dc",0));
  // Logo plaque
  panel(.58,.55,1.48,1.38,"#faf8f3");
  const project=(p,w,h)=>{const c=Math.cos(angle),s=Math.sin(angle),x=p.x*c-p.z*s,z=p.x*s+p.z*c,scale=Math.min(w/7.8,h/6.8)*(6.8/(6.8-z));return{x:w*.57+x*scale,y:h*.54-p.y*scale,z};};
  function draw(){const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(rect.width*dpr)||canvas.height!==Math.round(rect.height*dpr)){canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,rect.width,rect.height);angle+=(target-angle)*.12;if(auto&&!dragging)target+=.0018;const ordered=faces.map(f=>({...f,p:f.points.map(v=>project(v,rect.width,rect.height))})).sort((a,b)=>a.p.reduce((n,p)=>n+p.z,0)/a.p.length-b.p.reduce((n,p)=>n+p.z,0)/b.p.length);ordered.forEach(f=>{ctx.beginPath();f.p.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.globalAlpha=1;ctx.fillStyle=f.fill;ctx.fill();ctx.strokeStyle=f.stroke;ctx.lineWidth=f.width;ctx.stroke()});requestAnimationFrame(draw)}
  const start=e=>{dragging=true;auto=false;lastX=e.clientX;canvas.setPointerCapture?.(e.pointerId)};
  const move=e=>{if(!dragging)return;target+=(e.clientX-lastX)*.012;lastX=e.clientX};
  const end=()=>dragging=false;
  canvas.addEventListener("pointerdown",start);canvas.addEventListener("pointermove",move);canvas.addEventListener("pointerup",end);canvas.addEventListener("pointercancel",end);draw();
}

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

  document.querySelectorAll('.nav-menu a[data-page="index"]').forEach((link) => {
    link.textContent = "Home";
  });

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
