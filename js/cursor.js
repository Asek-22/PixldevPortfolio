/**
 * cursor.js — Custom crosshair cursor with trailing dots
 */
(function () {
  // ── Crosshair element ──
  const cursor = document.createElement('div');
  cursor.style.cssText = 'position:fixed;top:0;left:0;width:20px;height:20px;pointer-events:none;z-index:99999;transform:translate(-50%,-50%);transition:width .15s,height .15s;';

  const hLine = document.createElement('div');
  hLine.style.cssText = 'position:absolute;top:50%;left:0;width:100%;height:1px;background:#a78bfa;box-shadow:0 0 5px rgba(167,139,250,.9);margin-top:-.5px;';

  const vLine = document.createElement('div');
  vLine.style.cssText = 'position:absolute;left:50%;top:0;width:1px;height:100%;background:#a78bfa;box-shadow:0 0 5px rgba(167,139,250,.9);margin-left:-.5px;';

  const dot = document.createElement('div');
  dot.style.cssText = 'position:absolute;top:50%;left:50%;width:3px;height:3px;background:#a78bfa;border-radius:50%;margin:-1.5px 0 0 -1.5px;box-shadow:0 0 6px #a78bfa;';

  cursor.append(hLine, vLine, dot);
  document.body.appendChild(cursor);

  // ── Trail dots ──
  const N     = 20;
  const trail = Array.from({ length: N }, (_, i) => {
    const size    = Math.max(0.5, 3 - i * 0.13).toFixed(2);
    const opacity = ((N - i) / N * 0.45).toFixed(2);
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;top:0;left:0;border-radius:50%;background:#a78bfa;pointer-events:none;z-index:99998;width:${size}px;height:${size}px;transform:translate(-50%,-50%);opacity:${opacity};`;
    document.body.appendChild(el);
    return { el, x: 0, y: 0 };
  });

  // ── Track mouse ──
  let mx = 0, my = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  }, { passive: true });

  // ── Animate trail ──
  (function tick() {
    let px = mx, py = my;
    for (let i = 0; i < N; i++) {
      const p     = trail[i];
      const speed = 0.12 - i * 0.004;
      p.x += (px - p.x) * speed;
      p.y += (py - p.y) * speed;
      p.el.style.left = p.x + 'px';
      p.el.style.top  = p.y + 'px';
      px = p.x; py = p.y;
    }
    requestAnimationFrame(tick);
  })();

  // ── Grow on interactive elements ──
  document.querySelectorAll('a, button, label, .card, .color-opt').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.style.width = '30px'; cursor.style.height = '30px'; });
    el.addEventListener('mouseleave', () => { cursor.style.width = '20px'; cursor.style.height = '20px'; });
  });
})();
