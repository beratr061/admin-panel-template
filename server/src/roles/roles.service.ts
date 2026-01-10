import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all roles with pagination
   */
  async findAll(page = 1, pageSize = 10, search?: string) {
    const skip = (page - 1) * pageSize;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
          _count: {
            select: { users: true },
          },
        },
      }),
      this.prisma.role.count({ where }),
    ]);

    return {
      data: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        userCount: role._count.users,
        permissions: role.permissions.map((rp) => ({
          id: rp.permission.id,
          resource: rp.permission.resource,
          action: rp.permission.action,
          description: rp.permission.description,
        })),
      })),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Get a single role by ID
   */
  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Rol bulunamadı');
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      userCount: role._count.users,
      permissions: role.permissions.map((rp) => ({
        id: rp.permission.id,
        resource: rp.permission.resource,
        action: rp.permission.action,
        description: rp.permission.description,
      })),
    };
  }

  /**
   * Create a new role
   */
  async create(createRoleDto: CreateRoleDto) {
    const existingRole = await this.prisma.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('Bu rol adı zaten kullanılıyor');
    }

    // Validate permission IDs if provided
    if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { id: { in: createRoleDto.permissionIds } },
      });

      if (permissions.length !== createRoleDto.permissionIds.length) {
        throw new BadRequestException('Bir veya daha fazla izin bulunamadı');
      }
    }

    const role = await this.prisma.role.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
        isSystem: createRoleDto.isSystem ?? false,
        permissions: createRoleDto.permissionIds
          ? {
              create: createRoleDto.permissionIds.map((permissionId) => ({
                permissionId,
              })),
            }
          : undefined,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystem: role.isSystem,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.permissions.map((rp) => ({
        id: rp.permission.id,
        resource: rp.permission.resource,
        action: rp.permission.action,
        description: rp.permission.description,
      })),
    };
  }

  /**
   * Update a role
   */
  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException('Rol bulunamadı');
    }

    // Prevent updating system roles' names
    if (role.isSystem && updateRoleDto.name && updateRoleDto.name !== role.name) {
      throw new ForbiddenException('Sistem rollerinin adı değiştirilemez');
    }

    // Check name uniqueness if changing name
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.prisma.role.findUnique({
        where: { name: updateRoleDto.name },
      });
      if (existingRole) {
        throw new ConflictException('Bu rol adı zaten kullanılıyor');
      }
    }

    const updatedRole = await this.prisma.role.update({
      where: { id },
      data: updateRoleDto,
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return {
      id: updatedRole.id,
      name: updatedRole.name,
      description: updatedRole.description,
      isSystem: updatedRole.isSystem,
      createdAt: updatedRole.createdAt,
      updatedAt: updatedRole.updatedAt,
      permissions: updatedRole.permissions.map((rp) => ({
        id: rp.permission.id,
        resource: rp.permission.resource,
        action: rp.permission.action,
        description: rp.permission.description,
      })),
    };
  }

  /**
   * Delete a role
   */
  async remove(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Rol bulunamadı');
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      throw new ForbiddenException('Sistem rolleri silinemez');
    }

    // If role has users, assign them to VIEWER role
    if (role._count.users > 0) {
      const viewerRole = await this.prisma.role.findUnique({
        where: { name: 'VIEWER' },
      });

      if (viewerRole) {
        // Get all users with this role
        const userRoles = await this.prisma.userRole.findMany({
          where: { roleId: id },
        });

        // Assign VIEWER role to users who will lose their only role
        for (const userRole of userRoles) {
          const userRoleCount = await this.prisma.userRole.count({
            where: { userId: userRole.userId },
          });

          // If this is the user's only role, assign VIEWER
          if (userRoleCount === 1) {
            await this.prisma.userRole.create({
              data: {
                userId: userRole.userId,
                roleId: viewerRole.id,
              },
            });
          }
        }
      }
    }

    await this.prisma.role.delete({ where: { id } });

    return { message: 'Rol başarıyla silindi' };
  }

  /**
   * Assign permissions to a role
   */
  async assignPermissions(roleId: string, assignPermissionsDto: AssignPermissionsDto) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException('Rol bulunamadı');
    }

    // Validate all permission IDs exist
    const permissions = await this.prisma.permission.findMany({
      where: { id: { in: assignPermissionsDto.permissionIds } },
    });

    if (permissions.length !== assignPermissionsDto.permissionIds.length) {
      throw new BadRequestException('Bir veya daha fazla izin bulunamadı');
    }

    // Remove existing permissions and assign new ones
    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({ where: { roleId } }),
      this.prisma.rolePermission.createMany({
        data: assignPermissionsDto.permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      }),
    ]);

    // Return updated role
    return this.findOne(roleId);
  }

  /**
   * Get users with a specific role
   */
  async getRoleUsers(roleId: string, page = 1, pageSize = 10) {
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });

    if (!role) {
      throw new NotFoundException('Rol bulunamadı');
    }

    const skip = (page - 1) * pageSize;

    const [userRoles, total] = await Promise.all([
      this.prisma.userRole.findMany({
        where: { roleId },
        skip,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatar: true,
              isActive: true,
            },
          },
        },
        orderBy: { assignedAt: 'desc' },
      }),
      this.prisma.userRole.count({ where: { roleId } }),
    ]);

    return {
      data: userRoles.map((ur) => ur.user),
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
