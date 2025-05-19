import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { UserModule } from '../user/user.module';
import { AdminDeviceService } from './services/admin-device.service';
import { AdminFirmwareService } from './services/admin-firmware.service';
import { DeviceRepository } from './repository/device.repository';
import { FirmwareRepository } from './repository/firmware.repository';

@Module({
  imports: [UserModule],
  controllers: [AdminController],
  providers: [
    AdminDeviceService,
    AdminFirmwareService,
    DeviceRepository,
    FirmwareRepository,
  ],
  exports: [AdminDeviceService, AdminFirmwareService],
})
export class AdminModule {}