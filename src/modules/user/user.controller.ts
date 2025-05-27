import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiUnknownErrorException } from 'common/decorators/api-unknown-error-exception.decorator';
import { ApiValidationException } from 'common/decorators/api-validation-exception.decorator';
import { CurrentUser, Public } from '../../common/decorators';
import { TemplatedApiException } from '../../common/decorators/templated-api-exception.decorator';
import { MessageDto } from '../../common/dtos/message.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { ChangeEmailDto } from './dtos/change-email.dto';
import { EmailAlreadyTakenException } from './exceptions/email-already-taken.exception';
import { UserService } from './user.service';
import { User } from '../../database/schema/users';

@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('/register')
  @Public()
  @ApiValidationException()
  @TemplatedApiException(
    () => new EmailAlreadyTakenException('jhonedoes@example.com'),
  )
  @ApiUnknownErrorException()
  @ApiCreatedResponse({
    type: MessageDto,
    description: 'User account created',
  })
  @ApiOperation({
    description: 'Registers a new user account and sends a confirmation',
    summary: 'Register a new user',
  })
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<MessageDto> {
    await this.userService.registerUser(registerUserDto);

    return { message: 'Account created' };
  }

  @Post('/change-email')
  @ApiBearerAuth()
  @ApiOperation({
    description: 'Change user email address',
    summary: 'Change email address',
  })
  @ApiResponse({
    status: 200,
    description: 'Email changed successfully and verification email sent',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid password or other validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already taken by another user',
  })
  async changeEmail(
    @CurrentUser() user: User,
    @Body() changeEmailDto: ChangeEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const success = await this.userService.changeEmail(
        user.id,
        changeEmailDto.currentPassword,
        changeEmailDto.newEmail,
      );
      
      if (success) {
        return {
          success: true,
          message: 'Email changed successfully. Please check your new email address for verification instructions.',
        };
      } else {
        return {
          success: false,
          message: 'Failed to change email. Please check your password and try again.',
        };
      }
    } catch (error) {
      if (error instanceof EmailAlreadyTakenException) {
        throw error;
      }
      return {
        success: false,
        message: 'An error occurred while changing email',
      };
    }
  }
}
