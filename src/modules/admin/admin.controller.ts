import { Controller, Get, Post, Body, Param, Delete, Put, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../database/schema/common/role.enum';
import { UserService } from '../user/user.service';
import { UserDto } from '../user/dtos/user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';
import { AdminDeviceService } from './services/admin-device.service';
import { AdminFirmwareService } from './services/admin-firmware.service';
import { CreateFirmwareDto } from './dtos/create-firmware.dto';
import { CreateDeviceDto } from './dtos/create-device.dto';
import { AdminCreateUserDto } from './dtos/admin-create-user.dto';
import { EmailAlreadyTakenException } from '../user/exceptions/email-already-taken.exception';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserNotFoundException } from '../user/exceptions/user-not-found.exception';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly userService: UserService,
    private readonly deviceService: AdminDeviceService,
    private readonly firmwareService: AdminFirmwareService,
  ) {}

  @Get('users')
  async getAllUsers(): Promise<UserDto[]> {
    const users = await this.userService.findAllUsers();
    return users.map(user => user.toDto());
  }

  @Put('users/:id/promote')
  async promoteToAdmin(@Param('id') id: string): Promise<UserDto> {
    const user = await this.userService.updateUserRole(id, UserRole.ADMIN);
    return user.toDto();
  }

  @Put('users/:id/demote')
  async demoteToUser(@Param('id') id: string): Promise<UserDto> {
    const user = await this.userService.updateUserRole(id, UserRole.USER);
    return user.toDto();
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Update a user' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserDto> {
    const user = await this.userService.updateUserDetails(id, updateUserDto);
    return user.toDto();
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user' })
  async deleteUser(@Param('id') id: string) {
    try {
      const result = await this.userService.deleteUser(id);
      if (result) {
        return { success: true, message: 'User deleted successfully' };
      } else {
        return { success: false, message: 'Failed to delete user' };
      }
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({ description: 'User created successfully' })
  async createUser(@Body() createUserDto: AdminCreateUserDto) {
    try {
      const user = await this.userService.createUserByAdmin(createUserDto);
      return user;
    } catch (error) {
      if (error instanceof EmailAlreadyTakenException) {
        throw new ConflictException(error.message);
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  @Post('firmware')
  @ApiOperation({ summary: 'Create a new firmware version' })
  @ApiCreatedResponse({ description: 'Firmware version created successfully' })
  async createFirmware(@Body() createFirmwareDto: CreateFirmwareDto) {
    return this.firmwareService.createFirmware(createFirmwareDto);
  }

  @Get('firmware')
  @ApiOperation({ summary: 'Get all firmware versions' })
  async getAllFirmwareVersions() {
    return this.firmwareService.getAllFirmwareVersions();
  }

  @Delete('firmware/:id')
  @ApiOperation({ summary: 'Delete a firmware version' })
  async deleteFirmware(@Param('id') id: string) {
    const result = await this.firmwareService.deleteFirmware(id);
    if (result) {
      return { success: true, message: 'Firmware version deleted successfully' };
    } else {
      return { success: false, message: 'Failed to delete firmware version' };
    }
  }

  @Post('devices')
  @ApiOperation({ summary: 'Create a new device' })
  @ApiCreatedResponse({ description: 'Device created successfully' })
  async createDevice(@Body() createDeviceDto: CreateDeviceDto) {
    return this.deviceService.createDevice(createDeviceDto);
  }

  @Get('devices')
  @ApiOperation({ summary: 'Get all devices' })
  async getAllDevices() {
    return this.deviceService.getAllDevices();
  }

  @Get('devices/:id')
  @ApiOperation({ summary: 'Get device by ID' })
  async getDeviceById(@Param('id') id: string) {
    return this.deviceService.getDeviceById(id);
  }

  @Delete('devices/:id')
  @ApiOperation({ summary: 'Delete a device' })
  async deleteDevice(@Param('id') id: string) {
    const result = await this.deviceService.deleteDevice(id);
    if (result) {
      return { success: true, message: 'Device deleted successfully' };
    } else {
      return { success: false, message: 'Failed to delete device' };
    }
  }
}