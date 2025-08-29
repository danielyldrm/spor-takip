const API_BASE = '';

function token() {
  return localStorage.getItem('token');
}

async function apiFetch(path, opts = {}) {
  const headers = opts.headers || {};
  if (opts.body && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  if (token()) headers['Authorization'] = 'Bearer ' + token();
  const res = await fetch(API_BASE + path, { ...opts, headers });
  if (!res.ok) {
    let message = 'HTTP ' + res.status;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

async function apiLogin(username, password) {
  return apiFetch('/api/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}
async function apiGetWeek() {
  return apiFetch('/api/week');
}
async function apiSaveDay(dayIndex, exercises) {
  return apiFetch('/api/day/' + dayIndex, {
    method: 'PUT',
    body: JSON.stringify({ exercises })
  });
}

window.apiLogin = apiLogin;
window.apiGetWeek = apiGetWeek;
window.apiSaveDay = apiSaveDay;