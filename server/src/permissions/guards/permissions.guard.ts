import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

/**
 * Guard that validates user permissions before executing protected endpoints.
 * SUPER_ADMIN role bypasses all permission checks.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // No permissions required - allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // No user - deny access
    if (!user) {
      throw new ForbiddenException('Bu işlem için yetkiniz bulunmamaktadır');
    }

    // SUPER_ADMIN bypass - grant full access
    if (user.roles && user.roles.includes('SUPER_ADMIN')) {
      return true;
    }

    // Check if user has all required permissions
    const userPermissions: string[] = user.permissions || [];
    const hasAllPermissions = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException('Bu işlem için yetkiniz bulunmamaktadır');
    }

    return true;
  }
}
