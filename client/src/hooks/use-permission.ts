'use client';

import { useAuth } from './use-auth';

export interface UsePermissionReturn {
  can: (permission: string | string[]) => boolean;
  canAny: (permissions: string[]) => boolean;
  permissions: string[];
  isLoading: boolean;
}

/**
 * Hook for checking user permissions
 * Provides a simple interface for permission-based UI rendering
 * 
 * Usage:
 * const { can, permissions } = usePermission();
 * if (can('users.create')) { ... }
 * if (can(['users.create', 'users.update'])) { ... } // requires ALL permissions
 */
export function usePermission(): UsePermissionReturn {
  const { can, canAny, permissions, isLoading } = useAuth();

  return {
    can,
    canAny,
    permissions,
    isLoading,
  };
}
