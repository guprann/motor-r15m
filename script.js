// ===== Section scroll engine =====
const slides = Array.from(document.querySelectorAll(".slide"));
const dots = Array.from(document.querySelectorAll(".dot"));
const lapFill = document.getElementById("lapFill");
const total = slides.length;

// ===== Smooth scroll navigation (nav links + dots) =====
document.querySelectorAll("[data-goto]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    const target = slides[+el.dataset.goto];
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

// ===== Scroll progress bar =====
window.addEventListener(
  "scroll",
  () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? doc.scrollTop / max : 0;
    lapFill.style.width = Math.min(100, Math.max(0, ratio * 100)) + "%";
  },
  { passive: true }
);

// ===== Reveal on view + sync dots + fire counters =====
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("active");
      const idx = slides.indexOf(entry.target);
      dots.forEach((d, i) => d.classList.toggle("active", i === idx));
      if (idx === 0) runCounters();
    });
  },
  { threshold: 0.35 }
);
slides.forEach((s) => io.observe(s));

// ===== Keyboard: jump to first / last section =====
window.addEventListener("keydown", (e) => {
  if (e.key === "Home") { e.preventDefault(); slides[0]?.scrollIntoView({ behavior: "smooth" }); }
  else if (e.key === "End") { e.preventDefault(); slides[total - 1]?.scrollIntoView({ behavior: "smooth" }); }
});

// ===== Cursor glow (desktop only) =====
const glow = document.getElementById("cursorGlow");
if (window.matchMedia("(pointer:fine)").matches) {
  window.addEventListener("mousemove", (e) => {
    glow.style.left = e.clientX + "px";
    glow.style.top = e.clientY + "px";
  });
} else {
  glow.style.display = "none";
}

// ===== Animated counters (re-run each time hero shows) =====
let countersDone = false;
function runCounters() {
  if (countersDone) return;
  countersDone = true;
  document.querySelectorAll(".num").forEach((el) => {
    const target = +el.dataset.target;
    let value = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const tick = () => {
      value += step;
      if (value >= target) {
        el.textContent = target;
      } else {
        el.textContent = value;
        requestAnimationFrame(tick);
      }
    };
    tick();
  });
}

// ===== 3D tilt on gallery items (desktop only) =====
if (window.matchMedia("(pointer:fine)").matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

// ===== Init =====
if (slides[0]) { slides[0].classList.add("active"); dots[0]?.classList.add("active"); }
runCounters();
