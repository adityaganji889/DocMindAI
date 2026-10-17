import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserDto } from '../types';
import { authApi } from '../services/authApi';
import { conversationApi } from '../services/conversationApi';
import { useDocumentStore } from './documentStore';
import { useConversationStore } from './conversationStore';

interface AuthState {
  user: UserDto | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<UserDto>;
  logout: () => void;
  //Forgot, Reset Password Functionalities changes starts
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (
    otp: Number,
    email: string,
    password: string,
    repeatPassword: string
  ) => Promise<void>;
  //Forgot, Reset Password Functionalities changes ends
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (username: string, password: string) => {
        console.log('[AUTH 1] Login function called');
        set({ isLoading: true });
        try {
          console.log('[AUTH 2] Sending API request');
          const response = await authApi.login({ username, password });
          console.log('[AUTH 3] API response received:', response);
          set({
            user: response.user,
            token: response.accessToken,
            isLoading: false,
          });
          console.log('[AUTH 4] Zustand state:', useAuthStore.getState());
        } catch (error) {
          console.error('[AUTH ERROR]', error);
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const userDto = await authApi.register({ username, email, password });
          set({ isLoading: false });
          return userDto;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        const currentUser = get().user;
        if (currentUser?.id) {
          conversationApi.clearUserData(currentUser.id);
        }
        // Also clear any docmind:* keys in localStorage
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('docmind:') || key.startsWith('docmind-chats-') || key.startsWith('docmind-pref-'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((k) => localStorage.removeItem(k));
        } catch (e) {
          console.error('Error clearing localStorage on logout', e);
        }

        // Reset stores
        useDocumentStore.getState().reset();
        useConversationStore.getState().reset();

        set({ user: null, token: null, isLoading: false });
      },
      //Forgot, Reset Password Functionalities changes starts
      forgotPassword: async (email: string) => {
        set({ isLoading: true });

        try {
          await authApi.forgotPassword(email);
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      resetPassword: async (
        otp: Number,
        email: string,
        password: string,
        repeatPassword: string
      ) => {
        set({ isLoading: true });

        try {
          await authApi.resetPassword(otp,email, {
            password,
            repeatPassword,
          });

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      //Forgot, Reset Password Functionalities changes ends
    }),
    {
      name: 'docmind-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  )
);

