import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { Permissions } from './decorators';
import { CurrentUser } from '../auth/decorators';

@ApiTags('permissions')
@ApiBearerAuth('JWT-auth')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * Get all available permissions
   * Requires: permissions.read
   */
  @Get()
  @Permissions('permissions.read')
  @ApiOperation({ summary: 'Get all permissions', description: 'Get list of all available permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  async findAll() {
    return this.permissionsService.findAll();
  }

  /**
   * Get permissions grouped by resource
   * Requires: permissions.read
   */
  @Get('grouped')
  @Permissions('permissions.read')
  @ApiOperation({ summary: 'Get permissions grouped by resource', description: 'Get permissions organized by resource type' })
  @ApiResponse({ status: 200, description: 'Grouped permissions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  async findAllGrouped() {
    return this.permissionsService.findAllGrouped();
  }

  /**
   * Get current user's effective permissions
   */
  @Get('me')
  @ApiOperation({ summary: 'Get my permissions', description: 'Get current user\'s effective permissions' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyPermissions(@CurrentUser('id') userId: string) {
    return this.permissionsService.getEffectivePermissions(userId);
  }

  /**
   * Get a single permission by ID
   * Requires: permissions.read
   */
  @Get(':id')
  @Permissions('permissions.read')
  @ApiOperation({ summary: 'Get permission by ID', description: 'Get a single permission by its ID' })
  @ApiResponse({ status: 200, description: 'Permission retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  async findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }
}
