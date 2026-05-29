import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      // Pass userData (id, name, role, branchName, branchId) and the JWT
      login: (userData, token) => {
        set({ 
          user: userData, 
          token: token, 
          isAuthenticated: true 
        });
      },

      // Function to update the active branch in the store
      setBranch: (branchData) => {
        set((state) => ({
          user: state.user ? { 
            ...state.user, 
            branchId: branchData.branchId,
            branchName: branchData.branchName 
          } : null
        }));
      },

      /**
       * ✅ LIMITATION HELPERS
       * Use these to hide/show UI elements based on the backend roles
       */
      
      // Checks for a specific single role (e.g., 'ADMIN')
      hasRole: (role) => {
        const user = get().user;
        return user?.role === role;
      },

      // Checks if user belongs to any of the allowed roles (e.g., ['ADMIN', 'MANAGER'])
      hasAnyRole: (roles) => {
        const user = get().user;
        return user?.role && roles.includes(user.role);
      },
      
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        console.log("User logged out of Minamo System");
      },
    }),
    { 
      name: 'pharmacy-auth-storage',
      // ✅ Changed from localStorage to sessionStorage to trigger automatic logout on refresh
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

export default useAuthStore;