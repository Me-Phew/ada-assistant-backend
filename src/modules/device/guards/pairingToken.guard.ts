import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getRequest } from 'common/graphql/context';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { NON_PAIRED_DEVICE_KEY } from '../decorators/non-paired-device.decorator';
import { DeviceService } from './../device.service';

@Injectable()
export class DeviceGuard implements CanActivate {
  private readonly logger = new Logger(DeviceGuard.name);

  constructor(
    private readonly deviceService: DeviceService,
    private reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const isForNonPairedDevice = this.reflector.getAllAndOverride<boolean>(
        NON_PAIRED_DEVICE_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (isForNonPairedDevice) {
        return true;
      }
      const req = getRequest(context);
      return this.validateRequest(req);
    } catch (error) {
      this.logger.error('Error in DeviceGuard', error);
      return false;
    }
  }

  async validateRequest(req: Request) {
    const authHeader = req.header('Authorization');

    this.logger.log('Auth Header:', authHeader);

    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const [method, token] = authHeader.split(' ');

    if (method !== 'PairingKey') {
      throw new UnauthorizedException();
    }

    const device = await this.deviceService.authenticateWithPairingToken(token);
    if (!device) {
      return false;
    }

    req.device = device;
    return true;
  }
}
