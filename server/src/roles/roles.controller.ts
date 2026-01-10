import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto, RoleResponseDto, PaginatedRolesDto } from './dto';
import { Permissions } from '../permissions/decorators';

@ApiTags('roles')
@ApiBearerAuth('JWT-auth')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Get all roles with pagination
   * Requires: roles.read
   */
  @Get()
  @Permissions('roles.read')
  @ApiOperation({ summary: 'Get all roles', description: 'Get paginated list of roles' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by role name' })
  @ApiResponse({ status: 200, description: 'Roles retrieved successfully', type: PaginatedRolesDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('search') search?: string,
  ) {
    return this.rolesService.findAll(page, pageSize, search);
  }

  /**
   * Get a single role by ID
   * Requires: roles.read
   */
  @Get(':id')
  @Permissions('roles.read')
  @ApiOperation({ summary: 'Get role by ID', description: 'Get a single role by its ID' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully', type: RoleResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  /**
   * Create a new role
   * Requires: roles.create (SUPER_ADMIN only via permission)
   */
  @Post()
  @Permissions('roles.create')
  @ApiOperation({ summary: 'Create role', description: 'Create a new role (SUPER_ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Role created successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  /**
   * Update a role
   * Requires: roles.update (SUPER_ADMIN only via permission)
   */
  @Put(':id')
  @Permissions('roles.update')
  @ApiOperation({ summary: 'Update role', description: 'Update an existing role (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Role updated successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  /**
   * Delete a role
   * Requires: roles.delete (SUPER_ADMIN only via permission)
   */
  @Delete(':id')
  @Permissions('roles.delete')
  @ApiOperation({ summary: 'Delete role', description: 'Delete a role (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  /**
   * Assign permissions to a role
   * Requires: roles.update (SUPER_ADMIN only via permission)
   */
  @Put(':id/permissions')
  @Permissions('roles.update')
  @ApiOperation({ summary: 'Assign permissions to role', description: 'Assign permissions to a role (SUPER_ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Permissions assigned successfully', type: RoleResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async assignPermissions(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.rolesService.assignPermissions(id, assignPermissionsDto);
  }

  /**
   * Get users with a specific role
   * Requires: roles.read
   */
  @Get(':id/users')
  @Permissions('roles.read')
  @ApiOperation({ summary: 'Get role users', description: 'Get users assigned to a specific role' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  async getRoleUsers(
    @Param('id') id: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.rolesService.getRoleUsers(id, page, pageSize);
  }
}
