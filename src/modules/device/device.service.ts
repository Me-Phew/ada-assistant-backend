import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DeviceRepository } from '../admin/repository/device.repository';
import { PairDto } from './dtos/inputs/pair.dto';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  constructor(private readonly deviceRepository: DeviceRepository) {}

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
    const device = await this.deviceRepository.getUserDeviceById(
      deviceId,
      userId,
    );

    if (!device) {
      this.logger.warn(
        `Device ${deviceId} not found or not assigned to user ${userId}`,
      );
      throw new NotFoundException('Device not found or not assigned to you');
    }

    return device;
  }

  /**
   * Pair a device with a user
   */
  async pairDevice(pairDto: PairDto) {
    const device = await this.deviceRepository.getDeviceBySerialNumber(
      pairDto.serialNumber,
    );

    if (!device) {
      this.logger.warn(`Device ${pairDto.serialNumber} not found`);
      throw new NotFoundException('Device not found');
    }

    await this.deviceRepository.pairDeviceWithUser(
      pairDto.serialNumber,
      pairDto.userId,
    );
    this.logger.log(
      `Device ${pairDto.serialNumber} paired with user ${pairDto.userId}`,
    );

    const pairingData = await this.deviceRepository.createPairingToken(
      pairDto.serialNumber,
    );

    return {
      message: 'Device paired successfully',
      device: {
        serialNumber: pairDto.serialNumber,
        userId: pairDto.userId,
      },
      ...pairingData,
    };
  }

  async authenticateWithPairingToken(token: string) {
    const device = await this.deviceRepository.getDeviceByPairingToken(token);

    if (!device) {
      throw new UnauthorizedException('Invalid pairing token');
    }

    return device;
  }

  async unpairDevice(
    deviceId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Attempting to unpair device ${deviceId} for user ${userId}`);

    const device = await this.deviceRepository.getUserDeviceById(deviceId, userId);

    if (!device) {
      this.logger.warn(
        `Device ${deviceId} not found or not assigned to user ${userId}`,
      );
      throw new NotFoundException('Device not found or not assigned to you');
    }

    const result = await this.deviceRepository.unpairDevice(deviceId, userId);

    if (result) {
      this.logger.log(`Device ${deviceId} successfully unpaired from user ${userId}`);
      return {
        success: true,
        message: 'Device unpaired successfully',
      };
    } else {
      this.logger.warn(`Failed to unpair device ${deviceId}`);
      return {
        success: false,
        message: 'Failed to unpair device',
      };
    }
  }
}
