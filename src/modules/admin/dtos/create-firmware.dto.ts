import { IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFirmwareDto {
  @ApiProperty({ example: '1.0.0', description: 'Firmware version number' })
  @IsNotEmpty()
  version: string;

  @ApiProperty({ example: 'Initial release', description: 'Release notes' })
  @IsNotEmpty()
  releaseNotes: string;

  @ApiProperty({ example: 'Genesis', description: 'Firmware codename' })
  @IsNotEmpty()
  codename: string;

  @ApiProperty({ 
    example: 'https://example.com/firmware/v1.0.0.bin', 
    description: 'Download URL for the firmware binary' 
  })
  @IsUrl()
  @IsNotEmpty()
  releaseUrl: string;
}