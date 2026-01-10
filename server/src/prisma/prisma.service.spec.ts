import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import * as fc from 'fast-check';

/**
 * Property Test: Role-Permission Mappings Persist
 * Feature: admin-panel-template, Property 32: Role-Permission Mappings Persist
 * Validates: Requirements 17.5
 *
 * For any role-permission assignment, after save, the mapping should be retrievable from database.
 *
 * NOTE: This test requires a running PostgreSQL database.
 * Set DATABASE_URL environment variable to run this test.
 */
describe('PrismaService - Role-Permission Mappings', () => {
  let prismaService: PrismaService;
  let isDbConnected = false;

  beforeAll(async () => {
    // Skip if no DATABASE_URL is set or if it's the default placeholder
    if (
      !process.env.DATABASE_URL ||
      process.env.DATABASE_URL.includes('user:password@localhost')
    ) {
      console.log(
        'Skipping database tests: DATABASE_URL not configured or using placeholder',
      );
      return;
    }

    try {
      const module: TestingModule = await Test.createTestingModule({
        providers: [PrismaService],
      }).compile();

      prismaService = module.get<PrismaService>(PrismaService);
      await prismaService.onModuleInit();
      isDbConnected = true;
    } catch (error) {
      console.log('Skipping database tests: Could not connect to database');
      isDbConnected = false;
    }
  });

  afterAll(async () => {
    if (prismaService && isDbConnected) {
      await prismaService.onModuleDestroy();
    }
  });

  // Helper to generate valid role names
  const roleNameArb = fc
    .string({ minLength: 3, maxLength: 50 })
    .filter((s) => /^[a-zA-Z0-9_]+$/.test(s))
    .map((s) => `TEST_ROLE_${s}_${Date.now()}`);

  // Helper to generate valid resource names
  const resourceArb = fc.constantFrom(
    'users',
    'roles',
    'dashboard',
    'settings',
    'reports',
    'analytics',
  );

  // Helper to generate valid action names
  const actionArb = fc.constantFrom('create', 'read', 'update', 'delete');

  describe('Property 32: Role-Permission Mappings Persist', () => {
    it('should persist role-permission mappings and retrieve them correctly', async () => {
      if (!isDbConnected) {
        console.log('Test skipped: No database connection');
        return;
      }

      await fc.assert(
        fc.asyncProperty(
          roleNameArb,
          fc.array(fc.tuple(resourceArb, actionArb), {
            minLength: 1,
            maxLength: 5,
          }),
          async (roleName, permissionPairs) => {
            // Create unique permission pairs (no duplicates)
            const uniquePairs = [
              ...new Map(
                permissionPairs.map((p) => [`${p[0]}_${p[1]}`, p]),
              ).values(),
            ];

            // Create the role
            const role = await prismaService.role.create({
              data: {
                name: roleName,
                description: `Test role for property testing`,
                isSystem: false,
              },
            });

            try {
              // Create permissions and assign them to the role
              const createdPermissions: string[] = [];
              for (const [resource, action] of uniquePairs) {
                // Upsert permission (may already exist)
                const permission = await prismaService.permission.upsert({
                  where: {
                    resource_action: { resource, action },
                  },
                  update: {},
                  create: {
                    resource,
                    action,
                    description: `${action} ${resource}`,
                  },
                });

                // Create role-permission mapping
                await prismaService.rolePermission.create({
                  data: {
                    roleId: role.id,
                    permissionId: permission.id,
                  },
                });

                createdPermissions.push(permission.id);
              }

              // Retrieve the role with its permissions
              const retrievedRole = await prismaService.role.findUnique({
                where: { id: role.id },
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              });

              // Verify the role exists
              expect(retrievedRole).not.toBeNull();
              expect(retrievedRole?.name).toBe(roleName);

              // Verify all permissions are mapped
              const retrievedPermissionIds =
                retrievedRole?.permissions.map((rp) => rp.permissionId) || [];
              expect(retrievedPermissionIds.length).toBe(
                createdPermissions.length,
              );

              // Verify each permission is correctly mapped
              for (const permId of createdPermissions) {
                expect(retrievedPermissionIds).toContain(permId);
              }

              // Verify round-trip: permissions can be queried back
              for (const [resource, action] of uniquePairs) {
                const rolePermissions =
                  await prismaService.rolePermission.findMany({
                    where: {
                      roleId: role.id,
                      permission: {
                        resource,
                        action,
                      },
                    },
                  });
                expect(rolePermissions.length).toBe(1);
              }
            } finally {
              // Cleanup: delete the test role (cascades to role-permissions)
              await prismaService.role.delete({
                where: { id: role.id },
              });
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
