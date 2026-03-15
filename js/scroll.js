/**
 * scroll.js — Sticky nav + scroll reveal + Lenis smooth scroll
 */
'use strict';

// ── Sticky nav ──
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('sc', window.scrollY > 50);
}, { passive: true });

// ── Scroll reveal ──
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('vis');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: .08 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Lenis smooth scroll (loaded via defer, init after load) ──
let lenis = null;

window.addEventListener('load', () => {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) { e.preventDefault(); lenis.scrollTo(target, { duration: 1.4 }); }
    });
  });
});
