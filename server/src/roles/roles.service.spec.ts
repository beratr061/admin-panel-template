import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import * as fc from 'fast-check';
import { RolesService } from './roles.service';
import { PrismaService } from '../prisma';

// Mock PrismaService
const mockPrismaService = {
  role: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  permission: {
    findMany: jest.fn(),
  },
  rolePermission: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  userRole: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn((operations) => Promise.all(operations)),
};

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('SUPER_ADMIN CRUD operations', () => {
    /**
     * Feature: admin-panel-template, Property 30: SUPER_ADMIN Can CRUD Roles
     * *For any* role create/update/delete operation by SUPER_ADMIN user, the operation should succeed.
     * **Validates: Requirements 16.2**
     */
    it('Property 30: SUPER_ADMIN can CRUD roles', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate role name
          fc.string({ minLength: 2, maxLength: 50 }).filter((s) => /^[a-zA-Z0-9_]+$/.test(s) && s.trim().length >= 2),
          // Generate role description
          fc.option(fc.string({ minLength: 0, maxLength: 200 })),
          async (roleName, roleDescription) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();

            const roleId = `role-${Date.now()}`;
            const createdAt = new Date();
            const updatedAt = new Date();

            // Test CREATE operation
            mockPrismaService.role.findUnique.mockResolvedValueOnce(null); // No existing role with same name
            mockPrismaService.role.create.mockResolvedValue({
              id: roleId,
              name: roleName,
              description: roleDescription ?? null,
              isSystem: false,
              createdAt,
              updatedAt,
              permissions: [],
            });

            const createResult = await service.create({
              name: roleName,
              description: roleDescription ?? undefined,
            });

            expect(createResult.id).toBe(roleId);
            expect(createResult.name).toBe(roleName);
            expect(mockPrismaService.role.create).toHaveBeenCalled();

            // Test READ operation
            mockPrismaService.role.findUnique.mockResolvedValueOnce({
              id: roleId,
              name: roleName,
              description: roleDescription ?? null,
              isSystem: false,
              createdAt,
              updatedAt,
              permissions: [],
              _count: { users: 0 },
            });

            const readResult = await service.findOne(roleId);
            expect(readResult.id).toBe(roleId);
            expect(readResult.name).toBe(roleName);

            // Test UPDATE operation
            const updatedName = `${roleName}_updated`;
            mockPrismaService.role.findUnique
              .mockResolvedValueOnce({
                id: roleId,
                name: roleName,
                isSystem: false,
              })
              .mockResolvedValueOnce(null); // No conflict with new name

            mockPrismaService.role.update.mockResolvedValue({
              id: roleId,
              name: updatedName,
              description: roleDescription ?? null,
              isSystem: false,
              createdAt,
              updatedAt: new Date(),
              permissions: [],
            });

            const updateResult = await service.update(roleId, { name: updatedName });
            expect(updateResult.name).toBe(updatedName);
            expect(mockPrismaService.role.update).toHaveBeenCalled();

            // Test DELETE operation
            mockPrismaService.role.findUnique.mockResolvedValueOnce({
              id: roleId,
              name: updatedName,
              isSystem: false,
              _count: { users: 0 },
            });
            mockPrismaService.role.delete.mockResolvedValue({});

            const deleteResult = await service.remove(roleId);
            expect(deleteResult.message).toBe('Rol başarıyla silindi');
            expect(mockPrismaService.role.delete).toHaveBeenCalledWith({ where: { id: roleId } });
          },
        ),
        { numRuns: 100 },
      );
    }, 60000);
  });

  describe('Role creation', () => {
    it('should throw ConflictException when role name already exists', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue({ id: 'existing-role' });

      await expect(
        service.create({ name: 'EXISTING_ROLE' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when invalid permission IDs provided', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue(null);
      mockPrismaService.permission.findMany.mockResolvedValue([{ id: 'perm-1' }]); // Only 1 found

      await expect(
        service.create({
          name: 'NEW_ROLE',
          permissionIds: ['perm-1', 'perm-2', 'perm-3'], // 3 requested
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Role update', () => {
    it('should throw NotFoundException when role does not exist', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'NEW_NAME' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when trying to rename system role', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 'system-role-id',
        name: 'SUPER_ADMIN',
        isSystem: true,
      });

      await expect(
        service.update('system-role-id', { name: 'RENAMED_ADMIN' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Role deletion', () => {
    it('should throw NotFoundException when role does not exist', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when trying to delete system role', async () => {
      mockPrismaService.role.findUnique.mockResolvedValue({
        id: 'system-role-id',
        name: 'SUPER_ADMIN',
        isSystem: true,
        _count: { users: 0 },
      });

      await expect(service.remove('system-role-id')).rejects.toThrow(ForbiddenException);
    });

    /**
     * Feature: admin-panel-template, Property 33: Role Deletion Handles Affected Users
     * *For any* role deletion, users with that role should either have the role removed 
     * or be assigned default role, without breaking.
     * **Validates: Requirements 17.6**
     */
    it('Property 33: Role deletion handles affected users', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate role name
          fc.string({ minLength: 2, maxLength: 50 }).filter((s) => /^[a-zA-Z0-9_]+$/.test(s) && s.trim().length >= 2),
          // Generate number of affected users (0 to 10)
          fc.integer({ min: 0, max: 10 }),
          async (roleName, userCount) => {
            // Reset mocks for each iteration
            jest.clearAllMocks();

            const roleId = `role-${Date.now()}`;
            const viewerRoleId = 'viewer-role-id';

            // Mock the role to be deleted (non-system role)
            // First call: findUnique for the role being deleted
            // Second call: findUnique for VIEWER role (only if userCount > 0)
            mockPrismaService.role.findUnique.mockImplementation(({ where }) => {
              if (where.id === roleId) {
                return Promise.resolve({
                  id: roleId,
                  name: roleName,
                  isSystem: false,
                  _count: { users: userCount },
                });
              }
              if (where.name === 'VIEWER') {
                return Promise.resolve({
                  id: viewerRoleId,
                  name: 'VIEWER',
                  isSystem: true,
                });
              }
              return Promise.resolve(null);
            });

            // Generate mock user roles
            const mockUserRoles = Array.from({ length: userCount }, (_, i) => ({
              userId: `user-${i}`,
              roleId,
            }));

            mockPrismaService.userRole.findMany.mockResolvedValue(mockUserRoles);

            // For each user, mock their role count (simulate they only have this role)
            mockPrismaService.userRole.count.mockResolvedValue(1);
            mockPrismaService.userRole.create.mockResolvedValue({});
            mockPrismaService.role.delete.mockResolvedValue({});

            // Execute deletion
            const result = await service.remove(roleId);

            // Verify: Deletion should succeed
            expect(result.message).toBe('Rol başarıyla silindi');
            expect(mockPrismaService.role.delete).toHaveBeenCalledWith({ where: { id: roleId } });

            // Verify: If there were affected users, VIEWER role should be assigned
            if (userCount > 0) {
              // Should have checked each user's role count
              expect(mockPrismaService.userRole.count).toHaveBeenCalledTimes(userCount);

              // Should have assigned VIEWER role to users who only had this role
              expect(mockPrismaService.userRole.create).toHaveBeenCalledTimes(userCount);
            }
          },
        ),
        { numRuns: 100 },
      );
    }, 60000);
  });
});
