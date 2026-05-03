const grid          = document.getElementById('gallery-grid');
const loadingEl     = document.getElementById('loading-gallery');
const emptyEl       = document.getElementById('empty-state');
const doorCountEl   = document.getElementById('door-count');
const overlay         = document.getElementById('overlay');
const overlayImg      = document.getElementById('overlay-img');
const overlayMemory   = document.getElementById('overlay-memory');
const overlayPoem     = document.getElementById('overlay-poem');
const overlayDate     = document.getElementById('overlay-date');
const overlayDownload = document.getElementById('overlay-download');

let activeDoor = null;
overlayDownload.addEventListener('click', () => {
  if (!activeDoor) return;
  downloadDoor(activeDoor.image_url, activeDoor.poem, formatDate(activeDoor.created_at));
});

async function loadGallery() {
  grid.innerHTML = '';
  emptyEl.classList.add('hidden');
  loadingEl.classList.remove('hidden');

  try {
    const res = await fetch(`${API_URL}/gallery-data`);
    const doors = await res.json();

    loadingEl.classList.add('hidden');

    if (doors.length === 0) {
      emptyEl.classList.remove('hidden');
      return;
    }

    doorCountEl.textContent = `${doors.length} door${doors.length === 1 ? '' : 's'} knocked`;
    doors.forEach(door => grid.appendChild(buildCard(door)));

  } catch (err) {
    loadingEl.innerHTML = '<p class="loading-text" style="color:var(--error)">Could not reach the server.</p>';
  }
}

function buildCard(door) {
  const firstLine = door.poem.split('\n').find(l => l.trim()) || door.poem;
  const date      = formatDate(door.created_at);
  const author    = door.display_name ? ` · — ${escapeHtml(door.display_name)}` : '';

  const card = document.createElement('div');
  card.className = 'door-card';
  card.innerHTML = `
    <img src="${door.image_url}" alt="A door" loading="lazy" />
    <div class="card-overlay">
      <p class="card-first-line">${escapeHtml(firstLine)}</p>
      <p class="card-date">${date}${author}</p>
    </div>
  `;
  card.addEventListener('click', () => openOverlay(door));
  return card;
}

function openOverlay(door) {
  activeDoor = door;
  overlayImg.src    = door.image_url;
  overlayMemory.textContent = `"${door.memory}"`;
  overlayPoem.textContent   = door.poem;
  const author = door.display_name ? ` · — ${door.display_name}` : '';
  overlayDate.textContent   = formatDate(door.created_at) + author;
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeOverlay() {
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeOverlay();
});

function formatDate(raw) {
  if (!raw) return '';
  const d = new Date(raw.replace(' ', 'T') + 'Z');
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// loadGallery() is called by router.js when switching to gallery view
