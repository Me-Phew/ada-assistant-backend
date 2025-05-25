import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { DeviceGuard } from './guards/pairingToken.guard';

@Module({
  imports: [AdminModule],
  controllers: [DeviceController],
  providers: [DeviceService, DeviceGuard],
  exports: [DeviceService],
})
export class DeviceModule {}
