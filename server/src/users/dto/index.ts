import { IsString, IsEmail, IsOptional, IsBoolean, IsArray, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roleIds?: string[];
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class AssignRolesDto {
  @IsArray()
  @IsString({ each: true })
  roleIds!: string[];
}

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  avatar?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  roles!: {
    id: string;
    name: string;
    description?: string;
  }[];
}

export class PaginatedUsersDto {
  data!: UserResponseDto[];
  meta!: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
