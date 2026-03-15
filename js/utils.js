/**
 * utils.js — Shared utilities used across modules
 */
'use strict';

// ── Toast notification ──
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2800);
}

// ── SHA-256 hash (for admin auth) ──
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Shake an invalid form field ──
function shakeInvalid(el) {
  el.style.borderColor = '#d4654a';
  el.style.animation   = 'shake .4s ease';
  setTimeout(() => { el.style.borderColor = ''; el.style.animation = ''; }, 600);
}

// ── Open/close modal overlays (pauses Lenis) ──
function openOverlay(el) {
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
  if (typeof lenis !== 'undefined' && lenis) lenis.stop();
}

function closeOverlay(el) {
  el.classList.remove('open');
  document.body.style.overflow = '';
  if (typeof lenis !== 'undefined' && lenis) lenis.start();
}
