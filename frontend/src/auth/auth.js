// src/auth/auth.js
export function getToken() {
  return localStorage.getItem('access_token');
}

export function getUser() {
  const userStr = localStorage.getItem('user_info');
  if (!userStr || userStr === 'undefined') return null;
  
  try {
    return JSON.parse(userStr);
  } catch (e) {
    console.error("Failed to parse user info", e);
    // Clear corrupted state
    localStorage.removeItem('user_info');
    localStorage.removeItem('access_token');
    return null;
  }
}

export function isAuthenticated() {
  const token = getToken();
  const user = getUser();
  return Boolean(token && user && user.id && user.role);
}

export function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_info');
  window.location.href = '/login';
}