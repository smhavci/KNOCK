const SUBTITLES = {
  main:    'Write a childhood memory. Find your door.',
  gallery: 'Every door knocked. Every childhood left behind.',
};

const TITLES = {
  main:    'KNOCK — Design Your Door',
  gallery: 'All Doors — KNOCK',
};

function showView(name) {
  document.getElementById('view-main').classList.toggle('hidden', name !== 'main');
  document.getElementById('view-gallery').classList.toggle('hidden', name !== 'gallery');
  document.getElementById('page-subtitle').textContent = SUBTITLES[name];
  document.title = TITLES[name];

  window.scrollTo({ top: 0, behavior: 'smooth' });

  if (name === 'gallery') loadGallery();
}
