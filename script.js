// Light / dark theme switch (initial value is set by an inline script in <head>)
const themeToggle = document.getElementById('theme-toggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');
function applyTheme(theme, save) {
  document.documentElement.setAttribute('data-theme', theme);
  if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#0e0f14' : '#f8f9fc');
  if (themeToggle) themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  if (save) { try { localStorage.setItem('theme', theme); } catch (e) {} }
  window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
}
applyTheme(document.documentElement.getAttribute('data-theme') || 'light', false);
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next, true);
  });
}

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

// Email address is kept out of the HTML source (and stored reversed here)
// so harvesting bots scanning for mailto:/plain addresses don't pick it up.
document.querySelectorAll('.email-link').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const user = '80enomiseroifleb'.split('').reverse().join('');
    const domain = 'moc.liamg'.split('').reverse().join('');
    window.location.href = 'mailto:' + user + '@' + domain;
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

    window.scrollTo({ top: scrollTarget, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
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

// Scroll-linked progress bar
const progressBar = document.getElementById('progress-bar');

let ticking = false;

function onScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = progress + '%';
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(onScroll);
    ticking = true;
  }
});

onScroll();

// Ring-field particle background (visual style modelled on antigravity.google).
// A big soft ring follows the pointer with lag (or wanders on noise when idle).
// Thousands of tiny pill-shaped particles live on an even grid; a layered noise
// field makes them flow, swell and shrink, the ring band swells them most and
// pushes them outward, and each pill points away from the ring centre.
(function particleField() {
  const canvas = document.getElementById('fx-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const isSmall = () => window.innerWidth <= 768;

  // ---- Perlin noise (3D) --------------------------------------------------
  const perm = new Uint8Array(512);
  (function seed() {
    const p = Array.from({ length: 256 }, (_, i) => i);
    for (let i = 255; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const tmp = p[i]; p[i] = p[j]; p[j] = tmp;
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  })();
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + t * (b - a);
  function grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  }
  function noise(x, y, z) {
    const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    x -= X; y -= Y; z -= Z;
    const xi = X & 255, yi = Y & 255, zi = Z & 255;
    const u = fade(x), v = fade(y), w = fade(z);
    const A = perm[xi] + yi, AA = perm[A] + zi, AB = perm[A + 1] + zi;
    const B = perm[xi + 1] + yi, BA = perm[B] + zi, BB = perm[B + 1] + zi;
    return 1.6 * lerp(
      lerp(lerp(grad(perm[AA], x, y, z), grad(perm[BA], x - 1, y, z), u),
           lerp(grad(perm[AB], x, y - 1, z), grad(perm[BB], x - 1, y - 1, z), u), v),
      lerp(lerp(grad(perm[AA + 1], x, y, z - 1), grad(perm[BA + 1], x - 1, y, z - 1), u),
           lerp(grad(perm[AB + 1], x, y - 1, z - 1), grad(perm[BB + 1], x - 1, y - 1, z - 1), u), v),
      w);
  }

  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smooth = (e0, e1, x) => {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  };

  // ---- Theme-dependent look ------------------------------------------------
  const THEMES = {
    light: { c: [[44, 100, 237], [248, 66, 66], [255, 207, 3]], ringW: 0.006, ringW2: 0.107, disp: 0.62, dim: false },
    dark:  { c: [[113, 137, 255], [48, 116, 249], [0, 0, 0]],   ringW: 0.15,  ringW2: 0.05,  disp: 0.23, dim: true }
  };
  let theme = THEMES.light;
  let lut = [];
  function pickTheme() {
    theme = document.documentElement.getAttribute('data-theme') === 'dark' ? THEMES.dark : THEMES.light;
    const c1 = theme.c[0], c2 = theme.c[1], c3 = theme.c[2];
    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    lut = [];
    for (let k = 0; k < 48; k++) {
      const pr = k / 47, hh = 0.8;
      const c = pr < hh ? mix(c1, c2, pr / hh) : mix(c2, c3, (pr - hh) / (1 - hh));
      lut.push('rgb(' + c.join(',') + ')');
    }
    if (reduceMotion.matches && n) frame(5, 0, true);
  }
  window.addEventListener('themechange', pickTheme);

  // ---- Particles ----------------------------------------------------------
  const VIEW_HALF_H = 0.226;           // field units visible above/below centre
  let w = 0, h = 0, n = 0, fs = 0, sizeK = 7;
  let rx, ry, ox, oy, sc;              // ref pos (field units), offset, scale
  const ring = { x: 0, y: 0 };
  const mouse = { x: 0, y: 0, over: false };
  let raf = 0, prevT = 0, simT = 0, skip = 0;

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fs = (VIEW_HALF_H * 2) / h;                 // field units per css px
    sizeK = 3.6 * clamp(w / 1600, 0.8, 1.2);

    const max = isSmall() ? 2200 : 6000;
    const step = Math.max(isSmall() ? 14 : 12, Math.sqrt((w * h) / max));
    const margin = 90;                          // room for displacement at edges
    const cols = Math.ceil((w + margin * 2) / step);
    const rows = Math.ceil((h + margin * 2) / step);
    n = cols * rows;
    rx = new Float32Array(n); ry = new Float32Array(n);
    ox = new Float32Array(n); oy = new Float32Array(n);
    sc = new Float32Array(n);
    let i = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++, i++) {
        const sx = -margin + (c + 0.5 + (Math.random() - 0.5) * 0.95) * step;
        const sy = -margin + (r + 0.5 + (Math.random() - 0.5) * 0.95) * step;
        rx[i] = (sx - w / 2) * fs;
        ry[i] = -(sy - h / 2) * fs;
      }
    }
    if (reduceMotion.matches) frame(5, 0, true);
  }

  // One simulation + draw step. t = seconds, dt = seconds, settle = jump to target.
  function frame(t, dt, settle) {
    // ring centre: follows pointer slowly, otherwise wanders on noise
    const time = t * 0.5;
    const wx = noise(t * 0.66 + 94.2, 1.3, 0) * 0.2;
    const wy = noise(t * 0.75 + 21.0, 7.7, 0) * 0.1;
    let tx = wx, ty = wy, follow = 1 - Math.exp(-dt * 0.6);
    if (mouse.over) {
      tx = (mouse.x - w / 2) * fs * 0.9 + wx * 0.5;
      ty = -(mouse.y - h / 2) * fs * 0.9 + wy * 0.5;
      follow = 1 - Math.exp(-dt * 1.3);
    }
    if (settle) follow = 1;
    ring.x += (tx - ring.x) * follow;
    ring.y += (ty - ring.y) * follow;

    const R = 0.175 + Math.sin(t) * 0.03 + Math.cos(t * 3) * 0.02;
    const rw = theme.ringW, rw2 = theme.ringW2, disp = theme.disp;
    const sk = settle ? 1 : 1 - Math.pow(0.8, dt * 60);       // scale smoothing
    const ok = settle ? 1 : 1 - Math.pow(0.7, dt * 60);       // offset smoothing
    const ringSx = w / 2 + ring.x / fs, ringSy = h / 2 - ring.y / fs;

    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';

    for (let i = 0; i < n; i++) {
      const cx = rx[i], cy = ry[i];
      const dist = Math.hypot(cx - ring.x, cy - ring.y);

      // ring + noise driven target scale
      const n0 = noise(cx * 0.2 + 18.49, cy * 0.2 + 72.97, time * 0.5);
      const dist1 = Math.hypot(cx + n0 * 0.005 - ring.x, cy + n0 * 0.005 - ring.y);
      let t1 = smooth(R - rw * 2, R, dist) - smooth(R, R + rw, dist1);
      let t2 = smooth(R - rw2 * 2, R, dist) - smooth(R, R + rw2, dist1);
      const t3 = smooth(R + rw2, R, dist);
      t1 = Math.pow(Math.max(t1, 0), 2);
      t2 = Math.pow(Math.max(t2, 0), 3);
      let tgt = t1 + t2 * 3 + t3 * 0.4;
      tgt += noise(cx * 30 + 11.49, cy * 30 + 12.97, time * 0.5) * t3 * 0.5;
      const nS = noise(cx * 2 + 18.49, cy * 2 + 72.97, time * 0.5);
      tgt += Math.pow((nS + 1.5) * 0.5, 2) * 0.6;

      // flowing displacement
      let dx = noise(cx * 4 + 88.49, cy * 4 + 32.44, time * 0.35) * 0.03 +
               noise(cx * 20 + 18.49, cy * 20 + 72.97, time * 0.5) * 0.005;
      let dy = noise(cx * 4 + 50.9, cy * 4 + 120.9, time * 0.35) * 0.03 +
               noise(cx * 20 + 50.9, cy * 20 + 120.9, time * 0.5) * 0.005;
      const dc = clamp(dist, 0, 1);
      dx += Math.sin(cx * 20 + time * 4) * 0.02 * dc;
      dy += Math.cos(cy * 20 + time * 3) * 0.02 * dc;

      // ring band pushes particles outward
      const k = Math.pow(t2, 0.75) * disp * 0.31;
      ox[i] += (-(ring.x - (cx + dx)) * k - ox[i]) * ok;
      oy[i] += (-(ring.y - (cy + dy)) * k - oy[i]) * ok;
      sc[i] += (tgt - sc[i]) * sk;

      const s = sc[i];
      const a = smooth(0.1, 0.2, s);
      if (a < 0.02) continue;

      const fx = cx + dx + ox[i], fy = cy + dy + oy[i];
      const sx = w / 2 + fx / fs, sy = h / 2 - fy / fs;

      // orientation: radial from ring centre, wobbled by noise
      const na = noise(fx * 10 + 18.49, fy * 10 + 72.97, t * 0.85);
      const th = Math.atan2(sy - ringSy, sx - ringSx) + na * 0.5;

      // colour from a slow noise gradient (blue -> red -> yellow)
      const nc = (noise(fx * 2 + 74.66, fy * 2 + 91.56, t * 0.5) + 1) * 0.5;
      const prog = smooth(0, 0.75, nc * nc);

      const len = Math.min(s * sizeK, 8);
      const thick = clamp(len * 0.34, 1, 2.2);
      const half = Math.max(len - thick, 0) * 0.5;
      const cs = Math.cos(th) * half, sn = Math.sin(th) * half;

      ctx.globalAlpha = (theme.dim ? a * clamp(s * 0.9, 0, 1) : a) * 0.75;
      ctx.strokeStyle = lut[(prog * 47) | 0];
      ctx.lineWidth = thick;
      ctx.beginPath();
      ctx.moveTo(sx - cs, sy - sn);
      ctx.lineTo(sx + cs, sy + sn);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (isSmall()) { skip ^= 1; if (skip) return; }   // half rate on phones
    const dt = Math.min((now - prevT) / 1000 || 0.016, 0.05);
    prevT = now;
    simT += dt;
    frame(simT, dt, false);
  }

  function start() {
    cancelAnimationFrame(raf);
    if (reduceMotion.matches) { frame(5, 0, true); return; }
    prevT = performance.now();
    raf = requestAnimationFrame(loop);
  }

  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.over = true;
  }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse.over = false; });
  window.addEventListener('blur', () => { mouse.over = false; });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 150);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(raf); else start();
  });
  reduceMotion.addEventListener('change', () => { build(); start(); });

  // Full strength in the hero, quiet background once the reader scrolls on.
  const hero = document.querySelector('.hero');
  let fadeQueued = false;
  function updateFade() {
    fadeQueued = false;
    const end = hero ? hero.offsetHeight : h;
    const p = clamp(window.scrollY / (end * 0.8), 0, 1);
    canvas.style.opacity = String(1 - p * 0.7);
  }
  window.addEventListener('scroll', () => {
    if (!fadeQueued) { fadeQueued = true; requestAnimationFrame(updateFade); }
  }, { passive: true });
  updateFade();

  simT = 3 + Math.random() * 20;                      // different pattern each visit
  pickTheme();
  build();
  start();
})();
