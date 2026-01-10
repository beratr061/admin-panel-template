import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to declare required permissions at the controller or route level.
 * Multiple permissions can be specified - user must have ALL of them.
 *
 * @example
 * @Permissions('users.create')
 * @Permissions('users.create', 'users.update')
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
