// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const nav = document.getElementById('nav');
const siteHeader = document.getElementById('header');

navToggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

nav.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Anchor scrolling that accounts for the sticky header's real, current height
// (CSS scroll-margin-top alone wasn't reliable across browsers/zoom levels).
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href').slice(1);
    const target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();

    const headerOffset = siteHeader.offsetHeight + 16;
    const targetTop = target.getBoundingClientRect().top + window.pageYOffset;
    const scrollTarget = Math.max(0, targetTop - headerOffset);

    window.scrollTo({ top: scrollTarget, behavior: 'smooth' });
  });
});

// Scroll-in reveal animations
const revealEls = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealEls.forEach((el) => observer.observe(el));

// Scroll-linked progress bar + hero glow parallax
const progressBar = document.getElementById('progress-bar');
const heroGlow = document.getElementById('hero-glow');

let ticking = false;

function onScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = progress + '%';

  if (heroGlow) {
    const shift = Math.min(scrollTop * 0.3, 200);
    const fade = Math.max(1 - scrollTop / 600, 0);
    heroGlow.style.transform = `translateY(${shift}px)`;
    heroGlow.style.opacity = fade;
  }

  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
});

onScroll();
