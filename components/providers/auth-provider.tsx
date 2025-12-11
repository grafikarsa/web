'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { authApi, profileApi } from '@/lib/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, setUser, setLoading, logout } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      if (accessToken) {
        try {
          const response = await profileApi.getMe();
          if (response.success && response.data) {
            setUser(response.data);
          }
        } catch {
          // Token invalid, try refresh
          try {
            const refreshResponse = await authApi.refresh();
            if (refreshResponse.success && refreshResponse.data) {
              useAuthStore.getState().setAccessToken(refreshResponse.data.access_token);
              const meResponse = await profileApi.getMe();
              if (meResponse.success && meResponse.data) {
                setUser(meResponse.data);
              }
            }
          } catch {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [accessToken, setUser, setLoading, logout]);

  return <>{children}</>;
}
