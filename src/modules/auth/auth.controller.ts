import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Res,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public, CurrentUser } from 'common/decorators';
import { UserDto } from '../user/dtos/user.dto';
import { AuthService } from './auth.service';
import { LoginResponseDto } from './dtos/login-response.dto';
import { LoginDto } from './dtos/login.dto';
import { CurrentUserDto } from './dtos/current-user.dto';
import { ApiUnauthorizedException } from 'common/decorators/api-unauthorized-exception.decorator';
import { TemplatedApiException } from 'common/decorators/templated-api-exception.decorator';
import { InvalidLoginOrPasswordException } from './exceptions/invalid-login-or-password.exception';
import { ApiUnknownErrorException } from 'common/decorators/api-unknown-error-exception.decorator';
import { Response } from 'express';
import { UserService } from '../user/user.service';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
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
  async verifyEmail(
    @Query('token') token: string,
    @Res() res: Response,
  ) {
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
