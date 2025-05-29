import { IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({ example: 'Smart Assistant', description: 'Name of the device' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Ada-100', description: 'Model identifier' })
  @IsNotEmpty()
  model: string;

  @ApiProperty({ description: 'Factory firmware version ID' })
  @IsUUID()
  @IsNotEmpty()
  factoryFirmwareVersionId: string;
  
  @ApiProperty({ description: 'User ID (optional)', required: false })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({ example: '1.0', description: 'Board revision number' })
  @IsNotEmpty()
  boardRevision: string;
}