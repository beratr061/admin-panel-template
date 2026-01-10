import { Test, TestingModule } from '@nestjs/testing';
import * as fc from 'fast-check';
import { PermissionsService } from './permissions.service';
import { PrismaService } from '../prisma';

// Mock PrismaService
const mockPrismaService = {
  permission: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
};

describe('PermissionsService', () => {
  let service: PermissionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    jest.clearAllMocks();
  });

  /**
   * Feature: admin-panel-template, Property 34: Effective Permissions Calculated from Roles
   * *For any* user with assigned roles, effective permissions should be the union of all permissions from all assigned roles.
   * **Validates: Requirements 18.2, 18.3**
   */
  describe('Property 34: Effective permissions calculated from roles', () => {
    // Arbitrary for generating permission data
    const permissionArb = fc.record({
      id: fc.uuid(),
      resource: fc.stringMatching(/^[a-z]+$/),
      action: fc.constantFrom('create', 'read', 'update', 'delete'),
      description: fc.option(fc.string(), { nil: undefined }),
    });

    // Arbitrary for generating role with permissions
    const roleWithPermissionsArb = fc.record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 20 }),
      permissions: fc.array(permissionArb, { minLength: 0, maxLength: 5 }),
    });

    it('should return union of all permissions from all assigned roles', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // userId
          fc.array(roleWithPermissionsArb, { minLength: 1, maxLength: 4 }), // roles
          async (userId, roles) => {
            // Build mock user with roles structure
            const mockUser = {
              id: userId,
              roles: roles.map((role) => ({
                role: {
                  id: role.id,
                  name: role.name,
                  permissions: role.permissions.map((p) => ({
                    permission: {
                      id: p.id,
                      resource: p.resource,
                      action: p.action,
                    },
                  })),
                },
              })),
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Calculate expected permissions (union of all role permissions)
            const expectedPermissions = new Set<string>();
            for (const role of roles) {
              for (const permission of role.permissions) {
                expectedPermissions.add(`${permission.resource}.${permission.action}`);
              }
            }

            // Get effective permissions from service
            const result = await service.getEffectivePermissions(userId);

            // Verify: result should contain exactly the union of all permissions
            expect(result.sort()).toEqual(Array.from(expectedPermissions).sort());
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should return empty array for user with no roles', async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), async (userId) => {
          const mockUser = {
            id: userId,
            roles: [],
          };

          mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

          const result = await service.getEffectivePermissions(userId);

          expect(result).toEqual([]);
          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should return empty array for non-existent user', async () => {
      await fc.assert(
        fc.asyncProperty(fc.uuid(), async (userId) => {
          mockPrismaService.user.findUnique.mockResolvedValue(null);

          const result = await service.getEffectivePermissions(userId);

          expect(result).toEqual([]);
          return true;
        }),
        { numRuns: 100 },
      );
    });

    it('should deduplicate permissions when multiple roles have same permission', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          permissionArb,
          fc.integer({ min: 2, max: 5 }),
          async (userId, sharedPermission, roleCount) => {
            // Create multiple roles that all have the same permission
            const roles = Array.from({ length: roleCount }, (_, i) => ({
              role: {
                id: `role-${i}`,
                name: `Role ${i}`,
                permissions: [
                  {
                    permission: {
                      id: sharedPermission.id,
                      resource: sharedPermission.resource,
                      action: sharedPermission.action,
                    },
                  },
                ],
              },
            }));

            const mockUser = {
              id: userId,
              roles,
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            const result = await service.getEffectivePermissions(userId);

            // Should only have one instance of the permission
            const expectedPermission = `${sharedPermission.resource}.${sharedPermission.action}`;
            expect(result).toEqual([expectedPermission]);
            expect(result.length).toBe(1);
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });

    it('should correctly merge permissions from roles with overlapping and unique permissions', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.array(permissionArb, { minLength: 1, maxLength: 3 }), // shared permissions
          fc.array(permissionArb, { minLength: 1, maxLength: 3 }), // role1 unique
          fc.array(permissionArb, { minLength: 1, maxLength: 3 }), // role2 unique
          async (userId, sharedPerms, role1UniquePerms, role2UniquePerms) => {
            const mockUser = {
              id: userId,
              roles: [
                {
                  role: {
                    id: 'role-1',
                    name: 'Role 1',
                    permissions: [...sharedPerms, ...role1UniquePerms].map((p) => ({
                      permission: {
                        id: p.id,
                        resource: p.resource,
                        action: p.action,
                      },
                    })),
                  },
                },
                {
                  role: {
                    id: 'role-2',
                    name: 'Role 2',
                    permissions: [...sharedPerms, ...role2UniquePerms].map((p) => ({
                      permission: {
                        id: p.id,
                        resource: p.resource,
                        action: p.action,
                      },
                    })),
                  },
                },
              ],
            };

            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

            // Calculate expected union
            const allPerms = [...sharedPerms, ...role1UniquePerms, ...role2UniquePerms];
            const expectedSet = new Set(allPerms.map((p) => `${p.resource}.${p.action}`));

            const result = await service.getEffectivePermissions(userId);

            // Result should be the union (deduplicated)
            expect(result.sort()).toEqual(Array.from(expectedSet).sort());
            return true;
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
