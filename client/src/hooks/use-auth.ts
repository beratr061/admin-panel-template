'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import apiClient, { setAccessToken, getAccessToken } from '@/lib/api-client';
import type { User } from '@admin-panel/shared';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    expiresIn: number;
  };
}

// Query keys for auth-related queries
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  permissions: () => [...authKeys.all, 'permissions'] as const,
};

// Fetch current user
async function fetchCurrentUser(): Promise<User | null> {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  } catch {
    return null;
  }
}

// Fetch user permissions
async function fetchPermissions(): Promise<string[]> {
  const token = getAccessToken();
  if (!token) return [];

  try {
    const response = await apiClient.get<{ permissions: string[] }>('/auth/permissions');
    return response.data.permissions;
  } catch {
    return [];
  }
}

export function useAuth() {
  const queryClient = useQueryClient();

  // Current user query
  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: authKeys.user(),
    queryFn: fetchCurrentUser,
    staleTime: Infinity, // User data doesn't go stale until explicitly invalidated
    retry: false,
  });

  // Permissions query - cached to avoid redundant API calls (Requirement 21.2)
  const {
    data: permissions = [],
    isLoading: isPermissionsLoading,
  } = useQuery({
    queryKey: authKeys.permissions(),
    queryFn: fetchPermissions,
    enabled: !!user, // Only fetch permissions when user is authenticated
    staleTime: Infinity, // Permissions don't go stale until explicitly invalidated
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.tokens.accessToken);
      queryClient.setQueryData(authKeys.user(), data.user);
      // Invalidate permissions to fetch fresh data
      queryClient.invalidateQueries({ queryKey: authKeys.permissions() });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.tokens.accessToken);
      queryClient.setQueryData(authKeys.user(), data.user);
      queryClient.invalidateQueries({ queryKey: authKeys.permissions() });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      await apiClient.post('/auth/logout');
    },
    onSettled: () => {
      setAccessToken(null);
      queryClient.setQueryData(authKeys.user(), null);
      queryClient.setQueryData(authKeys.permissions(), []);
      queryClient.clear();
    },
  });

  // Check if user has a specific permission
  const can = useCallback(
    (permission: string | string[]): boolean => {
      if (!user) return false;

      // SUPER_ADMIN bypasses all permission checks
      const isSuperAdmin = user.roles?.some((role) => role.name === 'SUPER_ADMIN');
      if (isSuperAdmin) return true;

      const permissionArray = Array.isArray(permission) ? permission : [permission];
      return permissionArray.every((p) => permissions.includes(p));
    },
    [user, permissions]
  );

  // Check if user has any of the specified permissions
  const canAny = useCallback(
    (permissionList: string[]): boolean => {
      if (!user) return false;

      // SUPER_ADMIN bypasses all permission checks
      const isSuperAdmin = user.roles?.some((role) => role.name === 'SUPER_ADMIN');
      if (isSuperAdmin) return true;

      return permissionList.some((p) => permissions.includes(p));
    },
    [user, permissions]
  );

  const isAuthenticated = useMemo(() => !!user, [user]);
  const isLoading = isUserLoading || isPermissionsLoading;

  return {
    user,
    permissions,
    isAuthenticated,
    isLoading,
    can,
    canAny,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    refetchUser,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
