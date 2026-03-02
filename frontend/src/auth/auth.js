// src/auth/auth.js
export function getToken() {
  return localStorage.getItem('access_token');
}

export function isAuthenticated() {
  const token = getToken();
  return Boolean(token);
}