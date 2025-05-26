import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Device } from 'database/schema/device';
import { CurrentUser, Public } from '../../common/decorators';
import { User } from '../../database/schema/users';
import { CurrentDevice } from './decorators/current-device.decorator';
import { DeviceService } from './device.service';
import { PairDto } from './dtos/inputs/pair.dto';
import { DeviceGuard } from './guards/pairingToken.guard';

@ApiTags('User Devices')
@ApiBearerAuth()
@Controller('devices')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all devices assigned to the current user' })
  async getUserDevices(@CurrentUser() user: User) {
    return this.deviceService.getUserDevices(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific device assigned to the current user',
  })
  async getUserDevice(
    @Param('id') deviceId: string,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.getUserDevice(deviceId, user.id);
  }

  @Post('/pair')
  @ApiOperation({
    summary: 'Pair a device with the current user',
  })
  @Public()
  @HttpCode(200)
  async pairDevice(@Body() pairDto: PairDto) {
    return this.deviceService.pairDevice(pairDto);
  }

  @UseGuards(DeviceGuard)
  @Post('/heartbeat')
  @ApiOperation({
    summary: 'Send a heartbeat signal from the device',
  })
  @Public()
  async sendHeartbeat(@CurrentDevice() device: Device) {
    // Logic to handle heartbeat signal
    return {
      message: 'Heartbeat received',
      deviceId: device.id,
    };
  }

  @Delete(':id/unpair')
  @ApiOperation({
    summary: 'Unpair a device from the current user',
    description: 'Removes the pairing between user and device',
  })
  @ApiResponse({
    status: 200,
    description: 'Device unpaired successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found or not paired with current user',
  })
  async unpairDevice(
    @Param('id') deviceId: string,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.unpairDevice(deviceId, user.id);
  }
}
