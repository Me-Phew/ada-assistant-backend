import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser, Public } from 'common/decorators';
import { ApiUnauthorizedException } from 'common/decorators/api-unauthorized-exception.decorator';
import { ApiUnknownErrorException } from 'common/decorators/api-unknown-error-exception.decorator';
import { TemplatedApiException } from 'common/decorators/templated-api-exception.decorator';
import { Response } from 'express';
import { UserDto } from '../user/dtos/user.dto';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { CurrentUserDto } from './dtos/current-user.dto';
import { LoginResponseDto } from './dtos/login-response.dto';
import { LoginDto } from './dtos/login.dto';
import { InvalidLoginOrPasswordException } from './exceptions/invalid-login-or-password.exception';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('/login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Login the user to the system',
    summary: 'Login to the system',
  })
  @TemplatedApiException(() => new InvalidLoginOrPasswordException())
  @ApiUnknownErrorException()
  login(@Body() loginDto: LoginDto): Promise<LoginResponseDto | undefined> {
    return this.authService.loginUser(loginDto);
  }

  @Get('/me')
  @ApiBearerAuth()
  @ApiUnknownErrorException()
  @ApiUnauthorizedException()
  async me(@CurrentUser() user: UserDto): Promise<CurrentUserDto> {
    return { user };
  }

  @Get('/verify-email')
  @Public()
  @ApiOperation({
    description: 'Verify email address using token',
    summary: 'Verify email address',
  })
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    if (!token) {
      return res.status(400).send({
        success: false,
        message: 'Verification token is required',
      });
    }

    const verified = await this.userService.verifyEmail(token);

    if (!verified) {
      return res.status(400).send({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    return res.status(200).send({
      success: true,
      message: 'Email verified successfully',
    });
  }
}
