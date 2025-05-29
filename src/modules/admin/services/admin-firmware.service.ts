import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FirmwareRepository } from '../repository/firmware.repository';
import { CreateFirmwareDto } from '../dtos/create-firmware.dto';

@Injectable()
export class AdminFirmwareService {
  private readonly logger = new Logger(AdminFirmwareService.name);

  constructor(private readonly firmwareRepository: FirmwareRepository) {}

  async createFirmware(createFirmwareDto: CreateFirmwareDto) {
    const firmware = await this.firmwareRepository.createFirmware({
      version: createFirmwareDto.version,
      releaseNotes: createFirmwareDto.releaseNotes,
      codename: createFirmwareDto.codename,
      releaseUrl: createFirmwareDto.releaseUrl,
    });

    this.logger.log(`New firmware version created: ${firmware.id}`);
    return firmware;
  }

  async getAllFirmwareVersions() {
    return this.firmwareRepository.getAllFirmwareVersions();
  }

  async deleteFirmware(id: string): Promise<boolean> {
    const firmware = await this.firmwareRepository.getFirmwareById(id);
    
    if (!firmware) {
      throw new NotFoundException('Firmware version not found');
    }
    
    const result = await this.firmwareRepository.deleteFirmware(id);
    
    if (result) {
      this.logger.log(`Firmware version deleted: ${id}`);
    } else {
      this.logger.warn(`Failed to delete firmware version: ${id}`);
    }
    
    return result;
  }
}