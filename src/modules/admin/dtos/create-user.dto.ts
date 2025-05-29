import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../database/schema/common/role.enum';

export class AdminCreateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Initial password' })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: UserRole, default: UserRole.USER, description: 'User role' })
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ default: true, description: 'Whether account is pre-verified' })
  @IsOptional()
  verified?: boolean;
}