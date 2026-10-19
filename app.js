// Mi Foco — todo se guarda en el propio móvil (localStorage)
const KEY = 'mi-foco-v1';
const $ = (s) => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0, useGrouping: 'always' }).format(n || 0);
const num = (v) => { const n = parseFloat(String(v).replace(/\./g, '').replace(',', '.')); return isFinite(n) && n > 0 ? n : 0; };
const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const nowTime = () => new Date().toTimeString().slice(0, 5);
const niceDate = (k) => new Date(k + 'T12:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

const MOODS = { 1: '😫 Día duro', 2: '😐 Día regular', 3: '🙂 Buen día', 4: '🤩 ¡Día genial!' };
const AVATARS = ['😎', '🙂', '🦸', '🧑‍💻', '🚀', '🦁', '🐬', '🌞'];
const THIEF_ACTIONS = [
  { v: 'stop', label: '🛑 Dejar' },
  { v: 'later', label: '⏳ Posponer' },
  { v: 'improve', label: '🔧 Mejorar' },
];

function sampleData() {
  const y = new Date(); y.setDate(y.getDate() - 1);
  const y2 = new Date(); y2.setDate(y2.getDate() - 2);
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
    events: [
      { id: uid(), day: dayKey(y2), time: '10:15', type: 'task', cat: 'priority', title: 'Abrir una cuenta de ahorro aparte' },
      { id: uid(), day: dayKey(y2), time: '19:40', type: 'money', amount: 150 },
      { id: uid(), day: dayKey(y), time: '11:30', type: 'task', cat: 'priority', title: 'Terminar mi CV' },
      { id: uid(), day: dayKey(y), time: '17:05', type: 'task', cat: 'secondary', title: 'Limpiar la bandeja de entrada' },
    ],
    tab: 'priority',
  };
}

let S = load();
function load() {
  try { const d = JSON.parse(localStorage.getItem(KEY)); if (d && d.goal) { d.events = d.events || []; return d; } } catch (e) {}
  return sampleData();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('⚠️ No se ha podido guardar. Prueba con una foto más pequeña.'); }
}

function loadImage(file, maxW, square, cb) {
  const img = new Image();
  img.onload = () => {
    const c = document.createElement('canvas');
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (square) { const s = Math.min(sw, sh); sx = (sw - s) / 2; sy = (sh - s) / 2; sw = sh = s; }
    const scale = Math.min(1, maxW / sw);
    c.width = Math.round(sw * scale); c.height = Math.round(sh * scale);
    c.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    URL.revokeObjectURL(img.src);
    cb(c.toDataURL('image/jpeg', square ? 0.85 : 0.72));
  };
  img.src = URL.createObjectURL(file);
}

/* Días seguidos completando al menos una tarea prioritaria */
function streak() {
  const days = new Set(S.events.filter((e) => e.type === 'task' && e.cat === 'priority').map((e) => e.day));
  const d = new Date();
  if (!days.has(dayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* Confeti al pasar un hito */
function celebrate(m) {
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#ffa940', '#ff4d7d', '#12b8a6', '#7d8bd8', '#ffd23f'];
  for (let i = 0; i < 90; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 0.7 + 's';
    p.style.animationDuration = 1.8 + Math.random() * 1.5 + 's';
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 4200);
  toast(m >= 100 ? '🏆 ¡OBJETIVO CONSEGUIDO! ¡Enhorabuena!' : `🎉 ¡Has llegado al ${m} % de tu objetivo!`);
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
  setAvatar($('#heroAvatar'));
  $('#hero').style.backgroundImage = g.cover
    ? `linear-gradient(160deg, rgba(255,150,60,.55), rgba(255,60,120,.8)), url(${g.cover})`
    : '';
  $('#hero').classList.toggle('has-cover', !!g.cover);

  const st = streak();
  $('#streak').classList.toggle('hidden', !st);
  $('#streak').textContent = `🔥 ${st} ${st === 1 ? 'día' : 'días'}`;

  renderPace();

  // Solo la siguiente tarea prioritaria, en el orden de la lista
  const pending = S.tasks.filter((t) => t.cat === 'priority' && !t.done);
  const next = pending[0];
  const box = $('#nextTask');
  box.dataset.id = next ? next.id : '';
  box.innerHTML = next
    ? `<p class="next-label">🔥 Tu siguiente paso</p>
       <div class="next-row">
         <button class="check" data-act="toggle" aria-label="Completar">✓</button>
         <span class="next-title">${esc(next.title)}</span>
       </div>
       <button class="next-more" data-go="tasks">${pending.length > 1 ? `Después: ${pending.length - 1} más` : 'Es la última prioritaria'} ›</button>`
    : `<div class="empty"><span>🎉</span>¡Prioridades al día!</div>
       <button class="next-more" data-go="tasks">Añadir otra tarea ›</button>`;
  if (box.dataset.shown !== box.dataset.id) {
    box.dataset.shown = box.dataset.id;
    box.classList.remove('pop'); void box.offsetWidth; box.classList.add('pop');
  }
}

function renderPace() {
  const g = S.goal, box = $('#pace');
  const left = g.target - g.saved;
  if (!g.deadline) {
    box.innerHTML = `<button class="pace-empty" data-act="edit-goal">📅 Ponle fecha a tu objetivo y te digo cuánto ahorrar al mes ›</button>`;
    return;
  }
  const end = new Date(g.deadline + 'T23:59');
  const days = Math.ceil((end - new Date()) / 864e5);
  const when = end.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  if (left <= 0) { box.innerHTML = `<p class="pace-msg">🏆 ¡Objetivo conseguido antes del ${when}!</p>`; return; }
  if (days <= 0) { box.innerHTML = `<button class="pace-empty" data-act="edit-goal">⏰ La fecha (${when}) ya pasó. Ponle una nueva ›</button>`; return; }
  const months = days / 30.44, weeks = days / 7;
  const time = days > 60 ? `≈ ${Math.round(months)} meses` : `${days} ${days === 1 ? 'día' : 'días'}`;
  box.innerHTML = `<div class="pace-top"><b>📅 Quedan ${time}</b><small>hasta el ${when}</small></div>
    <div class="pace-nums">
      <div><b>${eur(Math.ceil(left / Math.max(months, 1)))}</b><small>al mes</small></div>
      <div><b>${eur(Math.ceil(left / Math.max(weeks, 1)))}</b><small>a la semana</small></div>
      <div><b>${eur(Math.ceil(left / days))}</b><small>al día</small></div>
    </div>`;
}

function taskHTML(t, grip) {
  return `<li class="task ${t.cat} ${t.done ? 'done' : ''}" data-id="${t.id}">
    <button class="check" data-act="toggle" aria-label="Completar">✓</button>
    <span class="t-title">${esc(t.title)}</span>
    <button class="icon" data-act="edit" aria-label="Editar">✏️</button>
    <button class="icon" data-act="del" aria-label="Eliminar">🗑️</button>
    ${grip && !t.done ? '<span class="grip" aria-label="Arrastrar para reordenar">⠿</span>' : ''}
  </li>`;
}

let doneOpen = false;
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

  const list = S.tasks.filter((t) => t.cat === tab);
  const pendList = list.filter((t) => !t.done), doneList = list.filter((t) => t.done);
  $('#taskList').innerHTML = pendList.length
    ? pendList.map((t) => taskHTML(t, true)).join('')
    : doneList.length
      ? '<li class="empty"><span>🎉</span>¡Todo hecho! Añade la siguiente arriba.</li>'
      : `<li class="empty"><span>${tab === 'priority' ? '🔥' : '🧩'}</span>No hay tareas aquí. ¡Añade una arriba!</li>`;
  $('#doneWrap').innerHTML = doneList.length
    ? `<details class="done-box" ${doneOpen ? 'open' : ''}><summary>✅ Completadas (${doneList.length})</summary>
        <ul class="tasks">${doneList.map((t) => taskHTML(t)).join('')}</ul></details>`
    : '';
}

function renderFocus() {
  const top = S.tasks.filter((t) => t.cat === 'priority' && !t.done).slice(0, 3);
  const anyPri = S.tasks.some((t) => t.cat === 'priority');
  $('#top3').innerHTML = top.length
    ? top.map((t) => taskHTML(t)).join('')
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
  document.querySelectorAll('#moods button').forEach((b) => b.classList.toggle('on', String(entry.mood) === b.dataset.mood));
  if (document.activeElement !== $('#logProgress')) $('#logProgress').value = entry.progress || '';
  if (document.activeElement !== $('#logObstacles')) $('#logObstacles').value = entry.obstacles || '';
}

/* ---------- Historial ---------- */
const WEEKDAY = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
function dayLabel(k) {
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (k === dayKey()) return 'Hoy';
  if (k === dayKey(y)) return 'Ayer';
  const s = niceDate(k);
  return s.charAt(0).toUpperCase() + s.slice(1);
}
const hasLog = (k) => S.log[k] && (S.log[k].progress || S.log[k].obstacles || S.log[k].mood);

function renderHistory() {
  // Resumen de los últimos 7 días
  const week = [];
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); week.push(dayKey(d)); }
  const wk = S.events.filter((e) => e.day >= week[0]);
  const money = wk.filter((e) => e.type === 'money').reduce((a, e) => a + e.amount, 0);
  $('#hTasks').textContent = wk.filter((e) => e.type === 'task').length;
  $('#hMoney').textContent = (money > 0 ? '+' : '') + eur(money);
  $('#hDays').textContent = week.filter((k) => S.events.some((e) => e.day === k) || hasLog(k)).length + '/7';
  $('#weekStrip').innerHTML = week.map((k) => {
    const n = S.events.filter((e) => e.day === k && e.type === 'task').length;
    const lvl = n === 0 ? 0 : n < 2 ? 1 : n < 4 ? 2 : 3;
    return `<div class="wday ${k === dayKey() ? 'today' : ''}"><i class="lvl${lvl}">${n || ''}</i><small>${WEEKDAY[new Date(k + 'T12:00').getDay()]}</small></div>`;
  }).join('');

  // Lista por días, del más reciente al más antiguo
  const days = {};
  const add = (k, item) => (days[k] = days[k] || []).push(item);
  S.events.forEach((e) => add(e.day, e));
  Object.keys(S.log).forEach((k) => { if (hasLog(k)) add(k, { type: 'log', time: '~', ...S.log[k] }); });
  const keys = Object.keys(days).sort().reverse();

  $('#historyList').innerHTML = keys.length ? keys.map((k) => {
    const items = days[k].sort((a, b) => (a.time > b.time ? 1 : -1));
    const n = items.filter((e) => e.type === 'task').length;
    return `<div class="card hday">
      <div class="hday-top"><b>${esc(dayLabel(k))}</b>${n ? `<span class="badge">✅ ${n} ${n === 1 ? 'tarea' : 'tareas'}</span>` : ''}</div>
      <ul>${items.map((e) => {
        if (e.type === 'task') return `<li class="h-item ${e.cat}"><span>${e.cat === 'priority' ? '🔥' : '🧩'}</span><p>${esc(e.title)}</p><time>${e.time}</time></li>`;
        if (e.type === 'money') return `<li class="h-item money"><span>💰</span><p>${e.amount > 0 ? `+${eur(e.amount)} ahorrados` : `${eur(e.amount)} (ajuste)`}</p><time>${e.time}</time></li>`;
        return `<li class="h-item log"><span>${e.mood ? MOODS[e.mood].split(' ')[0] : '📝'}</span><p>${e.mood ? `<b>${MOODS[e.mood].split(' ').slice(1).join(' ')}</b>${e.progress || e.obstacles ? '<br>' : ''}` : ''}${e.progress ? `✅ ${esc(e.progress)}` : ''}${e.progress && e.obstacles ? '<br>' : ''}${e.obstacles ? `🧱 ${esc(e.obstacles)}` : ''}</p></li>`;
      }).join('')}</ul>
    </div>`;
  }).join('') : '<div class="card empty"><span>📅</span>Aquí verás lo que haces cada día. ¡Completa tu primera tarea!</div>';
}

function render() { renderHome(); renderTasks(); renderFocus(); renderHistory(); }

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
  $('#fDeadline').value = draft.deadline || '';
  renderCoverBtn();
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
function renderCoverBtn() {
  $('#coverBtn').firstChild.textContent = draft.cover ? '✅ Foto de meta puesta · Cambiar' : '🏝️ Foto de tu meta';
  $('#removeCover').classList.toggle('hidden', !draft.cover);
}
$('#coverInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) loadImage(file, 900, false, (url) => { draft.cover = url; renderCoverBtn(); });
  e.target.value = '';
});
$('#removeCover').addEventListener('click', () => { draft.cover = null; renderCoverBtn(); });
$('#removePhoto').addEventListener('click', () => { draft.photo = null; renderDraftAvatar(); });
$('#photoInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  loadImage(file, 240, true, (url) => { draft.photo = url; renderDraftAvatar(); });
  e.target.value = '';
});
$('#goalForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const oldSaved = S.goal.saved;
  const pctOf = (g) => (g.target > 0 ? (g.saved / g.target) * 100 : 0);
  const oldPct = pctOf(S.goal);
  S.goal = {
    ...draft,
    emoji: $('#fEmoji').value.trim() || '🎯',
    title: $('#fTitle').value.trim() || 'Mi objetivo',
    target: num($('#fTarget').value),
    saved: num($('#fSaved').value),
    deadline: $('#fDeadline').value || null,
  };
  const delta = S.goal.saved - oldSaved;
  if (delta) S.events.push({ id: uid(), day: dayKey(), time: nowTime(), type: 'money', amount: delta });
  save(); render(); closeModals();
  const hit = [25, 50, 75, 100].filter((m) => oldPct < m && pctOf(S.goal) >= m).pop();
  if (hit) celebrate(hit); else toast('✅ Objetivo actualizado');
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
  S.tasks.push({ id: uid(), title, cat: S.tab, done: false });
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
  S.log[k] = { ...S.log[k], progress: $('#logProgress').value, obstacles: $('#logObstacles').value };
  clearTimeout(logTimer);
  logTimer = setTimeout(() => {
    save();
    const n = $('#savedNote'); n.classList.add('show'); setTimeout(() => n.classList.remove('show'), 1500);
  }, 400);
}));

$('#moods').addEventListener('click', (e) => {
  const b = e.target.closest('[data-mood]');
  if (!b) return;
  const k = dayKey(), m = Number(b.dataset.mood);
  S.log[k] = { ...S.log[k], mood: S.log[k] && S.log[k].mood === m ? null : m };
  save(); renderFocus(); renderHistory();
});
$('#doneWrap').addEventListener('toggle', (e) => { doneOpen = e.target.open; }, true);

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
    if (t.done) S.events.push({ id: uid(), day: dayKey(), time: nowTime(), type: 'task', cat: t.cat, title: t.title, taskId: t.id });
    else {
      const i = S.events.map((e) => e.taskId).lastIndexOf(t.id);
      if (i > -1) S.events.splice(i, 1);
    }
    save(); render();
    if (t.done) {
      const st = streak();
      toast(t.cat === 'priority' ? `🔥 ¡Una menos! Racha: ${st} ${st === 1 ? 'día' : 'días'}` : '✅ Hecho');
    }
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

/* ---------- Reordenar arrastrando el asa ⠿ ---------- */
$('#taskList').addEventListener('pointerdown', (e) => {
  const grip = e.target.closest('.grip');
  if (!grip) return;
  e.preventDefault();
  const list = $('#taskList');
  const li = grip.closest('.task');
  let startY = e.clientY;
  li.classList.add('dragging');

  const move = (ev) => {
    const y = ev.clientY;
    const mid = (el) => { const r = el.getBoundingClientRect(); return r.top + r.height / 2; };
    const before = li.offsetTop;
    for (;;) {
      const prev = li.previousElementSibling;
      const next = li.nextElementSibling;
      if (next && !next.classList.contains('done') && y > mid(next)) list.insertBefore(next, li);
      else if (prev && y < mid(prev)) list.insertBefore(prev, li.nextElementSibling);
      else break;
    }
    startY += li.offsetTop - before;
    li.style.transform = `translateY(${y - startY}px)`;
  };
  const end = () => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', end);
    window.removeEventListener('pointercancel', end);
    li.classList.remove('dragging');
    li.style.transform = '';
    const order = [...list.querySelectorAll('.task')].map((x) => x.dataset.id);
    const moved = order.map((id) => S.tasks.find((t) => t.id === id));
    S.tasks = [...moved, ...S.tasks.filter((t) => !order.includes(t.id))];
    save(); render();
  };
  window.addEventListener('pointermove', move);
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
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
