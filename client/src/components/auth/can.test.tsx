/**
 * Property Test: UI Elements Visibility Matches Permissions
 * Feature: admin-panel-template, Property 35: UI Elements Visibility Matches Permissions
 * Validates: Requirements 19.1, 19.3
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { Can } from './can';

// Mock the usePermission hook
const mockUsePermission = vi.fn();

vi.mock('@/hooks/use-permission', () => ({
  usePermission: () => mockUsePermission(),
}));

describe('Can Component - Property Tests', () => {
  beforeEach(() => {
    cleanup();
    mockUsePermission.mockClear();
  });

  /**
   * Property 35: UI Elements Visibility Matches Permissions
   * For any permission-gated UI element, visibility should match whether user has the required permission.
   */
  it('Property 35: For any single permission, element visibility matches permission state', () => {
    // Generate random permission strings in resource.action format
    const permissionArbitrary = fc
      .tuple(
        fc.stringMatching(/^[a-z]{3,10}$/),
        fc.constantFrom('create', 'read', 'update', 'delete', 'manage')
      )
      .map(([resource, action]) => `${resource}.${action}`);

    fc.assert(
      fc.property(
        permissionArbitrary,
        fc.boolean(), // hasPermission
        (permission, hasPermission) => {
          cleanup();

          mockUsePermission.mockReturnValue({
            can: (p: string | string[]) => {
              const perms = Array.isArray(p) ? p : [p];
              return hasPermission && perms.includes(permission);
            },
            canAny: (perms: string[]) => hasPermission && perms.includes(permission),
            permissions: hasPermission ? [permission] : [],
            isLoading: false,
          });

          render(
            <Can permission={permission}>
              <button data-testid="protected-element">Protected Action</button>
            </Can>
          );

          const element = screen.queryByTestId('protected-element');

          // Element visibility should match permission state
          if (hasPermission) {
            expect(element).toBeInTheDocument();
          } else {
            expect(element).not.toBeInTheDocument();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 35: For any array of permissions (AND logic), element visible only when ALL permissions present', () => {
    const permissionArbitrary = fc
      .tuple(
        fc.stringMatching(/^[a-z]{3,10}$/),
        fc.constantFrom('create', 'read', 'update', 'delete')
      )
      .map(([resource, action]) => `${resource}.${action}`);

    fc.assert(
      fc.property(
        fc.array(permissionArbitrary, { minLength: 1, maxLength: 4 }),
        fc.array(permissionArbitrary, { minLength: 0, maxLength: 4 }),
        (requiredPermissions, userPermissions) => {
          cleanup();

          // Deduplicate permissions
          const uniqueRequired = [...new Set(requiredPermissions)];
          const uniqueUser = [...new Set(userPermissions)];

          const hasAllPermissions = uniqueRequired.every((p) =>
            uniqueUser.includes(p)
          );

          mockUsePermission.mockReturnValue({
            can: (p: string | string[]) => {
              const perms = Array.isArray(p) ? p : [p];
              return perms.every((perm) => uniqueUser.includes(perm));
            },
            canAny: (perms: string[]) =>
              perms.some((p) => uniqueUser.includes(p)),
            permissions: uniqueUser,
            isLoading: false,
          });

          render(
            <Can permission={uniqueRequired}>
              <div data-testid="protected-element">Protected Content</div>
            </Can>
          );

          const element = screen.queryByTestId('protected-element');

          if (hasAllPermissions) {
            expect(element).toBeInTheDocument();
          } else {
            expect(element).not.toBeInTheDocument();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 35: For any permissions with matchAny (OR logic), element visible when ANY permission present', () => {
    const permissionArbitrary = fc
      .tuple(
        fc.stringMatching(/^[a-z]{3,10}$/),
        fc.constantFrom('create', 'read', 'update', 'delete')
      )
      .map(([resource, action]) => `${resource}.${action}`);

    fc.assert(
      fc.property(
        fc.array(permissionArbitrary, { minLength: 1, maxLength: 4 }),
        fc.array(permissionArbitrary, { minLength: 0, maxLength: 4 }),
        (requiredPermissions, userPermissions) => {
          cleanup();

          const uniqueRequired = [...new Set(requiredPermissions)];
          const uniqueUser = [...new Set(userPermissions)];

          const hasAnyPermission = uniqueRequired.some((p) =>
            uniqueUser.includes(p)
          );

          mockUsePermission.mockReturnValue({
            can: (p: string | string[]) => {
              const perms = Array.isArray(p) ? p : [p];
              return perms.every((perm) => uniqueUser.includes(perm));
            },
            canAny: (perms: string[]) =>
              perms.some((p) => uniqueUser.includes(p)),
            permissions: uniqueUser,
            isLoading: false,
          });

          render(
            <Can permission={uniqueRequired} matchAny>
              <div data-testid="protected-element">Protected Content</div>
            </Can>
          );

          const element = screen.queryByTestId('protected-element');

          if (hasAnyPermission) {
            expect(element).toBeInTheDocument();
          } else {
            expect(element).not.toBeInTheDocument();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 35: Fallback is rendered when user lacks permission', () => {
    const permissionArbitrary = fc
      .tuple(
        fc.stringMatching(/^[a-z]{3,10}$/),
        fc.constantFrom('create', 'read', 'update', 'delete')
      )
      .map(([resource, action]) => `${resource}.${action}`);

    fc.assert(
      fc.property(permissionArbitrary, (permission) => {
        cleanup();

        // User does not have the permission
        mockUsePermission.mockReturnValue({
          can: () => false,
          canAny: () => false,
          permissions: [],
          isLoading: false,
        });

        render(
          <Can
            permission={permission}
            fallback={<div data-testid="fallback">Access Denied</div>}
          >
            <div data-testid="protected-element">Protected Content</div>
          </Can>
        );

        // Protected element should not be visible
        expect(screen.queryByTestId('protected-element')).not.toBeInTheDocument();
        // Fallback should be visible
        expect(screen.getByTestId('fallback')).toBeInTheDocument();
      }),
      { numRuns: 100 }
    );
  });

  it('Property 35: Nothing renders during loading state', () => {
    const permissionArbitrary = fc
      .tuple(
        fc.stringMatching(/^[a-z]{3,10}$/),
        fc.constantFrom('create', 'read', 'update', 'delete')
      )
      .map(([resource, action]) => `${resource}.${action}`);

    fc.assert(
      fc.property(permissionArbitrary, (permission) => {
        cleanup();

        mockUsePermission.mockReturnValue({
          can: () => true,
          canAny: () => true,
          permissions: [permission],
          isLoading: true, // Loading state
        });

        const { container } = render(
          <Can
            permission={permission}
            fallback={<div data-testid="fallback">Loading...</div>}
          >
            <div data-testid="protected-element">Protected Content</div>
          </Can>
        );

        // Nothing should render during loading
        expect(screen.queryByTestId('protected-element')).not.toBeInTheDocument();
        expect(screen.queryByTestId('fallback')).not.toBeInTheDocument();
        expect(container.innerHTML).toBe('');
      }),
      { numRuns: 100 }
    );
  });
});
