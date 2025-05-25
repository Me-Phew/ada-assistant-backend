import { Module } from '@nestjs/common';
import { ConversationController } from './conversation.controller';
import { ConversationService } from './conversation.service';
import { ConversationRepository } from './repository/conversation.repository';
import { ConversationResolver } from './resolvers/conversation.resolver';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ConversationController],
  providers: [
    ConversationService, 
    ConversationRepository,
    ConversationResolver
  ],
  exports: [ConversationService],
})
export class ConversationModule {}