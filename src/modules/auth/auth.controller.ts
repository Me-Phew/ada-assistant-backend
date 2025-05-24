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
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { User } from '../../database/schema/users';

@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private configService: ConfigService,
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

  @Post('/forgot-password')
  @Public()
  @ApiOperation({
    description: 'Request a password reset link via email',
    summary: 'Forgot password',
  })
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto
  ): Promise<{ message: string }> {
    await this.authService.requestPasswordReset(forgotPasswordDto.email);

    return {
      message: 'If your email is registered, you will receive a password reset link',
    };
  }

  @Post('/reset-password')
  @Public()
  @ApiOperation({
    description: 'Reset password using token received via email',
    summary: 'Reset password',
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<{ success: boolean; message: string }> {
    const success = await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.password
    );

    if (success) {
      return {
        success: true,
        message: 'Password has been reset successfully',
      };
    } else {
      return {
        success: false,
        message: 'Invalid or expired token',
      };
    }
  }

  @Get('/reset-password')
  @Public()
  @ApiOperation({
    description: 'Redirect to frontend reset password page',
    summary: 'Reset password redirect',
  })
  async resetPasswordRedirect(
    @Query('token') token: string,
    @Res() res: any,
  ) {
    const frontendUrl = this.configService.get('frontendUrl') || 'http://localhost:3000';

    return res.redirect(`${frontendUrl}/reset-password?token=${token}`);
  }

  @Post('/change-password')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Change user password when logged in',
    summary: 'Change password',
  })
  async changePassword(
    @CurrentUser() user: User,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<{ success: boolean; message: string }> {
    const success = await this.authService.changePassword(
      user.id,
      changePasswordDto.currentPassword,
      changePasswordDto.newPassword
    );
    
    if (success) {
      return {
        success: true,
        message: 'Password has been changed successfully',
      };
    } else {
      return {
        success: false,
        message: 'Failed to change password. Please check your current password.',
      };
    }
  }
}
