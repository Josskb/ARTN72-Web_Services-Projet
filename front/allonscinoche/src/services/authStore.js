// src/services/authStore.js
import { reactive, computed } from 'vue';
import { authAPI } from './api.js';

const state = reactive({
  token: localStorage.getItem('token') || null,
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })(),
  error: null
});

const isLoggedIn = computed(() => !!state.token);
const isAdmin = computed(() => state.user?.role === 'ADMIN');

const saveAuth = (token, user) => {
  state.token = token;
  state.user = user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const clearAuth = () => {
  state.token = null;
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

const login = async (username, password) => {
  state.error = null;
  const res = await authAPI.login({ username, password });
  saveAuth(res.token, res.user);
  return res;
};

const logout = () => {
  clearAuth();
};

const clearError = () => {
  state.error = null;
};

export function useAuth() {
  return {
    state,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    clearError
  };
}
