import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';
import { AuthResolver } from './resolvers/auth.resolver';
import { EmailVerificationRepository } from './repository/email-verification.repository';
import { MailModule } from '../mail/mail.module';
import { SharedModule } from '../shared/shared.module';

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
