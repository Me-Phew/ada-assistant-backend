import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DeviceRepository } from '../repository/device.repository';
import { FirmwareRepository } from '../repository/firmware.repository';
import { CreateDeviceDto } from '../dtos/create-device.dto';

@Injectable()
export class AdminDeviceService {
  private readonly logger = new Logger(AdminDeviceService.name);

  constructor(
    private readonly deviceRepository: DeviceRepository,
    private readonly firmwareRepository: FirmwareRepository,
  ) {}

  async createDevice(createDeviceDto: CreateDeviceDto) {
    const firmware = await this.firmwareRepository.getFirmwareById(
      createDeviceDto.factoryFirmwareVersionId,
    );

    if (!firmware) {
      throw new NotFoundException('Firmware version not found');
    }

    const device = await this.deviceRepository.createDevice({
      name: createDeviceDto.name,
      model: createDeviceDto.model,
      factoryFirmwareVersionId: createDeviceDto.factoryFirmwareVersionId,
      userId: createDeviceDto.userId,
      boardRevision: createDeviceDto.boardRevision,
    });

    this.logger.log(`New device created: ${device.id} with serial number: ${device.serial_number}`);
    return device;
  }

  async getAllDevices() {
    return this.deviceRepository.getAllDevices();
  }

  async getDeviceById(id: string) {
    const device = await this.deviceRepository.getDeviceById(id);
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    return device;
  }

  async deleteDevice(id: string): Promise<boolean> {
    const device = await this.deviceRepository.getDeviceById(id);
    
    if (!device) {
      throw new NotFoundException('Device not found');
    }
    
    const result = await this.deviceRepository.deleteDevice(id);
    
    if (result) {
      this.logger.log(`Device deleted: ${id}`);
    } else {
      this.logger.warn(`Failed to delete device: ${id}`);
    }
    
    return result;
  }
}