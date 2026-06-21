import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      
      // Login action
      login: (userData, token, role) => set({ 
        user: userData, 
        token, 
        role, 
        isAuthenticated: true 
      }),
      
      // Logout action
      logout: () => set({ 
        user: null, 
        token: null, 
        role: null, 
        isAuthenticated: false 
      }),
      
      // Update user data
      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData }
      }))
    }),
    {
      name: 'auth-storage', // name of the item in localStorage
    }
  )
);

export default useAuthStore;
