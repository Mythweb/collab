/* ── Collab app logic ─────────────────────────── */

const COLORS = {
  alex: { ring: '#A78BFA', bg: '#2D1B69' },
  sam:  { ring: '#34D399', bg: '#064E3B' }
};

const ICONS = { doc: 'ti-file-text', video: 'ti-player-play' };
const BG = {
  alex: { doc: '#1E3A5F', video: '#3B1A5A' },
  sam:  { doc: '#1B4332', video: '#4A1942' }
};

/* ── Persistence ──────────────────────────────── */
const STORAGE_KEY = 'collab-ideas-v1';

function saveIdeas() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(ideas)); } catch {}
}

function loadIdeas() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const DEFAULT_IDEAS = [
  {
    id: 1,
    title: 'Brand refresh',
    type: 'doc',
    poster: 'alex',
    viewers: ['sam'],
    content: 'Proposal to update our visual identity.\n\nNew logo direction: bold wordmark with geometric accent. Color palette shift to warmer tones — amber + deep navy.\n\nApplying across all touchpoints by Q3.'
  },
  {
    id: 2,
    title: 'Intro reel',
    type: 'video',
    poster: 'sam',
    viewers: [],
    content: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 3,
    title: 'Feature list',
    type: 'doc',
    poster: 'alex',
    viewers: [],
    content: 'Priority features for v2:\n\n• Offline mode\n• Push notifications\n• Dark mode polish\n• Export to PDF\n• Team mentions'
  },
  {
    id: 4,
    title: 'Demo walkthrough',
    type: 'video',
    poster: 'alex',
    viewers: ['sam'],
    content: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  {
    id: 5,
    title: 'Copy deck',
    type: 'doc',
    poster: 'sam',
    viewers: ['alex'],
    content: 'Homepage headline options:\n"Build together, faster."\n"Ideas worth sharing."\n"Where great ideas live."\n\nCTA variants:\n"Get started free"\n"See how it works"\n"Join the team"'
  }
];

let ideas = loadIdeas() || DEFAULT_IDEAS;

/* ── YouTube thumbnail helper ─────────────────── */
function ytThumb(url) {
  const m = url.match(/youtube\.com\/embed\/([^?&]+)/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
}

/* ── Render grid ──────────────────────────────── */
function renderGrid() {
  const grid = document.getElementById('icon-grid');
  grid.innerHTML = '';

  ideas.forEach(idea => {
    const posterColor = COLORS[idea.poster].ring;
    const hasViewer   = idea.viewers.length > 0;
    const viewerColor = hasViewer ? COLORS[idea.viewers[0]].ring : null;
    const bg          = BG[idea.poster][idea.type];
    const thumb       = idea.type === 'video' ? ytThumb(idea.content) : null;

    const wrap = document.createElement('div');
    wrap.className = 'icon-wrap';
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('aria-label', idea.title);
    wrap.setAttribute('tabindex', '0');
    wrap.onclick = () => openIdea(idea.id);
    wrap.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') openIdea(idea.id); };

    const ring2Style = hasViewer
      ? `border-color: ${viewerColor};`
      : 'border-color: rgba(255,255,255,0.15); border-style: dashed;';

    const btnStyle   = `background:${bg};`;
    const btnContent = thumb
      ? `<img src="${escAttr(thumb)}" alt="" />`
      : `<i class="ti ${ICONS[idea.type]}"></i>`;

    wrap.innerHTML = `
      <div class="icon-outer">
        <div class="ring ring-1" style="border-color:${posterColor};"></div>
        <div class="ring ring-2" style="${ring2Style}"></div>
        <button class="icon-btn" style="${btnStyle}" tabindex="-1" aria-hidden="true">
          ${btnContent}
        </button>
      </div>
      <span class="icon-label">${escHtml(idea.title)}</span>
    `;
    grid.appendChild(wrap);
  });
}

/* ── Open idea sheet ──────────────────────────── */
function openIdea(id) {
  const idea = ideas.find(i => i.id === id);
  if (!idea) return;

  const currentUser = 'sam';
  if (!idea.viewers.includes(currentUser) && idea.poster !== currentUser) {
    idea.viewers.push(currentUser);
    saveIdeas();
    renderGrid();
  }

  const posterName  = cap(idea.poster);
  const posterColor = COLORS[idea.poster].ring;
  const viewedBy    = idea.viewers.map(v => ({ name: cap(v), color: COLORS[v].ring }));

  let viewerHtml = '';
  if (viewedBy.length) {
    viewerHtml = `
      <span class="meta-sep">·</span>
      ${viewedBy.map(v => `<span class="meta-dot" style="background:${v.color}"></span>`).join('')}
      <span class="meta-label">Seen by ${viewedBy.map(v => v.name).join(', ')}</span>
    `;
  } else {
    viewerHtml = `<span class="meta-sep">·</span><span class="meta-label">Not yet seen</span>`;
  }

  let contentHtml = '';
  if (idea.type === 'video') {
    const isEmbed = idea.content.includes('youtube.com/embed') || idea.content.includes('vimeo.com/video');
    if (isEmbed) {
      contentHtml = `
        <div class="video-player">
          <iframe src="${escAttr(idea.content)}" allowfullscreen allow="autoplay; encrypted-media"></iframe>
        </div>`;
    } else {
      contentHtml = `
        <div class="video-player">
          <div class="play-btn"><i class="ti ti-player-play"></i></div>
          <span class="video-url">${escHtml(idea.content)}</span>
        </div>`;
    }
  } else {
    contentHtml = `<div class="doc-preview">${escHtml(idea.content)}</div>`;
  }

  const sheet = document.getElementById('idea-sheet');
  sheet.innerHTML = `
    <div class="sheet-handle"></div>
    <h3 class="sheet-title">${escHtml(idea.title)}</h3>
    <div class="idea-meta">
      <span class="meta-dot" style="background:${posterColor}"></span>
      <span class="meta-label">Posted by ${posterName}</span>
      ${viewerHtml}
    </div>
    ${contentHtml}
    <button class="btn-ghost" onclick="closeOverlay('idea-overlay')">Close</button>
  `;

  document.getElementById('idea-overlay').classList.add('open');
}

/* ── Add idea ─────────────────────────────────── */
function openAdd() {
  document.getElementById('add-overlay').classList.add('open');
}

function closeAdd() {
  closeOverlay('add-overlay');
}

function addIdea() {
  const title   = document.getElementById('new-title').value.trim();
  const type    = document.getElementById('new-type').value;
  const content = document.getElementById('new-content').value.trim();
  const poster  = document.getElementById('new-poster').value;

  if (!title) {
    document.getElementById('new-title').focus();
    return;
  }

  ideas.unshift({
    id: Date.now(),
    title,
    type,
    poster,
    viewers: [],
    content: content || '(no content added)'
  });

  saveIdeas();
  renderGrid();
  closeAdd();
  document.getElementById('new-title').value    = '';
  document.getElementById('new-content').value  = '';
}

/* ── Overlay helpers ──────────────────────────── */
function closeOverlay(id) {
  document.getElementById(id).classList.remove('open');
}

function handleOverlayClick(e, id) {
  if (e.target === e.currentTarget) closeOverlay(id);
}

/* ── Status bar clock & date ──────────────────── */
function updateClock() {
  const now = new Date();
  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h % 12) || 12);
  document.getElementById('js-time').textContent = `${h12}:${m}`;

  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('js-date').textContent =
    `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}

/* ── Escape helpers ───────────────────────────── */
function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;')
    .replace(/\n/g, '<br>');
}
function escAttr(str) {
  return String(str).replace(/"/g,'&quot;');
}
function cap(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ── Init ─────────────────────────────────────── */
updateClock();
setInterval(updateClock, 10000);
renderGrid();
