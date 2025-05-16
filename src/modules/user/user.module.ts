import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserResolver } from './resolvers/user.resolver';
import { UserRepositoy } from './repository/user.respository';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [MailModule, SharedModule],
  controllers: [UserController],
  providers: [UserService, UserResolver, UserRepositoy],
  exports: [UserService, UserRepositoy],
})
export class UserModule {}
