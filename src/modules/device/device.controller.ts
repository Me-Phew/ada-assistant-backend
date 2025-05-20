import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators';
import { DeviceService } from './device.service';
import { User } from '../../database/schema/users';

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
  @ApiOperation({ summary: 'Get a specific device assigned to the current user' })
  async getUserDevice(
    @Param('id') deviceId: string,
    @CurrentUser() user: User
  ) {
    return this.deviceService.getUserDevice(deviceId, user.id);
  }
}