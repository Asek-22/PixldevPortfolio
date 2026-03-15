/**
 * projects.js — Загрузка и сохранение проектов через сервер
 * Depends on: utils.js, scroll.js (revealObserver)
 */
'use strict';

let projects = [];

// ── Загрузить проекты с сервера ──
async function loadProjects() {
  try {
    const res  = await fetch('/projects');
    projects   = await res.json();
  } catch {
    // Fallback: читать из встроенного JSON (локальный режим)
    projects = JSON.parse(document.getElementById('USER_DATA').textContent || '[]');
  }
  renderProjects();
}

// ── Сохранить проекты на сервере ──
async function persist() {
  try {
    const res = await fetch('/save', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(projects),
    });
    if (!res.ok) throw new Error('Server error');
  } catch {
    toast('Не удалось сохранить — проверьте сервер');
  }
}

// ── Построить карточку проекта ──
function buildCard(project, index) {
  const num      = String(index + 1).padStart(2, '0');
  const letter   = (project.name[0] || '?').toUpperCase();
  const tagsHtml = (project.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
  const linkHtml = project.url
    ? `<a href="${project.url}" target="_blank" rel="noopener" class="card-link">Смотреть <span>→</span></a>`
    : project.gh
      ? `<a href="${project.gh}" target="_blank" rel="noopener" class="card-link">GitHub <span>→</span></a>`
      : '';
  const visualHtml = project.image
    ? `<div class="card-visual"><img src="${project.image}" alt="${project.name}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block;transition:transform .5s" onmouseover="this.style.transform='scale(1.04)'" onmouseout="this.style.transform=''"></div>`
    : `<div class="card-visual vuser"><div class="vuser-dots"></div><div class="vuser-glow" style="background:${project.color}"></div><div class="vuser-letter" style="color:${project.color}">${letter}</div></div>`;

  const card = document.createElement('div');
  card.className = 'card reveal';
  card.innerHTML = `
    <button class="card-del" data-i="${index}" aria-label="Удалить проект">✕</button>
    ${visualHtml}
    <div class="card-info">
      <div class="card-num">// ${num}</div>
      <div class="card-cat" style="color:${project.color}">${project.category}</div>
      <h3 class="card-name">${project.name}</h3>
      <p class="card-desc">${project.desc}</p>
      <div class="card-tags">${tagsHtml}</div>
      ${linkHtml}
    </div>`;

  revealObserver.observe(card);
  return card;
}

// ── Отрисовать все проекты ──
function renderProjects() {
  const grid = document.getElementById('user-grid');
  grid.innerHTML = '';
  if (!projects.length) return;

  const row = document.createElement('div');
  row.className = 'pf-row3';
  projects.forEach((p, i) => row.appendChild(buildCard(p, i)));
  grid.appendChild(row);

  grid.querySelectorAll('.card-del').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      projects.splice(+btn.dataset.i, 1);
      await persist();
      renderProjects();
      toast('Проект удалён');
    });
  });
}

// Запуск
loadProjects();
