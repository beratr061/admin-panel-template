import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  email!: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name (2-100 characters)' })
  @IsString()
  @MinLength(2, { message: 'İsim en az 2 karakter olmalıdır' })
  @MaxLength(100, { message: 'İsim en fazla 100 karakter olabilir' })
  name!: string;

  @ApiProperty({ example: 'Password123', description: 'Password (min 6 chars, must contain uppercase, lowercase, and number)' })
  @IsString()
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  @MaxLength(100, { message: 'Şifre en fazla 100 karakter olabilir' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir',
  })
  password!: string;

  @ApiProperty({ example: 'Password123', description: 'Password confirmation (must match password)' })
  @IsString()
  @MinLength(6, { message: 'Şifre onayı en az 6 karakter olmalıdır' })
  passwordConfirm!: string;
}
