// ===== Slide deck engine =====
const deck = document.getElementById("deck");
const slides = Array.from(document.querySelectorAll(".slide"));
const dots = Array.from(document.querySelectorAll(".dot"));
const lapFill = document.getElementById("lapFill");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const total = slides.length;

let current = 0;
let locked = false;

function goTo(index) {
  index = Math.max(0, Math.min(total - 1, index));
  if (index === current || locked) return;
  locked = true;
  current = index;
  render();
  // release lock after the slide transition finishes
  setTimeout(() => (locked = false), 850);
}

function next() { goTo(current + 1); }
function prev() { goTo(current - 1); }

function render() {
  deck.style.transform = `translateX(-${current * 100}vw)`;

  slides.forEach((s, i) => s.classList.toggle("active", i === current));
  dots.forEach((d, i) => d.classList.toggle("active", i === current));

  // lap progress bar
  lapFill.style.width = ((current + 1) / total) * 100 + "%";

  // arrow states
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === total - 1;

  // fire counters when hero is active
  if (current === 0) runCounters();
}

// ===== Navigation triggers =====
document.querySelectorAll("[data-goto]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    goTo(+el.dataset.goto);
  });
});
nextBtn.addEventListener("click", next);
prevBtn.addEventListener("click", prev);

// ===== Keyboard =====
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); next(); }
  else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); prev(); }
  else if (e.key === "Home") { e.preventDefault(); goTo(0); }
  else if (e.key === "End") { e.preventDefault(); goTo(total - 1); }
});

// ===== Mouse wheel / trackpad =====
let wheelTimer = null;
window.addEventListener(
  "wheel",
  (e) => {
    // allow inner vertical scroll when the slide content overflows
    const inner = e.target.closest(".slide-inner");
    if (inner && inner.scrollHeight > inner.clientHeight + 4) {
      const atTop = inner.scrollTop <= 0;
      const atBottom = inner.scrollTop + inner.clientHeight >= inner.scrollHeight - 1;
      const goingDown = e.deltaY > 0;
      if ((goingDown && !atBottom) || (!goingDown && !atTop)) return; // scroll inside first
    }
    e.preventDefault();
    if (locked) return;
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 15) return;
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      delta > 0 ? next() : prev();
    }, 30);
  },
  { passive: false }
);

// ===== Touch swipe =====
let touchStartX = 0;
let touchStartY = 0;
window.addEventListener(
  "touchstart",
  (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  },
  { passive: true }
);
window.addEventListener(
  "touchend",
  (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // horizontal swipe only, ignore mostly-vertical gestures (inner scroll)
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      dx < 0 ? next() : prev();
    }
  },
  { passive: true }
);

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
render();
