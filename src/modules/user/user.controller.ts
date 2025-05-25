import { Body, Controller, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiUnknownErrorException } from 'common/decorators/api-unknown-error-exception.decorator';
import { ApiValidationException } from 'common/decorators/api-validation-exception.decorator';
import { Public } from '../../common/decorators';
import { TemplatedApiException } from '../../common/decorators/templated-api-exception.decorator';
import { MessageDto } from '../../common/dtos/message.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { EmailAlreadyTakenException } from './exceptions/email-already-taken.exception';
import { UserService } from './user.service';

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
}
