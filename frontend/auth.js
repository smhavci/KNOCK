const TOKEN_KEY = 'knock_token';

let currentToken = localStorage.getItem(TOKEN_KEY) || null;
let currentUser  = currentToken ? _parseToken(currentToken) : null;

let authMode = 'signin';

// ── Session ───────────────────────────────────────────────

function _parseToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
}

function getToken()    { return currentToken; }
function getUsername() { return currentUser?.username || null; }
function isLoggedIn()  { return !!currentToken; }

function _setSession(token) {
  currentToken = token;
  currentUser  = _parseToken(token);
  localStorage.setItem(TOKEN_KEY, token);
  _updateUI();
}

function _clearSession() {
  currentToken = null;
  currentUser  = null;
  localStorage.removeItem(TOKEN_KEY);
  _updateUI();
}

// ── UI ────────────────────────────────────────────────────

function _updateUI() {
  const authBtn       = document.getElementById('auth-btn');
  const displayToggle = document.getElementById('display-toggle');
  const usernameLabel = document.getElementById('toggle-username-label');
  const submitBtn     = document.getElementById('submit-btn');
  const signinHint    = document.getElementById('signin-hint');

  if (!authBtn) return;

  if (isLoggedIn()) {
    authBtn.textContent = `— ${getUsername()} · sign out —`;
    authBtn.onclick = _clearSession;
    if (displayToggle) {
      displayToggle.classList.remove('hidden');
      if (usernameLabel) usernameLabel.textContent = getUsername();
    }
    if (submitBtn) { submitBtn.textContent = 'Knock'; submitBtn.classList.remove('btn-guest'); }
    if (signinHint) signinHint.classList.add('hidden');
  } else {
    authBtn.textContent = '— sign in —';
    authBtn.classList.add('auth-btn-prominent');
    authBtn.onclick = openAuthModal;
    if (displayToggle) displayToggle.classList.add('hidden');
    if (submitBtn) { submitBtn.textContent = 'Knock'; submitBtn.classList.add('btn-guest'); }
    if (signinHint) signinHint.classList.remove('hidden');
  }
}

// ── Modal ─────────────────────────────────────────────────

function openAuthModal() {
  document.getElementById('auth-modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.add('hidden');
  document.body.style.overflow = '';
  document.getElementById('auth-email').value    = '';
  document.getElementById('auth-password').value = '';
  const u = document.getElementById('auth-username');
  if (u) u.value = '';
  document.getElementById('auth-error').textContent = '';
}

function switchAuthMode(mode) {
  authMode = mode;
  const usernameRow = document.getElementById('username-row');
  const tabSignin   = document.getElementById('tab-signin');
  const tabSignup   = document.getElementById('tab-signup');
  const submitBtn   = document.getElementById('auth-submit');

  if (mode === 'signup') {
    usernameRow.classList.remove('hidden');
    tabSignin.classList.remove('active');
    tabSignup.classList.add('active');
    submitBtn.textContent = 'Create account';
  } else {
    usernameRow.classList.add('hidden');
    tabSignin.classList.add('active');
    tabSignup.classList.remove('active');
    submitBtn.textContent = 'Sign in';
  }
  document.getElementById('auth-error').textContent = '';
}

async function submitAuth() {
  const email     = document.getElementById('auth-email').value.trim();
  const password  = document.getElementById('auth-password').value;
  const errorEl   = document.getElementById('auth-error');
  const submitBtn = document.getElementById('auth-submit');

  errorEl.style.color = 'var(--error)';
  if (!email || !password) { errorEl.textContent = 'Email and password are required.'; return; }

  submitBtn.disabled = true;
  errorEl.textContent = '';

  try {
    if (authMode === 'signup') {
      const username = document.getElementById('auth-username').value.trim();
      if (!username) { errorEl.textContent = 'Choose a name.'; submitBtn.disabled = false; return; }

      const res  = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Signup failed.');
      _setSession(data.token);
      closeAuthModal();
    } else {
      const res  = await fetch(`${API_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Sign in failed.');
      _setSession(data.token);
      closeAuthModal();
    }
  } catch (err) {
    errorEl.textContent = err.message;
  }

  submitBtn.disabled = false;
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const modal = document.getElementById('auth-modal');
    if (modal && !modal.classList.contains('hidden')) closeAuthModal();
  }
});

_updateUI();
