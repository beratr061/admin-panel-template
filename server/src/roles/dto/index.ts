import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isSystem?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionIds?: string[];
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AssignPermissionsDto {
  @IsArray()
  @IsString({ each: true })
  permissionIds!: string[];
}

export class RoleResponseDto {
  id!: string;
  name!: string;
  description?: string;
  isSystem!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  permissions!: {
    id: string;
    resource: string;
    action: string;
    description?: string;
  }[];
}

export class PaginatedRolesDto {
  data!: RoleResponseDto[];
  meta!: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
