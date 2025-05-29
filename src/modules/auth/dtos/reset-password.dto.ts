import { IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ example: 'abc123', description: 'Reset token received by email' })
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'newPassword123', description: 'New password' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}