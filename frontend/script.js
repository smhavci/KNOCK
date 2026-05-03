const DYLAN_QUOTES = [
  '"He not busy being born is busy dying."',
  '"What\'s money? A man is a success if he gets up in the morning and goes to bed at night, and in between does what he wants to do."',
  '"Take care of all your memories. For you cannot relive them."',
  '"Behind every beautiful thing, there\'s been some kind of pain."',
  '"I accept chaos. I\'m not sure whether it accepts me."',
  '"No one is free, even the birds are chained to the sky."',
  '"I\'m mortified to be on the stage, but then again, it\'s the only place where I\'m happy."',
];

const memoryInput = document.getElementById('memory-input');
const submitBtn   = document.getElementById('submit-btn');
const charCount   = document.getElementById('char-count');
const loading     = document.getElementById('loading');
const result      = document.getElementById('result');
const errorSec    = document.getElementById('error');
const poemOutput  = document.getElementById('poem-output');
const doorImage   = document.getElementById('door-image');
const errorMsg    = document.getElementById('error-msg');
const cursor      = document.getElementById('cursor');
const quoteEl     = document.getElementById('random-quote');
const downloadBtn = document.getElementById('download-btn');
const listenBtn   = document.getElementById('listen-btn');

let lastImageUrl = '', lastPoem = '';
let ttsAudio = null, ttsPlaying = false;

downloadBtn.addEventListener('click', () => {
  if (!lastImageUrl || !lastPoem) return;
  downloadDoor(lastImageUrl, lastPoem, new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }));
});

const INSPIRE_PROMPTS = [
  'What did summer smell like when you were eight?',
  'Who called your name from another room — and what did their voice sound like?',
  'What game ended when the streetlights came on?',
  'What did the backseat of your parents\' car feel like on long drives home?',
  'What sound meant you were almost home?',
  'What did you carry in your pockets as a child?',
  'What place felt infinite when you were small, and tiny when you went back?',
  'What did bedtime sound like in your house?',
  'What smell takes you back the fastest?',
  'Who taught you something without meaning to?',
  'What was the last summer before everything changed?',
  'What did you do when no one was watching?',
  'What did your grandparents\' home smell like?',
  'What was the first thing that ever broke your heart — before you knew what a broken heart was?',
  'What did you believe in that turned out not to be real?',
];

let inspiredLocked = false;

function inspireMe() {
  const prompt = INSPIRE_PROMPTS[Math.floor(Math.random() * INSPIRE_PROMPTS.length)];
  memoryInput.value = prompt;
  charCount.textContent = `${prompt.length} / 600`;
  memoryInput.focus();
  memoryInput.setSelectionRange(prompt.length, prompt.length);

  // Lock Knock until user edits the inspired text
  inspiredLocked = true;
  submitBtn.disabled = true;
  submitBtn.title = 'Write your own memory first — then knock.';
  memoryInput.classList.add('inspired');
}

memoryInput.addEventListener('input', () => {
  charCount.textContent = `${memoryInput.value.length} / 600`;

  if (inspiredLocked) {
    inspiredLocked = false;
    submitBtn.disabled = false;
    submitBtn.title = '';
    memoryInput.classList.remove('inspired');
  }
});

async function createDoor() {
  const token = getToken();
  if (!token) { openAuthModal(); return; }

  const memory = memoryInput.value.trim();
  if (memory.length < 10) {
    showError('Write a little more — even a small memory deserves a door.');
    return;
  }

  const showNameToggle = document.getElementById('show-name-toggle');
  const displayName = (showNameToggle && showNameToggle.checked)
    ? (getUsername() || null)
    : null;

  setLoading(true);
  poemOutput.textContent = '';
  lastPoem = '';
  lastImageUrl = '';

  try {
    const res = await fetch(`${API_URL}/create-door`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ memory, display_name: displayName }),
    });

    if (!res.ok) {
      const data = await res.json();
      showError(data.detail || 'Something went wrong. Try again.');
      return;
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer    = '';
    let poemStarted = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        let msg;
        try { msg = JSON.parse(line.slice(6)); } catch { continue; }

        if (msg.type === 'poem') {
          if (!poemStarted) {
            poemStarted = true;
            setLoading(false);
            show(result);
            quoteEl.textContent = DYLAN_QUOTES[Math.floor(Math.random() * DYLAN_QUOTES.length)];
            cursor.classList.remove('hidden');
          }
          poemOutput.textContent += msg.text;
          lastPoem += msg.text;

        } else if (msg.type === 'image_loading') {
          doorImage.classList.remove('loaded');
          doorImage.src = '';

        } else if (msg.type === 'image') {
          lastImageUrl = msg.url;
          cursor.classList.add('hidden');
          doorImage.src = msg.url;
          doorImage.onload = () => doorImage.classList.add('loaded');

        } else if (msg.type === 'done') {
          lastPoem = lastPoem.trim();

        } else if (msg.type === 'error') {
          showError(msg.detail || 'Something went wrong.');
          return;
        }
      }
    }

  } catch (err) {
    showError('Could not reach the server. Make sure the backend is running.');
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function listenPoem() {
  if (!lastPoem) return;

  // Stop if already playing
  if (ttsPlaying && ttsAudio) {
    ttsAudio.pause();
    ttsAudio = null;
    ttsPlaying = false;
    listenBtn.textContent = '▷ listen';
    listenBtn.disabled = false;
    return;
  }

  listenBtn.textContent = '...';
  listenBtn.disabled = true;

  try {
    const res = await fetch(`${API_URL}/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ poem: lastPoem }),
    });

    if (!res.ok) throw new Error('TTS failed');

    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);

    ttsAudio = new Audio(url);
    ttsAudio.volume = 0.92;
    ttsAudio.play();
    ttsPlaying = true;
    listenBtn.textContent = '◼ stop';
    listenBtn.disabled = false;

    ttsAudio.onended = () => {
      ttsPlaying = false;
      listenBtn.textContent = '▷ listen';
      URL.revokeObjectURL(url);
    };
  } catch {
    listenBtn.textContent = '▷ listen';
    listenBtn.disabled = false;
  }
}

function reset() {
  if (ttsAudio) { ttsAudio.pause(); ttsAudio = null; ttsPlaying = false; }
  listenBtn.textContent = '▷ listen';
  listenBtn.disabled = false;

  hide(result);
  hide(errorSec);
  memoryInput.value = '';
  charCount.textContent = '0 / 600';
  poemOutput.textContent = '';
  doorImage.src = '';
  doorImage.classList.remove('loaded');
  cursor.classList.add('hidden');
  submitBtn.disabled = false;
  inspiredLocked = false;
  memoryInput.classList.remove('inspired');
}

function setLoading(on) {
  if (on) {
    submitBtn.disabled = true;
    hide(result);
    hide(errorSec);
    show(loading);
  } else {
    hide(loading);
    submitBtn.disabled = false;
  }
}

function showError(msg) {
  setLoading(false);
  errorMsg.textContent = msg;
  show(errorSec);
}

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }
