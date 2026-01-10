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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, AssignRolesDto, UserResponseDto, PaginatedUsersDto } from './dto';
import { Permissions } from '../permissions/decorators';

@ApiTags('users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get all users with pagination
   * Requires: users.read
   */
  @Get()
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get all users', description: 'Get paginated list of users' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name or email' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: PaginatedUsersDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(page, pageSize, search);
  }

  /**
   * Get a single user by ID
   * Requires: users.read
   */
  @Get(':id')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get user by ID', description: 'Get a single user by their ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: UserResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  /**
   * Create a new user
   * Requires: users.create
   */
  @Post()
  @Permissions('users.create')
  @ApiOperation({ summary: 'Create user', description: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * Update a user
   * Requires: users.update
   */
  @Put(':id')
  @Permissions('users.update')
  @ApiOperation({ summary: 'Update user', description: 'Update an existing user' })
  @ApiResponse({ status: 200, description: 'User updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * Delete a user
   * Requires: users.delete
   */
  @Delete(':id')
  @Permissions('users.delete')
  @ApiOperation({ summary: 'Delete user', description: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  /**
   * Assign roles to a user
   * Requires: users.update
   */
  @Put(':id/roles')
  @Permissions('users.update')
  @ApiOperation({ summary: 'Assign roles to user', description: 'Assign one or more roles to a user' })
  @ApiResponse({ status: 200, description: 'Roles assigned successfully', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async assignRoles(@Param('id') id: string, @Body() assignRolesDto: AssignRolesDto) {
    return this.usersService.assignRoles(id, assignRolesDto);
  }

  /**
   * Get user's effective permissions
   * Requires: users.read
   */
  @Get(':id/permissions')
  @Permissions('users.read')
  @ApiOperation({ summary: 'Get user permissions', description: 'Get effective permissions for a user' })
  @ApiResponse({ status: 200, description: 'Permissions retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Missing required permission' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getPermissions(@Param('id') id: string) {
    return this.usersService.getEffectivePermissions(id);
  }
}
