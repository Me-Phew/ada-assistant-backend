import { IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../../database/schema/common/role.enum';

export class UpdateUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'User email address' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ enum: UserRole, description: 'User role' })
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ description: 'Whether account is verified' })
  @IsOptional()
  verified?: boolean;
}