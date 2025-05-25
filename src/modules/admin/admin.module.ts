import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { AdminController } from './admin.controller';
import { DeviceRepository } from './repository/device.repository';
import { FirmwareRepository } from './repository/firmware.repository';
import { AdminDeviceService } from './services/admin-device.service';
import { AdminFirmwareService } from './services/admin-firmware.service';

@Module({
  imports: [UserModule],
  controllers: [AdminController],
  providers: [
    AdminDeviceService,
    AdminFirmwareService,
    DeviceRepository,
    FirmwareRepository,
  ],
  exports: [
    AdminDeviceService,
    AdminFirmwareService,
    DeviceRepository,
    FirmwareRepository,
  ],
})
export class AdminModule {}
