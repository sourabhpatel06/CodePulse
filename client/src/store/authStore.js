import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('cp_user')) || null,
  token: localStorage.getItem('cp_token') || null,
  login: (user, token) => {
    localStorage.setItem('cp_user', JSON.stringify(user));
    localStorage.setItem('cp_token', token);
    set({ user, token });
  },
  updateUser: (user) => {
    localStorage.setItem('cp_user', JSON.stringify(user));
    set({ user });
  },
  logout: () => {
    localStorage.removeItem('cp_user');
    localStorage.removeItem('cp_token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;