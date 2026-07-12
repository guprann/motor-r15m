// ===== Scroll progress bar =====
const progress = document.getElementById("scrollProgress");
window.addEventListener("scroll", () => {
  const h = document.documentElement;
  const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  progress.style.width = scrolled + "%";
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

// ===== Reveal on scroll =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = (i % 6) * 0.08 + "s";
  observer.observe(el);
});

// ===== Animated counters =====
const counters = document.querySelectorAll(".num");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.target;
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 60));
      const tick = () => {
        current += step;
        if (current >= target) {
          el.textContent = target;
        } else {
          el.textContent = current;
          requestAnimationFrame(tick);
        }
      };
      tick();
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.5 }
);
counters.forEach((c) => counterObserver.observe(c));

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

// ===== Parallax hero image =====
const heroImg = document.querySelector(".hero-img");
window.addEventListener("scroll", () => {
  if (!heroImg) return;
  const offset = window.scrollY * 0.06;
  heroImg.style.filter = `drop-shadow(0 ${offset}px ${offset}px rgba(0,0,0,0.4))`;
});
