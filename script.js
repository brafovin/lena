// === Meine Charakter – Hauptlogik ===

const state = {
  name: '',
  universe: '',
  age: '',
  skin: '#f5d0a9',
  hair: '#3b2416',
  hairStyle: 'short',
  eye: '#4a2c17',
  mouth: 'smile',
  outfit: '#3b82f6',
  bg: 'linear-gradient(135deg,#f472b6,#a78bfa)',
  acc: {
    glasses: false, hat: false, cape: false, scar: false, mask: false,
    crown: false, headphones: false, earrings: false, scarf: false, bow: false,
    headband: false, sunglasses: false, wings: false, halo: false, horns: false,
    ears: false, beard: false, fangs: false, flower: false, blush: false,
    necklace: false, star: false, eyepatch: false, whiskers: false, freckles: false,
  },
  power: '',
  traits: [],
  story: '',
  editingId: null,
};

const ACC_KEYS = [
  'glasses', 'hat', 'cape', 'scar', 'mask',
  'crown', 'headphones', 'earrings', 'scarf', 'bow',
  'headband', 'sunglasses', 'wings', 'halo', 'horns',
  'ears', 'beard', 'fangs', 'flower', 'blush',
  'necklace', 'star', 'eyepatch', 'whiskers', 'freckles',
];

const STORAGE_KEY = 'meine-charakter-v1';

// ---------- Tabs ----------
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
    if (tab.dataset.tab === 'gallery') renderGallery();
    if (tab.dataset.tab === 'inspiration') renderInspiration();
  });
});

// ---------- Swatch-Helfer ----------
function setupSwatches(containerId, stateKey, applyFn) {
  const container = document.getElementById(containerId);
  container.querySelectorAll('.swatch').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      container.querySelectorAll('.swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const val = btn.dataset.color || btn.dataset.bg;
      state[stateKey] = val;
      applyFn(val);
    });
  });
  // Ersten als aktiv markieren
  const first = container.querySelector('.swatch');
  if (first) first.classList.add('active');
}

function setupButtonGroup(containerId, stateKey, applyFn, multi = false) {
  const container = document.getElementById(containerId);
  container.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (multi) {
        btn.classList.toggle('active');
        state[stateKey] = Array.from(container.querySelectorAll('button.active')).map(b => b.dataset.trait);
      } else {
        container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state[stateKey] = btn.dataset.style || btn.dataset.mouth;
      }
      applyFn();
    });
  });
}

// ---------- Avatar aktualisieren ----------
const HAIR_STYLES = {
  short:       'M58 95 Q55 48 100 44 Q145 48 142 95 Q140 72 115 62 Q105 70 100 64 Q95 70 85 62 Q60 72 58 95 Z',
  long:        'M52 100 Q50 38 100 34 Q150 38 148 100 L155 210 Q148 215 142 175 Q138 110 100 72 Q62 110 58 175 Q52 215 45 210 Z',
  curly:       'M55 95 Q44 78 58 65 Q58 45 82 55 Q88 35 100 48 Q112 35 118 55 Q142 45 142 65 Q156 78 145 95 Q150 75 118 68 Q112 58 100 65 Q88 58 82 68 Q50 75 55 95 Z',
  bald:        '',
  mohawk:      'M88 28 Q100 16 112 28 L118 90 L82 90 Z',
  bangs:       'M58 95 Q55 48 100 44 Q145 48 142 95 L138 82 L130 90 L120 82 L110 90 L100 82 L90 90 L80 82 L70 90 L62 82 Z',
  'side-part': 'M58 95 Q52 48 100 42 Q150 48 144 95 Q135 58 108 58 Q95 70 75 65 Q60 75 58 95 Z',
  ponytail:    'M58 95 Q55 48 100 44 Q145 48 142 95 Q140 72 100 64 Q60 72 58 95 Z M138 66 Q170 102 162 172 Q152 175 152 146 Q148 96 138 66 Z',
  bun:         'M58 95 Q55 55 100 50 Q145 55 142 95 Q140 75 100 68 Q60 75 58 95 Z M82 50 Q82 22 100 20 Q118 22 118 50 Q118 56 100 56 Q82 56 82 50 Z',
  'space-buns':'M58 95 Q55 55 100 50 Q145 55 142 95 Q140 75 100 68 Q60 75 58 95 Z M62 38 A 12 12 0 1 1 86 38 A 12 12 0 1 1 62 38 Z M114 38 A 12 12 0 1 1 138 38 A 12 12 0 1 1 114 38 Z',
  braids:      'M58 95 Q55 48 100 44 Q145 48 142 95 Q140 72 100 64 Q60 72 58 95 Z M48 88 Q45 130 50 190 L62 190 Q65 130 62 88 Z M138 88 Q135 130 138 190 L150 190 Q155 130 152 88 Z',
  bob:         'M55 95 Q52 50 100 45 Q148 50 145 95 L148 145 L134 148 Q134 105 100 82 Q66 105 66 148 L52 145 Z',
  afro:        'M32 108 Q28 48 100 36 Q172 48 168 108 Q162 80 100 68 Q38 80 32 108 Z',
  dreads:      'M55 90 Q52 48 100 44 Q148 48 145 90 Q140 70 100 62 Q60 70 55 90 Z M50 88 L45 185 L58 185 L62 88 Z M68 88 L66 185 L80 185 L80 88 Z M86 88 L86 185 L100 185 L98 88 Z M102 88 L102 185 L116 185 L114 88 Z M120 88 L120 185 L134 185 L132 88 Z M138 88 L142 185 L155 185 L150 88 Z',
  undercut:    'M72 85 Q70 35 100 32 Q130 35 128 85 Q125 60 100 55 Q75 60 72 85 Z',
  mullet:      'M55 95 Q52 48 100 44 Q148 48 145 95 Q140 72 100 64 Q60 72 55 95 Z M148 92 Q166 138 152 185 Q142 185 142 138 Q142 116 148 92 Z M52 92 Q34 138 48 185 Q58 185 58 138 Q58 116 52 92 Z',
  'long-curly':'M52 100 Q50 38 100 34 Q150 38 148 100 L155 210 Q148 215 142 175 Q138 110 100 72 Q62 110 58 175 Q52 215 45 210 Z M40 200 A 7 7 0 1 1 54 200 A 7 7 0 1 1 40 200 Z M146 200 A 7 7 0 1 1 160 200 A 7 7 0 1 1 146 200 Z',
  medium:      'M55 95 Q52 48 100 44 Q148 48 145 95 L150 150 L132 152 Q132 100 100 78 Q68 100 68 152 L50 150 Z',
  messy:       'M55 95 Q44 60 60 55 Q68 32 80 52 Q90 30 100 50 Q110 30 120 52 Q132 32 140 55 Q156 60 145 95 Q138 66 118 68 Q108 54 100 64 Q92 54 82 68 Q62 66 55 95 Z',
  spikes:      'M58 92 Q58 58 100 50 Q142 58 142 92 L130 94 L128 42 L120 94 L116 38 L108 94 L104 42 L96 94 L92 38 L84 94 L80 42 L72 94 L70 58 Z',
  buzz:        'M62 90 Q62 68 100 65 Q138 68 138 90 Q100 78 62 90 Z',
  pompadour:   'M58 95 Q58 55 100 50 Q142 55 142 95 Q142 68 130 58 Q116 22 96 32 Q96 72 88 65 Q66 72 58 95 Z',
  waves:       'M55 95 Q52 48 100 44 Q148 48 145 95 Q138 80 128 78 Q124 68 116 72 Q110 60 100 68 Q90 60 84 72 Q76 68 72 78 Q62 80 55 95 Z',
  ringlets:    'M55 95 Q52 48 100 44 Q148 48 145 95 Q140 78 115 72 Q108 68 100 72 Q92 68 85 72 Q60 78 55 95 Z M42 108 A 9 9 0 1 1 60 108 A 9 9 0 1 1 42 108 Z M38 128 A 9 9 0 1 1 56 128 A 9 9 0 1 1 38 128 Z M140 108 A 9 9 0 1 1 158 108 A 9 9 0 1 1 140 108 Z M144 128 A 9 9 0 1 1 162 128 A 9 9 0 1 1 144 128 Z',
  pixie:       'M60 92 Q62 55 100 52 Q138 55 140 92 Q132 75 110 68 Q104 76 100 70 Q96 76 90 68 Q68 75 60 92 Z',
  sidecut:     'M96 45 Q148 48 145 95 L150 162 L130 160 Q128 115 120 95 Q108 68 96 58 L96 45 Z',
  emo:         'M55 95 Q52 48 100 44 Q148 48 145 95 L140 110 L128 98 L115 114 L105 100 L92 116 L80 100 L68 112 L58 98 Z',
  'braid-crown':'M55 95 Q52 50 100 45 Q148 50 145 95 Q145 78 138 70 L128 62 L118 72 L108 62 L100 72 L92 62 L82 72 L72 62 L62 70 Q55 78 55 95 Z',
  updo:        'M62 92 Q62 68 100 65 Q138 68 138 92 Q138 80 100 78 Q62 80 62 92 Z M78 58 Q100 22 122 58 Q134 70 100 70 Q66 70 78 58 Z',
  'wild-mane': 'M40 98 Q34 48 100 38 Q166 48 160 98 Q162 72 130 64 Q118 54 100 62 Q82 54 70 64 Q38 72 40 98 Z M32 92 L26 205 L52 205 L58 95 Z M142 95 L148 205 L174 205 L168 92 Z',
};

const MOUTH_SHAPES = {
  smile: {
    upper: 'M84 133 Q92 128 100 132 Q108 128 116 133 Q108 136 100 136 Q92 136 84 133 Z',
    lower: 'M84 133 Q92 148 100 148 Q108 148 116 133 Q108 142 100 143 Q92 142 84 133 Z',
    line:  'M88 138 Q100 144 112 138',
  },
  neutral: {
    upper: 'M84 135 Q92 131 100 134 Q108 131 116 135 Q108 137 100 137 Q92 137 84 135 Z',
    lower: 'M84 135 Q92 141 100 141 Q108 141 116 135 Q108 139 100 139 Q92 139 84 135 Z',
    line:  'M88 137 L112 137',
  },
  smirk: {
    upper: 'M84 136 Q92 132 100 134 Q108 128 118 131 Q110 135 100 136 Q92 137 84 136 Z',
    lower: 'M84 136 Q92 144 100 143 Q112 142 118 131 Q110 139 100 140 Q92 140 84 136 Z',
    line:  'M88 138 Q100 140 116 131',
  },
  sad: {
    upper: 'M84 136 Q92 138 100 136 Q108 138 116 136 Q108 134 100 134 Q92 134 84 136 Z',
    lower: 'M84 136 Q92 130 100 131 Q108 130 116 136 Q108 140 100 141 Q92 140 84 136 Z',
    line:  'M86 134 Q100 128 114 134',
  },
};

function updateAvatar() {
  document.getElementById('head').setAttribute('fill', state.skin);
  document.getElementById('neck').setAttribute('fill', state.skin);
  document.querySelectorAll('.ear').forEach(e => e.setAttribute('fill', state.skin));
  document.getElementById('outfit').setAttribute('fill', state.outfit);
  // Iris
  document.querySelectorAll('.eye').forEach(e => e.setAttribute('fill', state.eye));

  // Haare
  const hair = document.getElementById('hair');
  hair.setAttribute('fill', state.hair);
  hair.setAttribute('d', HAIR_STYLES[state.hairStyle] || HAIR_STYLES.short);
  hair.style.display = state.hairStyle === 'bald' ? 'none' : '';
  // Augenbrauen synchron zur Haarfarbe
  document.querySelectorAll('.brow').forEach(b => b.setAttribute('stroke', state.hair));

  // Mund & Lippen
  const m = MOUTH_SHAPES[state.mouth] || MOUTH_SHAPES.smile;
  document.getElementById('mouth').setAttribute('d', m.line);
  document.getElementById('upper-lip').setAttribute('d', m.upper);
  document.getElementById('lower-lip').setAttribute('d', m.lower);

  // Accessoires
  ACC_KEYS.forEach(k => {
    const el = document.getElementById(k);
    if (el) el.style.display = state.acc[k] ? '' : 'none';
  });

  // Hintergrund
  document.getElementById('preview-bg').style.background = state.bg;

  // Name & Universum
  document.getElementById('preview-name').textContent = state.name.trim() || 'Namenlose Heldin';
  document.getElementById('preview-universe').textContent = '✨ ' + (state.universe || 'Unbekanntes Universum');

  // Traits
  const traitsEl = document.getElementById('preview-traits');
  traitsEl.innerHTML = state.traits.map(t => `<span class="chip">${t}</span>`).join('');
}

// ---------- Text-Felder ----------
['name', 'universe', 'age', 'power', 'story'].forEach(id => {
  document.getElementById(id).addEventListener('input', (e) => {
    state[id] = e.target.value;
    updateAvatar();
  });
});

// ---------- Accessoires ----------
ACC_KEYS.forEach(k => {
  const el = document.getElementById('acc-' + k);
  if (!el) return;
  el.addEventListener('change', (e) => {
    state.acc[k] = e.target.checked;
    updateAvatar();
  });
});

// ---------- Swatches & Gruppen initialisieren ----------
setupSwatches('skin-swatches', 'skin', updateAvatar);
setupSwatches('hair-swatches', 'hair', updateAvatar);
setupSwatches('eye-swatches', 'eye', updateAvatar);
setupSwatches('outfit-swatches', 'outfit', updateAvatar);
setupSwatches('bg-swatches', 'bg', updateAvatar);
setupButtonGroup('hair-style', 'hairStyle', updateAvatar);
setupButtonGroup('mouth-style', 'mouth', updateAvatar);
setupButtonGroup('traits', 'traits', updateAvatar, true);

// ---------- Speichern / Laden ----------
function loadAll() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}
function saveAll(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  document.getElementById('gallery-count').textContent = list.length;
}

function getCharacterFromState() {
  return {
    id: state.editingId || ('c_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)),
    name: state.name.trim() || 'Namenlose Heldin',
    universe: state.universe || '',
    age: state.age || '',
    skin: state.skin,
    hair: state.hair,
    hairStyle: state.hairStyle,
    eye: state.eye,
    mouth: state.mouth,
    outfit: state.outfit,
    bg: state.bg,
    acc: { ...state.acc },
    power: state.power,
    traits: [...state.traits],
    story: state.story,
    createdAt: Date.now(),
  };
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

document.getElementById('save-btn').addEventListener('click', () => {
  const list = loadAll();
  const char = getCharacterFromState();
  const idx = list.findIndex(c => c.id === char.id);
  if (idx >= 0) {
    list[idx] = char;
    showToast('✨ Charakter aktualisiert!');
  } else {
    list.unshift(char);
    showToast('💖 Charakter gespeichert!');
  }
  saveAll(list);
  state.editingId = char.id;
});

document.getElementById('reset-btn').addEventListener('click', () => {
  if (!confirm('Möchtest du den Charakter wirklich zurücksetzen?')) return;
  resetForm();
  showToast('🔄 Zurückgesetzt');
});

function resetForm() {
  state.name = ''; state.universe = ''; state.age = '';
  state.skin = '#f5d0a9'; state.hair = '#3b2416'; state.hairStyle = 'short';
  state.eye = '#4a2c17'; state.mouth = 'smile'; state.outfit = '#3b82f6';
  state.bg = 'linear-gradient(135deg,#f472b6,#a78bfa)';
  state.acc = {};
  ACC_KEYS.forEach(k => state.acc[k] = false);
  state.power = ''; state.traits = []; state.story = '';
  state.editingId = null;
  syncFormFromState();
  updateAvatar();
}

function syncFormFromState() {
  document.getElementById('name').value = state.name;
  document.getElementById('universe').value = state.universe;
  document.getElementById('age').value = state.age;
  document.getElementById('power').value = state.power;
  document.getElementById('story').value = state.story;
  ACC_KEYS.forEach(k => {
    const el = document.getElementById('acc-' + k);
    if (el) el.checked = !!state.acc[k];
  });
  markSwatch('skin-swatches', state.skin);
  markSwatch('hair-swatches', state.hair);
  markSwatch('eye-swatches', state.eye);
  markSwatch('outfit-swatches', state.outfit);
  markSwatch('bg-swatches', state.bg, true);
  markButton('hair-style', 'style', state.hairStyle);
  markButton('mouth-style', 'mouth', state.mouth);
  markTraits(state.traits);
}

function markSwatch(containerId, value, isBg = false) {
  const c = document.getElementById(containerId);
  c.querySelectorAll('.swatch').forEach(s => {
    const v = isBg ? s.dataset.bg : s.dataset.color;
    s.classList.toggle('active', v === value);
  });
}
function markButton(containerId, dataKey, value) {
  const c = document.getElementById(containerId);
  c.querySelectorAll('button').forEach(b => {
    b.classList.toggle('active', b.dataset[dataKey] === value);
  });
}
function markTraits(traits) {
  document.querySelectorAll('#traits button').forEach(b => {
    b.classList.toggle('active', traits.includes(b.dataset.trait));
  });
}

// ---------- Zufalls-Charakter ----------
const rnd = arr => arr[Math.floor(Math.random() * arr.length)];
const names = ['Luna', 'Kai', 'Zara', 'Milo', 'Nova', 'Finn', 'Aria', 'Rex', 'Elin', 'Theo', 'Soraya', 'Jinx', 'Ember', 'Kira'];
const lastNames = ['Sternenstaub', 'Schattenherz', 'Mondschein', 'Feuersturm', 'Eiskralle', 'Nachtfalter', 'Donnerwolke', 'Silberfuchs'];
const universes = ['Harry Potter', 'Marvel', 'Star Wars', 'Anime / Manga', 'Stranger Things', 'Percy Jackson', 'Avatar – Herr der Elemente', 'Eigenes Universum'];
const powers = ['Zeit anhalten', 'Feuermagie', 'Gedankenlesen', 'Unsichtbarkeit', 'Heilkräfte', 'Fliegen', 'Sturmkontrolle', 'Schattenspringen', 'Tierfreundschaft', 'Super-Geschwindigkeit'];
const traitsPool = ['Mutig', 'Klug', 'Lustig', 'Geheimnisvoll', 'Loyal', 'Chaotisch', 'Romantisch', 'Stark', 'Schüchtern', 'Rebellisch'];

function randomize() {
  state.name = rnd(names) + ' ' + rnd(lastNames);
  state.universe = rnd(universes);
  state.age = String(12 + Math.floor(Math.random() * 30));
  state.skin = rnd(['#f5d0a9', '#e8b888', '#c68863', '#8d5524', '#5c3317', '#c2e0f2']);
  state.hair = rnd(['#3b2416', '#1f1f1f', '#d4a017', '#b91c1c', '#ec4899', '#8b5cf6', '#06b6d4']);
  state.hairStyle = rnd(Object.keys(HAIR_STYLES).filter(k => k !== 'bald'));
  state.eye = rnd(['#4a2c17', '#2563eb', '#16a34a', '#a855f7', '#eab308', '#dc2626']);
  state.mouth = rnd(['smile', 'neutral', 'smirk']);
  state.outfit = rnd(['#3b82f6', '#dc2626', '#16a34a', '#1f2937', '#fbbf24', '#ec4899', '#7c3aed']);
  state.bg = rnd([
    'linear-gradient(135deg,#f472b6,#a78bfa)',
    'linear-gradient(135deg,#60a5fa,#22d3ee)',
    'linear-gradient(135deg,#fbbf24,#f97316)',
    'linear-gradient(135deg,#0f172a,#334155)',
    'linear-gradient(135deg,#16a34a,#84cc16)',
  ]);
  // Accessoires: zufällig 2-4 aktivieren, manche mit höherer Chance
  state.acc = {};
  ACC_KEYS.forEach(k => state.acc[k] = false);
  const pickPool = [...ACC_KEYS];
  const numAcc = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numAcc; i++) {
    const pick = pickPool.splice(Math.floor(Math.random() * pickPool.length), 1)[0];
    state.acc[pick] = true;
  }
  // Konflikte auflösen: Brille+Sonnenbrille / Hörner+Heiligenschein / Tierohren+Krone
  if (state.acc.glasses && state.acc.sunglasses) state.acc.sunglasses = false;
  if (state.acc.halo && state.acc.horns) state.acc.horns = false;
  if (state.acc.eyepatch) { state.acc.glasses = false; state.acc.sunglasses = false; }
  state.power = rnd(powers);
  const n = 2 + Math.floor(Math.random() * 3);
  const pool = [...traitsPool];
  state.traits = [];
  for (let i = 0; i < n; i++) state.traits.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  state.story = '';
  state.editingId = null;
  syncFormFromState();
  updateAvatar();
  showToast('🎲 Zufälliger Charakter erstellt!');
}

document.getElementById('random-btn').addEventListener('click', randomize);

// ---------- Galerie ----------
function avatarSVG(c) {
  const hairPaths = HAIR_STYLES;
  const m = MOUTH_SHAPES[c.mouth] || MOUTH_SHAPES.smile;
  const a = c.acc || {};
  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
    ${a.wings ? '<g><path d="M40 150 Q5 135 15 185 Q35 185 55 170 Z" fill="#fef3c7" stroke="#fbbf24" stroke-width="1.5"/><path d="M160 150 Q195 135 185 185 Q165 185 145 170 Z" fill="#fef3c7" stroke="#fbbf24" stroke-width="1.5"/></g>' : ''}
    ${a.cape ? '<path d="M58 148 Q100 270 142 148 L170 230 L30 230 Z" fill="#b91c1c" />' : ''}
    <path d="M54 150 Q100 175 146 150 L170 230 L30 230 Z" fill="${c.outfit}" />
    <path d="M54 150 Q100 168 146 150 L150 185 L50 185 Z" fill="#000" opacity="0.12" />
    <path d="M82 152 Q100 162 118 152" stroke="#000" stroke-opacity="0.25" stroke-width="1.5" fill="none" />
    <path d="M87 128 L87 152 Q100 156 113 152 L113 128 Z" fill="${c.skin}" />
    <path d="M87 145 Q100 152 113 145 L113 152 Q100 156 87 152 Z" fill="#000" opacity="0.18" />
    <ellipse cx="58" cy="108" rx="7" ry="13" fill="${c.skin}" />
    <ellipse cx="142" cy="108" rx="7" ry="13" fill="${c.skin}" />
    <path d="M57 103 Q61 108 60 115 Q58 118 56 113 Z" fill="#000" opacity="0.2" />
    <path d="M143 103 Q139 108 140 115 Q142 118 144 113 Z" fill="#000" opacity="0.2" />
    <ellipse cx="100" cy="100" rx="42" ry="50" fill="${c.skin}" />
    <path d="M58 105 Q63 135 82 148 Q67 138 60 110 Z" fill="#000" opacity="0.08" />
    <path d="M142 105 Q137 135 118 148 Q133 138 140 110 Z" fill="#000" opacity="0.08" />
    <ellipse cx="100" cy="70" rx="18" ry="6" fill="#fff" opacity="0.2" />
    ${c.hairStyle !== 'bald' ? `<path d="${hairPaths[c.hairStyle] || hairPaths.short}" fill="${c.hair}" />` : ''}
    <path d="M73 86 Q82 81 92 87" stroke="${c.hair}" stroke-width="3" fill="none" stroke-linecap="round" />
    <path d="M108 87 Q118 81 127 86" stroke="${c.hair}" stroke-width="3" fill="none" stroke-linecap="round" />
    ${a.ears ? '<g><path d="M70 72 L62 40 L86 62 Z" fill="#78350f"/><path d="M130 72 L138 40 L114 62 Z" fill="#78350f"/><path d="M72 68 L70 50 L82 60 Z" fill="#fbbf24"/><path d="M128 68 L130 50 L118 60 Z" fill="#fbbf24"/></g>' : ''}
    ${a.horns ? '<g><path d="M72 65 Q66 40 82 58 Z" fill="#7f1d1d"/><path d="M128 65 Q134 40 118 58 Z" fill="#7f1d1d"/></g>' : ''}
    ${a.halo ? '<ellipse cx="100" cy="38" rx="48" ry="8" fill="none" stroke="#fbbf24" stroke-width="3"/>' : ''}
    ${a.crown ? '<g><path d="M65 58 L75 30 L88 52 L100 22 L112 52 L125 30 L135 58 Z" fill="#fbbf24" stroke="#b45309" stroke-width="1.5"/><circle cx="85" cy="48" r="3" fill="#ef4444"/><circle cx="100" cy="40" r="3" fill="#3b82f6"/><circle cx="115" cy="48" r="3" fill="#10b981"/></g>' : ''}
    ${a.flower ? '<g><circle cx="64" cy="76" r="4" fill="#ec4899"/><circle cx="68" cy="71" r="4" fill="#ec4899"/><circle cx="72" cy="76" r="4" fill="#ec4899"/><circle cx="68" cy="81" r="4" fill="#ec4899"/><circle cx="68" cy="76" r="2" fill="#fbbf24"/></g>' : ''}
    ${a.bow ? '<g><path d="M90 52 L78 42 L78 62 Z" fill="#ec4899"/><path d="M110 52 L122 42 L122 62 Z" fill="#ec4899"/><circle cx="100" cy="52" r="5" fill="#be185d"/></g>' : ''}
    ${a.headband ? '<g><rect x="56" y="75" width="88" height="10" fill="#dc2626"/><circle cx="100" cy="80" r="4" fill="#fbbf24"/></g>' : ''}
    ${a.headphones ? '<g><path d="M55 75 Q100 25 145 75" stroke="#1f2937" stroke-width="5" fill="none"/><rect x="46" y="75" width="16" height="28" rx="5" fill="#1f2937"/><rect x="138" y="75" width="16" height="28" rx="5" fill="#1f2937"/></g>' : ''}
    <path d="M74 100 Q83 94 92 100 Q83 106 74 100 Z" fill="#fff" stroke="#8d6e52" stroke-width="0.6" />
    <path d="M108 100 Q117 94 126 100 Q117 106 108 100 Z" fill="#fff" stroke="#8d6e52" stroke-width="0.6" />
    <circle cx="83" cy="100" r="4" fill="${c.eye}" />
    <circle cx="117" cy="100" r="4" fill="${c.eye}" />
    <circle cx="83" cy="100" r="1.8" fill="#000" />
    <circle cx="117" cy="100" r="1.8" fill="#000" />
    <circle cx="85" cy="98" r="1.2" fill="#fff" />
    <circle cx="119" cy="98" r="1.2" fill="#fff" />
    <path d="M74 100 Q83 94 92 100" stroke="#1f1f1f" stroke-width="1.3" fill="none" stroke-linecap="round" />
    <path d="M108 100 Q117 94 126 100" stroke="#1f1f1f" stroke-width="1.3" fill="none" stroke-linecap="round" />
    <path d="M100 108 Q96 120 99 125 Q102 127 104 125" stroke="#8d6e52" stroke-width="1.1" fill="none" stroke-linecap="round" stroke-opacity="0.7" />
    <ellipse cx="97" cy="124" rx="1.5" ry="0.9" fill="#000" opacity="0.25" />
    <ellipse cx="103" cy="124" rx="1.5" ry="0.9" fill="#000" opacity="0.25" />
    ${a.freckles ? '<g><circle cx="78" cy="112" r="1.2" fill="#78350f"/><circle cx="86" cy="116" r="1.2" fill="#78350f"/><circle cx="114" cy="116" r="1.2" fill="#78350f"/><circle cx="122" cy="112" r="1.2" fill="#78350f"/><circle cx="95" cy="118" r="1.2" fill="#78350f"/><circle cx="105" cy="118" r="1.2" fill="#78350f"/></g>' : ''}
    ${a.blush ? '<g><ellipse cx="73" cy="118" rx="8" ry="3.5" fill="#f87171" opacity="0.55"/><ellipse cx="127" cy="118" rx="8" ry="3.5" fill="#f87171" opacity="0.55"/></g>' : ''}
    <path d="${m.upper}" fill="#be185d" />
    <path d="${m.lower}" fill="#ec4899" />
    <path d="M94 138 Q100 140 106 138" stroke="#fff" stroke-opacity="0.4" stroke-width="0.8" fill="none" stroke-linecap="round" />
    <path d="${m.line}" stroke="#831843" stroke-width="1" fill="none" stroke-linecap="round" />
    ${a.fangs ? '<g><path d="M94 122 L92 132 L97 127 Z" fill="#fff" stroke="#1f2937" stroke-width="0.5"/><path d="M106 122 L108 132 L103 127 Z" fill="#fff" stroke="#1f2937" stroke-width="0.5"/></g>' : ''}
    ${a.beard ? '<path d="M72 115 Q100 152 128 115 Q122 142 100 148 Q78 142 72 115 Z" fill="#3b2416"/>' : ''}
    ${a.whiskers ? '<g><line x1="62" y1="115" x2="84" y2="118" stroke="#1f2937" stroke-width="1"/><line x1="62" y1="120" x2="84" y2="120" stroke="#1f2937" stroke-width="1"/><line x1="138" y1="115" x2="116" y2="118" stroke="#1f2937" stroke-width="1"/><line x1="138" y1="120" x2="116" y2="120" stroke="#1f2937" stroke-width="1"/><ellipse cx="100" cy="115" rx="3" ry="2" fill="#1f2937"/></g>' : ''}
    ${a.glasses ? '<g><circle cx="85" cy="100" r="10" stroke="#1f2937" stroke-width="2" fill="none"/><circle cx="115" cy="100" r="10" stroke="#1f2937" stroke-width="2" fill="none"/><line x1="95" y1="100" x2="105" y2="100" stroke="#1f2937" stroke-width="2"/></g>' : ''}
    ${a.sunglasses ? '<g><rect x="71" y="92" width="24" height="14" rx="3" fill="#1f2937"/><rect x="105" y="92" width="24" height="14" rx="3" fill="#1f2937"/><line x1="95" y1="98" x2="105" y2="98" stroke="#1f2937" stroke-width="2"/></g>' : ''}
    ${a.eyepatch ? '<g><rect x="73" y="92" width="24" height="14" rx="3" fill="#1f2937"/><path d="M60 88 L140 100" stroke="#1f2937" stroke-width="2"/></g>' : ''}
    ${a.earrings ? '<g><circle cx="58" cy="118" r="4" fill="#fbbf24" stroke="#b45309" stroke-width="1"/><circle cx="142" cy="118" r="4" fill="#fbbf24" stroke="#b45309" stroke-width="1"/></g>' : ''}
    ${a.star ? '<polygon points="130,115 132,120 138,120 133,124 135,130 130,126 125,130 127,124 122,120 128,120" fill="#fbbf24" stroke="#b45309" stroke-width="0.5"/>' : ''}
    ${a.scar ? '<path d="M108 80 L112 88 L108 94" stroke="#b91c1c" stroke-width="1.5" fill="none"/>' : ''}
    ${a.hat ? '<g><ellipse cx="100" cy="60" rx="50" ry="8" fill="#1f2937"/><path d="M70 60 L80 20 L120 20 L130 60 Z" fill="#1f2937"/><rect x="72" y="55" width="56" height="5" fill="#fbbf24"/></g>' : ''}
    ${a.mask ? '<rect x="60" y="92" width="80" height="20" rx="10" fill="#1f2937"/>' : ''}
    ${a.necklace ? '<g><path d="M78 145 Q100 162 122 145" stroke="#fbbf24" stroke-width="2" fill="none"/><polygon points="100,162 95,156 105,156" fill="#3b82f6" stroke="#1e3a8a" stroke-width="1"/></g>' : ''}
    ${a.scarf ? '<g><path d="M62 138 Q100 162 138 138 L142 158 Q100 178 58 158 Z" fill="#dc2626"/><rect x="72" y="155" width="10" height="28" fill="#b91c1c"/></g>' : ''}
  </svg>`;
}

function renderGallery() {
  const list = loadAll();
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  document.getElementById('gallery-count').textContent = list.length;
  if (list.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  grid.innerHTML = list.map(c => `
    <div class="char-card" data-id="${c.id}">
      <button class="delete-btn" data-del="${c.id}" title="Löschen">🗑️</button>
      <div class="avatar-wrap" style="background:${c.bg}">${avatarSVG(c)}</div>
      <div class="info">
        <h3>${escapeHtml(c.name)}</h3>
        <p class="universe">${c.universe ? '✨ ' + escapeHtml(c.universe) : '✨ Unbekannt'}${c.age ? ' · ' + escapeHtml(String(c.age)) + ' Jahre' : ''}</p>
        <div class="mini-traits">
          ${c.traits.slice(0, 4).map(t => `<span class="mini-chip">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.char-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.dataset.del) return;
      loadCharacterIntoForm(card.dataset.id);
    });
  });
  grid.querySelectorAll('[data-del]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!confirm('Diesen Charakter wirklich löschen?')) return;
      const all = loadAll().filter(c => c.id !== btn.dataset.del);
      saveAll(all);
      renderGallery();
      showToast('🗑️ Charakter gelöscht');
    });
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

function loadCharacterIntoForm(id) {
  const c = loadAll().find(x => x.id === id);
  if (!c) return;
  Object.assign(state, {
    name: c.name, universe: c.universe, age: c.age,
    skin: c.skin, hair: c.hair, hairStyle: c.hairStyle,
    eye: c.eye, mouth: c.mouth, outfit: c.outfit, bg: c.bg,
    acc: { ...c.acc }, power: c.power, traits: [...c.traits], story: c.story,
    editingId: c.id,
  });
  document.querySelector('.tab[data-tab="create"]').click();
  syncFormFromState();
  updateAvatar();
  showToast('✏️ Bearbeite: ' + c.name);
}

// ---------- Inspiration ----------
const INSPIRATIONS = [
  { name: 'Magische Hogwarts-Schülerin', universe: 'Harry Potter', skin: '#f5d0a9', hair: '#3b2416', hairStyle: 'long', eye: '#16a34a', mouth: 'smile', outfit: '#1f2937', bg: 'linear-gradient(135deg,#fbbf24,#b91c1c)', acc: { glasses: true, hat: false, cape: true, scar: false, mask: false }, power: 'Zaubersprüche & Verwandlung', traits: ['Klug', 'Mutig', 'Loyal'], story: 'Eine Schülerin, die heimlich mit uralter Magie experimentiert.' },
  { name: 'Superheldin der Nacht', universe: 'Marvel', skin: '#e8b888', hair: '#1f1f1f', hairStyle: 'long', eye: '#2563eb', mouth: 'smirk', outfit: '#7c3aed', bg: 'linear-gradient(135deg,#0f172a,#334155)', acc: { glasses: false, hat: false, cape: true, scar: false, mask: true }, power: 'Schattenkontrolle', traits: ['Mutig', 'Geheimnisvoll', 'Stark'], story: 'Sie beschützt die Stadt, wenn die Sonne untergeht.' },
  { name: 'Jedi-Lichtkämpfer', universe: 'Star Wars', skin: '#c68863', hair: '#d4a017', hairStyle: 'short', eye: '#eab308', mouth: 'neutral', outfit: '#8d5524', bg: 'linear-gradient(135deg,#60a5fa,#22d3ee)', acc: { glasses: false, hat: false, cape: true, scar: true, mask: false }, power: 'Macht-Fähigkeiten', traits: ['Mutig', 'Loyal', 'Klug'], story: 'Ein junger Jedi auf der Suche nach seinem Weg in der Galaxie.' },
  { name: 'Anime-Feuermagier', universe: 'Anime / Manga', skin: '#f5d0a9', hair: '#b91c1c', hairStyle: 'mohawk', eye: '#dc2626', mouth: 'smirk', outfit: '#dc2626', bg: 'linear-gradient(135deg,#ef4444,#fbbf24)', acc: { glasses: false, hat: false, cape: false, scar: true, mask: false }, power: 'Feuermagie', traits: ['Rebellisch', 'Stark', 'Chaotisch'], story: 'Geboren mit dem Zeichen der Flammen.' },
  { name: 'Geheimnisvolle Elfenprinzessin', universe: 'Herr der Ringe', skin: '#f5d0a9', hair: '#ffffff', hairStyle: 'long', eye: '#a855f7', mouth: 'smile', outfit: '#ffffff', bg: 'linear-gradient(135deg,#16a34a,#84cc16)', acc: { glasses: false, hat: false, cape: true, scar: false, mask: false }, power: 'Naturmagie', traits: ['Klug', 'Geheimnisvoll', 'Loyal'], story: 'Die letzte ihres Volkes, auf einer Mission durch alte Wälder.' },
  { name: 'Rebellischer Zeitreisender', universe: 'Stranger Things', skin: '#e8b888', hair: '#d4a017', hairStyle: 'curly', eye: '#2563eb', mouth: 'smirk', outfit: '#ec4899', bg: 'linear-gradient(135deg,#f472b6,#a78bfa)', acc: { glasses: true, hat: false, cape: false, scar: false, mask: false }, power: 'Zeit anhalten', traits: ['Lustig', 'Klug', 'Chaotisch'], story: 'Zwischen den 80ern und einer anderen Dimension gefangen.' },
];

function renderInspiration() {
  const grid = document.getElementById('inspiration-grid');
  grid.innerHTML = INSPIRATIONS.map((c, i) => `
    <div class="char-card" data-insp="${i}">
      <div class="avatar-wrap" style="background:${c.bg}">${avatarSVG(c)}</div>
      <div class="info">
        <h3>${escapeHtml(c.name)}</h3>
        <p class="universe">✨ ${escapeHtml(c.universe)}</p>
        <div class="mini-traits">
          ${c.traits.map(t => `<span class="mini-chip">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
  grid.querySelectorAll('.char-card').forEach(card => {
    card.addEventListener('click', () => {
      const tpl = INSPIRATIONS[+card.dataset.insp];
      Object.assign(state, {
        name: tpl.name, universe: tpl.universe, age: '',
        skin: tpl.skin, hair: tpl.hair, hairStyle: tpl.hairStyle,
        eye: tpl.eye, mouth: tpl.mouth, outfit: tpl.outfit, bg: tpl.bg,
        acc: { ...tpl.acc }, power: tpl.power, traits: [...tpl.traits], story: tpl.story,
        editingId: null,
      });
      document.querySelector('.tab[data-tab="create"]').click();
      syncFormFromState();
      updateAvatar();
      showToast('💡 Vorlage geladen – jetzt anpassen!');
    });
  });
}

// ---------- Initialer Start ----------
document.getElementById('gallery-count').textContent = loadAll().length;
syncFormFromState();
updateAvatar();


