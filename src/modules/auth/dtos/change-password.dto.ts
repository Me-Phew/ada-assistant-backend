import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ example: 'currentPassword123', description: 'Current password' })
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'newPassword123', description: 'New password' })
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}