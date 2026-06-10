import api from '../config/api';

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

export const getProfile = () =>
  api.get('/auth/profile');

export const getAllUsers = () =>
  api.get('/auth/users');

export const updateUser = (id, name, email) =>
  api.put(`/auth/users/${id}`, { name, email });

export const deleteUser = (id) =>
  api.delete(`/auth/users/${id}`);

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete api.defaults.headers.common['Authorization'];
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const getToken = () => {
  return localStorage.getItem('token');
};
