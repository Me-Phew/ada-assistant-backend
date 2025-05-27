import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeEmailDto {
  @ApiProperty({ example: 'current-password123', description: 'Current password to verify identity' })
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({ example: 'new-email@example.com', description: 'New email address' })
  @IsEmail()
  newEmail: string;
}