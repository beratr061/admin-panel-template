import { IsString, IsOptional } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  resource!: string;

  @IsString()
  action!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class PermissionResponseDto {
  id!: string;
  resource!: string;
  action!: string;
  description?: string;
}
