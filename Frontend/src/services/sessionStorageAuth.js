export const AUTH_KEY = 'app.auth';

// Optional: SSR/iframe/privacy-mode safety
function hasStorage() {
  try {
    if (typeof window === 'undefined') return false;
    const test = '__test_ls__';
    window.localStorage.setItem(test, '1');
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

export function getLocalAuth() {
  if (!hasStorage()) return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalAuth(auth) {
  if (!hasStorage()) return false;
  try {
    const serialized = JSON.stringify(auth);
    localStorage.setItem(AUTH_KEY, serialized);
    return true;
  } catch {
    return false;
  }
}

export function clearLocalAuth() {
  if (!hasStorage()) return false;
  try {
    localStorage.removeItem(AUTH_KEY);
    return true;
  } catch {
    return false;
  }
}