import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all available permissions
   */
  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  }

  /**
   * Get permissions grouped by resource
   */
  async findAllGrouped() {
    const permissions = await this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });

    const grouped: Record<string, typeof permissions> = {};
    for (const permission of permissions) {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    }

    return grouped;
  }

  /**
   * Get a single permission by ID
   */
  async findOne(id: string) {
    return this.prisma.permission.findUnique({
      where: { id },
    });
  }

  /**
   * Get effective permissions for a user based on their roles
   */
  async getEffectivePermissions(userId: string): Promise<string[]> {
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!userWithRoles) {
      return [];
    }

    // Collect all unique permissions from all roles
    const permissionSet = new Set<string>();
    for (const userRole of userWithRoles.roles) {
      for (const rolePermission of userRole.role.permissions) {
        const permissionKey = `${rolePermission.permission.resource}.${rolePermission.permission.action}`;
        permissionSet.add(permissionKey);
      }
    }

    return Array.from(permissionSet);
  }

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const userWithRoles = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!userWithRoles) {
      return false;
    }

    // SUPER_ADMIN bypass
    const isSuperAdmin = userWithRoles.roles.some((ur) => ur.role.name === 'SUPER_ADMIN');
    if (isSuperAdmin) {
      return true;
    }

    const effectivePermissions = await this.getEffectivePermissions(userId);
    return effectivePermissions.includes(permission);
  }
}
