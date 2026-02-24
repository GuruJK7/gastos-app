// src/store/auth.store.js
import { useAuth } from '../app/providers/AuthProvider';

export function useAuthStore() {
  return useAuth();
}