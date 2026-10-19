// Mi Foco — todo se guarda en el propio móvil (localStorage)
const KEY = 'mi-foco-v1';
const $ = (s) => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always' }).format(n || 0);
const num = (v) => { const n = parseFloat(String(v).replace(/\./g, '').replace(',', '.')); return isFinite(n) && n > 0 ? n : 0; };
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const niceDate = (k) => new Date(k + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

const AVATARS = ['😎', '🙂', '🦸', '🧑‍💻', '🚀', '🦁', '🐬', '🌞'];
const THIEF_ACTIONS = [
  { v: 'stop', label: '🛑 Dejar' },
  { v: 'later', label: '⏳ Posponer' },
  { v: 'improve', label: '🔧 Mejorar' },
];

function sampleData() {
  const y = new Date(); y.setDate(y.getDate() - 1);
  return {
    goal: { title: 'Vivir en Punta Cana', emoji: '🌴', target: 20000, saved: 0, avatar: '😎', photo: null },
    tasks: [
      { id: uid(), title: 'Enviar 5 propuestas a clientes potenciales', cat: 'priority', done: false },
      { id: uid(), title: 'Publicar mi servicio en 2 webs de freelance', cat: 'priority', done: false },
      { id: uid(), title: 'Apartar 200 € para el ahorro del mes', cat: 'priority', done: false },
      { id: uid(), title: 'Actualizar mi portfolio con 3 trabajos', cat: 'priority', done: false },
      { id: uid(), title: 'Ordenar las carpetas del ordenador', cat: 'secondary', done: false },
      { id: uid(), title: 'Ver el curso de edición de vídeo', cat: 'secondary', done: false },
      { id: uid(), title: 'Cambiar el fondo de pantalla', cat: 'secondary', done: true },
    ],
    thieves: [
      { id: uid(), text: 'Scroll en redes sociales por la noche', action: 'stop' },
      { id: uid(), text: 'Mirar el correo cada 10 minutos', action: 'improve' },
      { id: uid(), text: 'Ver series entre semana', action: 'later' },
    ],
    log: { [dayKey(y)]: { progress: 'Terminé mi CV y lo envié a 2 empresas.', obstacles: 'Me distraje con el móvil por la tarde.' } },
    tab: 'priority',
  };
}

let S = load();
function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.goal) return d; } catch (e) {}
  return sampleData();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('⚠️ No se ha podido guardar. Prueba con una foto más pequeña.'); }
}

/* ---------- Navegación ---------- */
function go(view) {
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + view));
  document.querySelectorAll('.nav button').forEach((b) => b.classList.toggle('active', b.dataset.go === view));
  window.scrollTo(0, 0);
}

/* ---------- Pintar ---------- */
function setAvatar(el) {
  const g = S.goal;
  el.style.backgroundImage = g.photo ? `url(${g.photo})` : '';
  el.textContent = g.photo ? '' : g.avatar;
}

function motto(p) {
  if (p >= 100) return '¡Lo has conseguido! 🎉 A hacer las maletas';
  if (p >= 75) return 'Ya casi lo tocas con los dedos 🏁';
  if (p >= 50) return 'Has pasado la mitad. ¡No pares! 🚀';
  if (p >= 25) return 'Buen ritmo, sigue sumando 💪';
  if (p > 0) return 'Cada euro cuenta. ¡Ya has empezado! ✨';
  return 'Hoy es el primer paso del camino 👣';
}

function renderHome() {
  const g = S.goal;
  const p = g.target > 0 ? Math.min(100, (g.saved / g.target) * 100) : 0;
  const pRound = p >= 100 ? 100 : Math.floor(p * 10) / 10;
  $('#goalEmoji').textContent = g.emoji;
  $('#goalTitle').textContent = g.title;
  $('#motto').textContent = motto(p);
  $('#pct').textContent = String(pRound).replace('.', ',');
  $('#bar').style.width = p + '%';
  $('#sTarget').textContent = eur(g.target);
  $('#sSaved').textContent = eur(g.saved);
  $('#sLeft').textContent = eur(Math.max(0, g.target - g.saved));
  $('#jSaved').textContent = eur(g.saved);
  $('#jTarget').textContent = eur(g.target);
  $('#trackFill').style.width = p + '%';
  $('#traveler').style.left = p + '%';
  $('#finishEmoji').textContent = g.emoji;
  setAvatar($('#heroAvatar'));
  setAvatar($('#travelerAvatar'));

  const pending = S.tasks.filter((t) => t.cat === 'priority' && !t.done).length;
  $('#todayText').textContent = pending
    ? `Hoy: ${pending} ${pending === 1 ? 'tarea prioritaria pendiente' : 'tareas prioritarias pendientes'}`
    : '¡Prioridades al día! Revisa tu enfoque';
}

function taskHTML(t) {
  return `<li class="task ${t.cat} ${t.done ? 'done' : ''}" data-id="${t.id}">
    <button class="check" data-act="toggle" aria-label="Completar">✓</button>
    <span class="t-title">${esc(t.title)}</span>
    <button class="icon" data-act="edit" aria-label="Editar">✏️</button>
    <button class="icon" data-act="del" aria-label="Eliminar">🗑️</button>
  </li>`;
}

function renderTasks() {
  const tab = S.tab;
  document.querySelectorAll('#seg button').forEach((b) => b.classList.toggle('on', b.dataset.tab === tab));
  const pend = (c) => S.tasks.filter((t) => t.cat === c && !t.done).length;
  $('#cPri').textContent = pend('priority');
  $('#cSec').textContent = pend('secondary');
  $('#tabHint').textContent = tab === 'priority'
    ? 'Lo que te acerca a tu objetivo o te genera ingresos. Empieza por aquí 👇'
    : 'Útiles, pero no urgentes. Solo cuando acabes las prioritarias 😉';
  $('#newTask').placeholder = tab === 'priority' ? 'Nueva tarea prioritaria…' : 'Nueva tarea secundaria…';

  const list = S.tasks.filter((t) => t.cat === tab).sort((a, b) => a.done - b.done);
  $('#taskList').innerHTML = list.length
    ? list.map(taskHTML).join('')
    : `<li class="empty"><span>${tab === 'priority' ? '🔥' : '🧩'}</span>No hay tareas aquí. ¡Añade una arriba!</li>`;
}

function renderFocus() {
  const top = S.tasks.filter((t) => t.cat === 'priority' && !t.done).slice(0, 3);
  const anyPri = S.tasks.some((t) => t.cat === 'priority');
  $('#top3').innerHTML = top.length
    ? top.map(taskHTML).join('')
    : `<li class="empty"><span>${anyPri ? '🎉' : '✍️'}</span>${anyPri ? '¡Has completado todas tus prioridades!' : 'Añade tareas prioritarias en la pestaña Tareas.'}</li>`;

  $('#thieves').innerHTML = S.thieves.length
    ? S.thieves.map((x) => `<li class="thief" data-id="${x.id}">
        <div class="thief-top"><span>${esc(x.text)}</span><button class="icon" data-act="del-thief" aria-label="Eliminar">🗑️</button></div>
        <div class="chips">${THIEF_ACTIONS.map((a) => `<button class="chip ${a.v} ${x.action === a.v ? 'on' : ''}" data-act="thief-action" data-v="${a.v}">${a.label}</button>`).join('')}</div>
      </li>`).join('')
    : '<li class="empty"><span>🧘</span>Nada que te robe tiempo. ¡Así se hace!</li>';

  const today = dayKey();
  $('#todayDate').textContent = niceDate(today);
  const entry = S.log[today] || {};
  if (document.activeElement !== $('#logProgress')) $('#logProgress').value = entry.progress || '';
  if (document.activeElement !== $('#logObstacles')) $('#logObstacles').value = entry.obstacles || '';

  const past = Object.keys(S.log).filter((k) => k !== today && (S.log[k].progress || S.log[k].obstacles)).sort().reverse().slice(0, 14);
  $('#pastLogs').innerHTML = past.length
    ? `<details class="past"><summary>📅 Días anteriores (${past.length})</summary>${past.map((k) => `
        <div class="past-day"><b>${esc(niceDate(k))}</b>
          ${S.log[k].progress ? `<p>✅ ${esc(S.log[k].progress)}</p>` : ''}
          ${S.log[k].obstacles ? `<p>🧱 ${esc(S.log[k].obstacles)}</p>` : ''}
        </div>`).join('')}</details>`
    : '';
}

function render() { renderHome(); renderTasks(); renderFocus(); }

/* ---------- Avisos ---------- */
let toastTimer;
function toast(msg, undo) {
  const el = $('#toast');
  el.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button>Deshacer</button>' : ''}`;
  if (undo) el.querySelector('button').onclick = () => { undo(); el.classList.remove('show'); };
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

/* ---------- Modal objetivo ---------- */
let draft = null;
function openGoal() {
  draft = { ...S.goal };
  $('#fEmoji').value = draft.emoji;
  $('#fTitle').value = draft.title;
  $('#fTarget').value = draft.target || '';
  $('#fSaved').value = draft.saved || '';
  renderDraftAvatar();
  $('#goalModal').classList.add('open');
}
function renderDraftAvatar() {
  const el = $('#avatarPreview');
  el.style.backgroundImage = draft.photo ? `url(${draft.photo})` : '';
  el.textContent = draft.photo ? '' : draft.avatar;
  $('#removePhoto').classList.toggle('hidden', !draft.photo);
  $('#avatarPick').innerHTML = AVATARS.map((a) => `<button type="button" data-av="${a}" class="${!draft.photo && draft.avatar === a ? 'on' : ''}">${a}</button>`).join('');
}
$('#avatarPick').addEventListener('click', (e) => {
  const b = e.target.closest('[data-av]');
  if (!b) return;
  draft.avatar = b.dataset.av; draft.photo = null; renderDraftAvatar();
});
$('#removePhoto').addEventListener('click', () => { draft.photo = null; renderDraftAvatar(); });
$('#photoInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => {
    const size = 240, c = document.createElement('canvas');
    c.width = c.height = size;
    const s = Math.min(img.width, img.height);
    c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
    draft.photo = c.toDataURL('image/jpeg', 0.85);
    URL.revokeObjectURL(img.src);
    renderDraftAvatar();
  };
  img.src = URL.createObjectURL(file);
  e.target.value = '';
});
$('#goalForm').addEventListener('submit', (e) => {
  e.preventDefault();
  S.goal = {
    ...draft,
    emoji: $('#fEmoji').value.trim() || '🎯',
    title: $('#fTitle').value.trim() || 'Mi objetivo',
    target: num($('#fTarget').value),
    saved: num($('#fSaved').value),
  };
  save(); render(); closeModals(); toast('✅ Objetivo actualizado');
});

/* ---------- Modal tarea ---------- */
let editing = null;
function openTask(id) {
  editing = S.tasks.find((t) => t.id === id);
  if (!editing) return;
  $('#tTitle').value = editing.title;
  setCat(editing.cat);
  $('#taskModal').classList.add('open');
}
function setCat(c) { $('#tCat').dataset.value = c; document.querySelectorAll('#tCat button').forEach((b) => b.classList.toggle('on', b.dataset.cat === c)); }
$('#tCat').addEventListener('click', (e) => { const b = e.target.closest('[data-cat]'); if (b) setCat(b.dataset.cat); });
$('#taskForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = $('#tTitle').value.trim();
  if (!title || !editing) return;
  editing.title = title;
  editing.cat = $('#tCat').dataset.value;
  save(); render(); closeModals(); toast('✏️ Tarea guardada');
});

function closeModals() { document.querySelectorAll('.modal').forEach((m) => m.classList.remove('open')); }
document.querySelectorAll('.modal').forEach((m) => m.addEventListener('click', (e) => {
  if (e.target === m || e.target.closest('[data-close]')) closeModals();
}));

/* ---------- Formularios de añadir ---------- */
$('#addTask').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = $('#newTask').value.trim();
  if (!title) return;
  S.tasks.unshift({ id: uid(), title, cat: S.tab, done: false });
  $('#newTask').value = '';
  save(); render();
});
$('#addThief').addEventListener('submit', (e) => {
  e.preventDefault();
  const text = $('#newThief').value.trim();
  if (!text) return;
  S.thieves.unshift({ id: uid(), text, action: null });
  $('#newThief').value = '';
  save(); render();
});

/* ---------- Diario (guardado automático) ---------- */
let logTimer;
['#logProgress', '#logObstacles'].forEach((sel) => $(sel).addEventListener('input', () => {
  const k = dayKey();
  S.log[k] = { progress: $('#logProgress').value, obstacles: $('#logObstacles').value };
  clearTimeout(logTimer);
  logTimer = setTimeout(() => {
    save();
    const n = $('#savedNote'); n.classList.add('show'); setTimeout(() => n.classList.remove('show'), 1500);
  }, 400);
}));

/* ---------- Clics generales ---------- */
document.addEventListener('click', (e) => {
  const nav = e.target.closest('[data-go]');
  if (nav) return go(nav.dataset.go);

  const tab = e.target.closest('[data-tab]');
  if (tab) { S.tab = tab.dataset.tab; save(); return renderTasks(); }

  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const act = btn.dataset.act;
  const id = btn.closest('[data-id]')?.dataset.id;

  if (act === 'edit-goal') return openGoal();
  if (act === 'toggle') {
    const t = S.tasks.find((x) => x.id === id);
    t.done = !t.done;
    save(); render();
    if (t.done) toast(t.cat === 'priority' ? '🔥 ¡Una menos! Un paso más cerca' : '✅ Hecho');
    return;
  }
  if (act === 'edit') return openTask(id);
  if (act === 'del') {
    const i = S.tasks.findIndex((x) => x.id === id);
    const [removed] = S.tasks.splice(i, 1);
    save(); render();
    return toast('🗑️ Tarea eliminada', () => { S.tasks.splice(i, 0, removed); save(); render(); });
  }
  if (act === 'thief-action') {
    const x = S.thieves.find((t) => t.id === id);
    x.action = x.action === btn.dataset.v ? null : btn.dataset.v;
    save(); return renderFocus();
  }
  if (act === 'del-thief') {
    const i = S.thieves.findIndex((x) => x.id === id);
    const [removed] = S.thieves.splice(i, 1);
    save(); render();
    return toast('🗑️ Eliminado', () => { S.thieves.splice(i, 0, removed); save(); render(); });
  }
});

/* ---------- Instalar como app ---------- */
let installEvt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; $('#installBtn').classList.remove('hidden'); });
$('#installBtn').addEventListener('click', async () => {
  if (!installEvt) return;
  installEvt.prompt();
  await installEvt.userChoice;
  installEvt = null;
  $('#installBtn').classList.add('hidden');
});
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

save();
render();
