import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as fc from 'fast-check';
import { PermissionsGuard } from './permissions.guard';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  const createMockExecutionContext = (
    user: { roles?: string[]; permissions?: string[] } | null,
  ): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    } as unknown as ExecutionContext;
  };

  /**
   * Feature: admin-panel-template, Property 25: Protected Endpoints Return 403 Without Permission
   * *For any* protected API endpoint, requests without required permissions should receive 403 Forbidden response.
   * **Validates: Requirements 8.7, 16.6, 20.3, 20.4, 22.3**
   */
  describe('Property 25: Protected endpoints return 403 without permission', () => {
    it('should return 403 for any user without required permissions', () => {
      // Generate permission strings in resource.action format
      const permissionArb = fc.tuple(
        fc.stringMatching(/^[a-z]+$/),
        fc.constantFrom('create', 'read', 'update', 'delete'),
      ).map(([resource, action]) => `${resource}.${action}`);

      fc.assert(
        fc.property(
          // Generate 1-3 required permissions
          fc.array(permissionArb, { minLength: 1, maxLength: 3 }),
          // Generate 0-5 user permissions (different from required)
          fc.array(permissionArb, { minLength: 0, maxLength: 5 }),
          (requiredPermissions, userPermissions) => {
            // Ensure user doesn't have ALL required permissions
            const hasAllRequired = requiredPermissions.every((p) =>
              userPermissions.includes(p),
            );

            // Skip if user happens to have all required permissions
            if (hasAllRequired) {
              return true;
            }

            // Mock reflector to return required permissions
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPermissions);

            // Create user without SUPER_ADMIN role
            const context = createMockExecutionContext({
              roles: ['VIEWER'],
              permissions: userPermissions,
            });

            // Should throw ForbiddenException
            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return 403 when user has no permissions at all', () => {
      const permissionArb = fc.tuple(
        fc.stringMatching(/^[a-z]+$/),
        fc.constantFrom('create', 'read', 'update', 'delete'),
      ).map(([resource, action]) => `${resource}.${action}`);

      fc.assert(
        fc.property(
          fc.array(permissionArb, { minLength: 1, maxLength: 3 }),
          (requiredPermissions) => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPermissions);

            // User with no permissions
            const context = createMockExecutionContext({
              roles: ['VIEWER'],
              permissions: [],
            });

            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return 403 when user object is null', () => {
      const permissionArb = fc.tuple(
        fc.stringMatching(/^[a-z]+$/),
        fc.constantFrom('create', 'read', 'update', 'delete'),
      ).map(([resource, action]) => `${resource}.${action}`);

      fc.assert(
        fc.property(
          fc.array(permissionArb, { minLength: 1, maxLength: 3 }),
          (requiredPermissions) => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPermissions);

            // No user (unauthenticated)
            const context = createMockExecutionContext(null);

            expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Feature: admin-panel-template, Property 31: SUPER_ADMIN Bypasses Permission Checks
   * *For any* protected endpoint accessed by SUPER_ADMIN user, access should be granted regardless of specific permissions.
   * **Validates: Requirements 16.7**
   */
  describe('Property 31: SUPER_ADMIN bypasses permission checks', () => {
    it('should allow SUPER_ADMIN access regardless of required permissions', () => {
      // Generate permission strings in resource.action format
      const permissionArb = fc.tuple(
        fc.stringMatching(/^[a-z]+$/),
        fc.constantFrom('create', 'read', 'update', 'delete'),
      ).map(([resource, action]) => `${resource}.${action}`);

      fc.assert(
        fc.property(
          // Generate any number of required permissions (1-5)
          fc.array(permissionArb, { minLength: 1, maxLength: 5 }),
          // SUPER_ADMIN may have any permissions (including none)
          fc.array(permissionArb, { minLength: 0, maxLength: 3 }),
          (requiredPermissions, userPermissions) => {
            // Mock reflector to return required permissions
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPermissions);

            // Create SUPER_ADMIN user (may or may not have the specific permissions)
            const context = createMockExecutionContext({
              roles: ['SUPER_ADMIN'],
              permissions: userPermissions,
            });

            // SUPER_ADMIN should always be granted access
            expect(guard.canActivate(context)).toBe(true);
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should allow SUPER_ADMIN with no permissions at all', () => {
      const permissionArb = fc.tuple(
        fc.stringMatching(/^[a-z]+$/),
        fc.constantFrom('create', 'read', 'update', 'delete'),
      ).map(([resource, action]) => `${resource}.${action}`);

      fc.assert(
        fc.property(
          fc.array(permissionArb, { minLength: 1, maxLength: 5 }),
          (requiredPermissions) => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPermissions);

            // SUPER_ADMIN with empty permissions array
            const context = createMockExecutionContext({
              roles: ['SUPER_ADMIN'],
              permissions: [],
            });

            expect(guard.canActivate(context)).toBe(true);
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should allow SUPER_ADMIN even with other roles', () => {
      const permissionArb = fc.tuple(
        fc.stringMatching(/^[a-z]+$/),
        fc.constantFrom('create', 'read', 'update', 'delete'),
      ).map(([resource, action]) => `${resource}.${action}`);

      const roleArb = fc.constantFrom('VIEWER', 'EDITOR', 'ADMIN', 'MODERATOR');

      fc.assert(
        fc.property(
          fc.array(permissionArb, { minLength: 1, maxLength: 5 }),
          fc.array(roleArb, { minLength: 0, maxLength: 3 }),
          (requiredPermissions, otherRoles) => {
            jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPermissions);

            // SUPER_ADMIN with additional roles
            const context = createMockExecutionContext({
              roles: ['SUPER_ADMIN', ...otherRoles],
              permissions: [],
            });

            expect(guard.canActivate(context)).toBe(true);
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  describe('Edge cases', () => {
    it('should allow access when no permissions are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const context = createMockExecutionContext({
        roles: ['VIEWER'],
        permissions: [],
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when required permissions array is empty', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

      const context = createMockExecutionContext({
        roles: ['VIEWER'],
        permissions: [],
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has all required permissions', () => {
      const requiredPermissions = ['users.read', 'users.create'];
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredPermissions);

      const context = createMockExecutionContext({
        roles: ['ADMIN'],
        permissions: ['users.read', 'users.create', 'users.delete'],
      });

      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
