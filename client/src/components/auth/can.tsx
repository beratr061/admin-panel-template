'use client';

import { usePermission } from '@/hooks/use-permission';

export interface CanProps {
  /**
   * Permission(s) required to render children.
   * If array is provided, user must have ALL permissions (AND logic).
   */
  permission: string | string[];
  /**
   * Content to render when user has the required permission(s).
   */
  children: React.ReactNode;
  /**
   * Optional fallback content to render when user lacks permission.
   * If not provided, nothing is rendered (element is hidden per Requirement 19.5).
   */
  fallback?: React.ReactNode;
  /**
   * If true, requires ANY of the permissions (OR logic).
   * Default is false (requires ALL permissions).
   */
  matchAny?: boolean;
}

/**
 * Permission-based rendering component.
 * Conditionally renders children based on user permissions.
 * 
 * Per Requirement 19.5: Restricted actions are fully hidden, not disabled.
 * 
 * Usage:
 * ```tsx
 * <Can permission="users.create">
 *   <CreateUserButton />
 * </Can>
 * 
 * <Can permission={['users.update', 'users.delete']} matchAny>
 *   <UserActionsMenu />
 * </Can>
 * 
 * <Can permission="admin.access" fallback={<AccessDenied />}>
 *   <AdminPanel />
 * </Can>
 * ```
 * 
 * @validates Requirements 19.4
 */
export function Can({
  permission,
  children,
  fallback = null,
  matchAny = false,
}: CanProps): React.ReactNode {
  const { can, canAny, isLoading } = usePermission();

  // While loading, don't render anything to prevent flash of content
  if (isLoading) {
    return null;
  }

  const hasPermission = matchAny
    ? canAny(Array.isArray(permission) ? permission : [permission])
    : can(permission);

  if (hasPermission) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
