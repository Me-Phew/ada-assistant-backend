import { Module } from '@nestjs/common';
import { EmailVerificationRepository } from '../auth/repository/email-verification.repository';

@Module({
  providers: [EmailVerificationRepository],
  exports: [EmailVerificationRepository]
})
export class SharedModule {}