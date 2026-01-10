/**
 * Property Test: Protected Routes Redirect Unauthenticated Users
 * Feature: admin-panel-template, Property 26: Protected Routes Redirect Unauthenticated Users
 * Validates: Requirements 8.8, 19.2
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import { AuthGuard } from './auth-guard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock next/navigation
const mockPush = vi.fn();
const mockPathname = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
  }),
  usePathname: () => mockPathname(),
}));

// Mock the useAuth hook
const mockUseAuth = vi.fn();

vi.mock('@/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Helper to create a fresh QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Helper to render AuthGuard with providers
const renderAuthGuard = (
  children: React.ReactNode = <div>Protected Content</div>,
  requiredPermissions?: string[]
) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <AuthGuard requiredPermissions={requiredPermissions}>{children}</AuthGuard>
    </QueryClientProvider>
  );
};

describe('AuthGuard - Property Tests', () => {
  beforeEach(() => {
    cleanup();
    mockPush.mockClear();
    mockPathname.mockClear();
    mockUseAuth.mockClear();
  });

  /**
   * Property 26: Protected Routes Redirect Unauthenticated Users
   * For any protected frontend route, unauthenticated access should redirect to login page.
   */
  it('Property 26: For any protected route path, unauthenticated users should be redirected to login', async () => {
    // Generate random route paths
    const routePathArbitrary = fc
      .array(fc.stringMatching(/^[a-z][a-z0-9-]{0,10}$/), { minLength: 1, maxLength: 4 })
      .map((segments) => '/' + segments.join('/'));

    await fc.assert(
      fc.asyncProperty(routePathArbitrary, async (pathname) => {
        cleanup();
        mockPush.mockClear();
        mockPathname.mockReturnValue(pathname);

        // Mock unauthenticated state
        mockUseAuth.mockReturnValue({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          permissions: [],
          can: () => false,
          canAny: () => false,
        });

        renderAuthGuard();

        // Wait for redirect to be called
        await waitFor(() => {
          expect(mockPush).toHaveBeenCalled();
        });

        // Verify redirect includes the callback URL
        const redirectCall = mockPush.mock.calls[0][0];
        expect(redirectCall).toContain('/login');
        expect(redirectCall).toContain('callbackUrl');
        expect(redirectCall).toContain(encodeURIComponent(pathname));
      }),
      { numRuns: 100 }
    );
  });

  it('Property 26: For any protected route, authenticated users should see the content', async () => {
    // Generate random route paths
    const routePathArbitrary = fc
      .array(fc.stringMatching(/^[a-z][a-z0-9-]{0,10}$/), { minLength: 1, maxLength: 4 })
      .map((segments) => '/' + segments.join('/'));

    await fc.assert(
      fc.asyncProperty(routePathArbitrary, async (pathname) => {
        cleanup();
        mockPush.mockClear();
        mockPathname.mockReturnValue(pathname);

        // Mock authenticated state
        mockUseAuth.mockReturnValue({
          isAuthenticated: true,
          isLoading: false,
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          permissions: [],
          can: () => true,
          canAny: () => true,
        });

        renderAuthGuard(<div data-testid="protected-content">Protected Content</div>);

        // Wait for content to be rendered
        await waitFor(() => {
          expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        });

        // Should not redirect
        expect(mockPush).not.toHaveBeenCalled();
      }),
      { numRuns: 100 }
    );
  });

  it('Property 26: For any permission-protected route, users without permission should see access denied', async () => {
    // Generate random permissions
    const permissionArbitrary = fc
      .tuple(
        fc.stringMatching(/^[a-z]{3,10}$/),
        fc.constantFrom('create', 'read', 'update', 'delete')
      )
      .map(([resource, action]) => `${resource}.${action}`);

    await fc.assert(
      fc.asyncProperty(
        fc.array(permissionArbitrary, { minLength: 1, maxLength: 3 }),
        async (requiredPermissions) => {
          cleanup();
          mockPush.mockClear();
          mockPathname.mockReturnValue('/dashboard');

          // Mock authenticated but without required permissions
          mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', email: 'test@example.com', name: 'Test User', roles: [] },
            permissions: [], // No permissions
            can: () => false,
            canAny: () => false,
          });

          renderAuthGuard(
            <div data-testid="protected-content">Protected Content</div>,
            requiredPermissions
          );

          // Wait for access denied message
          await waitFor(() => {
            expect(screen.getByText(/erişim engellendi/i)).toBeInTheDocument();
          });

          // Protected content should not be visible
          expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 26: For any permission-protected route, users with required permissions should see content', async () => {
    // Generate random permissions
    const permissionArbitrary = fc
      .tuple(
        fc.stringMatching(/^[a-z]{3,10}$/),
        fc.constantFrom('create', 'read', 'update', 'delete')
      )
      .map(([resource, action]) => `${resource}.${action}`);

    await fc.assert(
      fc.asyncProperty(
        fc.array(permissionArbitrary, { minLength: 1, maxLength: 3 }),
        async (requiredPermissions) => {
          cleanup();
          mockPush.mockClear();
          mockPathname.mockReturnValue('/dashboard');

          // Mock authenticated with required permissions
          mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', email: 'test@example.com', name: 'Test User', roles: [] },
            permissions: requiredPermissions,
            can: (perms: string | string[]) => {
              const permArray = Array.isArray(perms) ? perms : [perms];
              return permArray.every((p) => requiredPermissions.includes(p));
            },
            canAny: (perms: string[]) => perms.some((p) => requiredPermissions.includes(p)),
          });

          renderAuthGuard(
            <div data-testid="protected-content">Protected Content</div>,
            requiredPermissions
          );

          // Wait for content to be rendered
          await waitFor(() => {
            expect(screen.getByTestId('protected-content')).toBeInTheDocument();
          });

          // Should not redirect
          expect(mockPush).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Unit tests for edge cases
   */
  it('Shows loading state while checking authentication', () => {
    mockPathname.mockReturnValue('/dashboard');
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      permissions: [],
      can: () => false,
      canAny: () => false,
    });

    renderAuthGuard();

    // Should show loading indicator (Loader2 component)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('SUPER_ADMIN bypasses permission checks', async () => {
    mockPathname.mockReturnValue('/admin/roles');
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: {
        id: '1',
        email: 'admin@example.com',
        name: 'Super Admin',
        roles: [{ name: 'SUPER_ADMIN' }],
      },
      permissions: [],
      can: () => true, // SUPER_ADMIN always returns true
      canAny: () => true,
    });

    renderAuthGuard(
      <div data-testid="admin-content">Admin Content</div>,
      ['roles.manage', 'users.delete']
    );

    await waitFor(() => {
      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    });
  });
});
