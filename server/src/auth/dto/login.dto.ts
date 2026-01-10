import { IsEmail, IsString, MinLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  email!: string;

  @ApiProperty({ example: 'password123', description: 'User password (min 6 characters)' })
  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password!: string;

  @ApiPropertyOptional({ example: false, description: 'Remember user session' })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
