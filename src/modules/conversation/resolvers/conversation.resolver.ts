import { Resolver, Query, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { ConversationService } from '../conversation.service';
import { ConversationObject } from '../dtos/objects/conversation.object';
import { ConversationDetailObject } from '../dtos/objects/conversation-detail.object';

@Resolver()
export class ConversationResolver {
  constructor(private readonly conversationService: ConversationService) {}

  @UseGuards(JwtGuard)
  @Query(() => [ConversationObject], { 
    name: 'myConversations',
    description: 'Get all conversations for the current user' 
  })
  async getUserConversations(@Context() context: any) {
    const userId = context.req.user.id;
    return this.conversationService.getUserConversations(userId);
  }

  @UseGuards(JwtGuard)
  @Query(() => ConversationDetailObject, { 
    name: 'conversationDetails',
    description: 'Get conversation details including messages' 
  })
  async getConversationDetails(
    @Args('id') conversationId: string,
    @Context() context: any
  ) {
    const userId = context.req.user.id;
    return this.conversationService.getConversationDetails(conversationId, userId);
  }
}