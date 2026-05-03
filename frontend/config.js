// In production (Railway), the frontend is served by the same FastAPI backend,
// so we use the current origin. In local dev, fall back to localhost:8000.
const API_URL = (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost')
  ? 'http://127.0.0.1:8000'
  : window.location.origin;
