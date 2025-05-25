import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from '../../config/configuration';
import { MailModule } from '../mail/mail.module';
import { SharedModule } from '../shared/shared.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailVerificationRepository } from './repository/email-verification.repository';
import { AuthResolver } from './resolvers/auth.resolver';

@Module({
  imports: [
    UserModule,
    MailModule,
    SharedModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<AppConfig>) => ({
        secret: configService.get<string>('secret'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthResolver, EmailVerificationRepository],
  exports: [AuthService, EmailVerificationRepository],
})
export class AuthModule {}
