/**
 * admin.js — Admin auth + Add Project modal
 * Depends on: utils.js, projects.js
 */
'use strict';

/* ════════════════════════════════════════
   ADMIN AUTH
════════════════════════════════════════ */
const ADMIN_HASH     = '8da14e7ea28ecf512984e118857d22292cb0b42936b4a6b2c80c4c96f6c52f82';
const authOverlay    = document.getElementById('authOverlay');
const addBtn         = document.getElementById('addBtn');
const adminLogoutBtn = document.getElementById('adminLogoutBtn');

function setAdminMode(on) {
  addBtn.style.display         = on ? 'flex' : 'none';
  adminLogoutBtn.style.display = on ? 'flex' : 'none';
  document.body.classList.toggle('is-admin', on);
  on ? sessionStorage.setItem('admin', '1') : sessionStorage.removeItem('admin');
}

if (sessionStorage.getItem('admin') === '1') setAdminMode(true);

// Secret key sequence: type "aezakmi" to open auth modal
const SECRET = 'aezakmi';
let keyBuffer = '';

document.addEventListener('keydown', e => {
  if (authOverlay.classList.contains('open')) return;
  keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-SECRET.length);
  if (keyBuffer === SECRET) { keyBuffer = ''; openAuthModal(); }
});

function openAuthModal() {
  openOverlay(authOverlay);
  setTimeout(() => document.getElementById('adminPassword').focus(), 100);
}

function closeAuth() {
  closeOverlay(authOverlay);
  document.getElementById('adminPassword').value = '';
}

async function tryLogin() {
  const hash = await sha256(document.getElementById('adminPassword').value);
  if (hash === ADMIN_HASH) {
    setAdminMode(true);
    closeAuth();
    toast('Добро пожаловать, админ 👋');
  } else {
    shakeInvalid(document.getElementById('adminPassword'));
    toast('Неверный пароль');
  }
}

document.getElementById('authSubmitBtn').addEventListener('click', tryLogin);
document.getElementById('authCloseBtn').addEventListener('click', closeAuth);
document.getElementById('authCancelBtn').addEventListener('click', closeAuth);
authOverlay.addEventListener('click', e => { if (e.target === authOverlay) closeAuth(); });
document.getElementById('adminPassword').addEventListener('keydown', e => {
  if (e.key === 'Enter')  tryLogin();
  if (e.key === 'Escape') closeAuth();
});
adminLogoutBtn.addEventListener('click', () => { setAdminMode(false); toast('Вы вышли из режима админа'); });

/* ════════════════════════════════════════
   ADD PROJECT MODAL
════════════════════════════════════════ */
const overlay = document.getElementById('overlay');

// Form state
let selColor = '#c8a96e';
let tags     = [];
let imgData  = null;

function openModal()  { openOverlay(overlay); overlay.scrollTop = 0; }
function closeModal() { closeOverlay(overlay); resetForm(); }

// Prevent Lenis stealing scroll inside the modal
overlay.addEventListener('wheel', e => e.stopPropagation(), { passive: true });
overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

addBtn.addEventListener('click', openModal);
document.getElementById('closeBtn').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeAuth(); }
});

// ── Color picker ──
document.querySelectorAll('.color-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.color-opt').forEach(o => o.classList.remove('sel'));
    opt.classList.add('sel');
    selColor = opt.dataset.c;
  });
});

// ── Tags ──
const tagsInput = document.getElementById('tagsInput');
const tagsWrap  = document.getElementById('tagsWrap');

function addTag(value) {
  value = value.replace(/,/g, '').trim();
  if (!value || tags.includes(value) || tags.length >= 8) return;
  tags.push(value);
  renderTags();
  tagsInput.value = '';
}

function renderTags() {
  tagsWrap.querySelectorAll('.tpill').forEach(p => p.remove());
  tags.forEach((tag, i) => {
    const pill = document.createElement('span');
    pill.className = 'tpill';
    pill.innerHTML = `${tag}<button class="tpill-x" data-i="${i}" aria-label="Удалить тег">×</button>`;
    tagsWrap.insertBefore(pill, tagsInput);
  });
  tagsWrap.querySelectorAll('.tpill-x').forEach(x => {
    x.addEventListener('click', () => { tags.splice(+x.dataset.i, 1); renderTags(); });
  });
}

tagsInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagsInput.value); }
  if (e.key === 'Backspace' && !tagsInput.value && tags.length) { tags.pop(); renderTags(); }
});

// ── Image upload ──
const uploadArea  = document.getElementById('uploadArea');
const fileInput   = document.getElementById('f-img');
const previewWrap = document.getElementById('previewWrap');
const imgPreview  = document.getElementById('imgPreview');

function setImage(dataUrl) {
  imgData                   = dataUrl;
  imgPreview.src            = dataUrl;
  uploadArea.style.display  = 'none';
  previewWrap.style.display = 'block';
}

function clearImage() {
  imgData                   = null;
  fileInput.value           = '';
  imgPreview.src            = '';
  uploadArea.style.display  = '';
  previewWrap.style.display = 'none';
}

function handleFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 5 * 1024 * 1024) { toast('Файл слишком большой — до 5MB'); return; }
  const reader = new FileReader();
  reader.onload = ev => setImage(ev.target.result);
  reader.readAsDataURL(file);
}

document.getElementById('removeImg').addEventListener('click', clearImage);
fileInput.addEventListener('change', e => handleFile(e.target.files[0]));
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.style.borderColor = 'var(--accent)'; });
uploadArea.addEventListener('dragleave', () => uploadArea.style.borderColor = '');
uploadArea.addEventListener('drop', e => {
  e.preventDefault();
  uploadArea.style.borderColor = '';
  handleFile(e.dataTransfer.files[0]);
});

// ── Reset form to defaults ──
function resetForm() {
  ['f-name', 'f-desc', 'f-url', 'f-gh'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('f-cat').selectedIndex = 0;
  tags     = [];
  selColor = '#c8a96e';
  renderTags();
  document.querySelectorAll('.color-opt').forEach(o => o.classList.remove('sel'));
  document.querySelector('.color-opt[data-c="#c8a96e"]').classList.add('sel');
  clearImage();
}

// ── Submit new project ──
document.getElementById('submitBtn').addEventListener('click', async () => {
  const nameEl = document.getElementById('f-name');
  const descEl = document.getElementById('f-desc');
  const name   = nameEl.value.trim();
  const desc   = descEl.value.trim();

  if (!name) { shakeInvalid(nameEl); return; }
  if (!desc) { shakeInvalid(descEl); return; }

  projects.push({
    id:       Date.now(),
    name,
    desc,
    category: document.getElementById('f-cat').value,
    url:      document.getElementById('f-url').value.trim(),
    gh:       document.getElementById('f-gh').value.trim(),
    tags:     [...tags],
    color:    selColor,
    image:    imgData || null,
  });

  await persist();
  renderProjects();
  closeModal();
  toast('Проект добавлен!');
  setTimeout(() => document.getElementById('user-grid').scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);
});
