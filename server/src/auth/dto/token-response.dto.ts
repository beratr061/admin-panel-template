import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', description: 'JWT access token' })
  accessToken!: string;

  @ApiProperty({ example: 900, description: 'Token expiration time in seconds' })
  expiresIn!: number;
}

class UserDto {
  @ApiProperty({ example: 'clx1234567890', description: 'User ID' })
  id!: string;

  @ApiProperty({ example: 'admin@example.com', description: 'User email' })
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name!: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'User avatar URL' })
  avatar?: string;

  @ApiProperty({ example: ['SUPER_ADMIN'], description: 'User roles' })
  roles!: string[];
}

export class AuthResponseDto {
  @ApiProperty({ type: UserDto, description: 'User information' })
  user!: UserDto;

  @ApiProperty({ type: TokenResponseDto, description: 'Authentication tokens' })
  tokens!: TokenResponseDto;
}
