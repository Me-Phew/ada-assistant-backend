import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtGuard } from '../../common/guards/jwt.guard';
import { CurrentUser } from '../../common/decorators';
import { ConversationService } from './conversation.service';
import { User } from '../../database/schema/users';

@ApiTags('Conversations')
@ApiBearerAuth()
@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all conversations for the current user' })
  async getUserConversations(@CurrentUser() user: User) {
    return this.conversationService.getUserConversations(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get conversation details including messages' })
  async getConversationDetails(
    @Param('id') conversationId: string,
    @CurrentUser() user: User
  ) {
    return this.conversationService.getConversationDetails(conversationId, user.id);
  }

  @Post('record')
  @ApiOperation({ summary: 'Record a complete conversation exchange' })
  async recordExchange(
    @Body() data: {
      userInput: string;
      assistantResponse: string;
      deviceId?: string;
    },
    @CurrentUser() user: User
  ) {
    return this.conversationService.recordConversationExchange(
      user.id,
      data.userInput,
      data.assistantResponse,
      data.deviceId,
    );
  }
}