/* ================================================================
   AUTH.JS – Dummy Authentication & Session Management
   ================================================================ */
const AUTH_KEY = 'medtrack_logged_in';

const auth = {
  check: function() {
    return localStorage.getItem(AUTH_KEY) === 'true';
  },

  login: function(email, pass) {
    if (email === 'doctor@gmail.com' && pass === '123456') {
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  },

  logout: function() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'index.html';
  },

  requireAuth: function() {
    if (!this.check()) {
      window.location.href = 'index.html';
    }
  }
};
