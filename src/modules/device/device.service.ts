import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DeviceRepository } from '../admin/repository/device.repository'; 

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(
    private readonly deviceRepository: DeviceRepository,
  ) {}

  /**
   * Get all devices assigned to a specific user
   */
  async getUserDevices(userId: string) {
    this.logger.log(`Fetching devices for user ${userId}`);
    return this.deviceRepository.getUserDevices(userId);
  }

  /**
   * Get details for a specific device assigned to a user
   */
  async getUserDevice(deviceId: string, userId: string) {
    const device = await this.deviceRepository.getUserDeviceById(deviceId, userId);
    
    if (!device) {
      this.logger.warn(`Device ${deviceId} not found or not assigned to user ${userId}`);
      throw new NotFoundException('Device not found or not assigned to you');
    }
    
    return device;
  }
}