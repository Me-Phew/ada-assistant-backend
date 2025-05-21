import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConversationRepository } from './repository/conversation.repository';

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    private readonly conversationRepository: ConversationRepository,
  ) {}

  async getUserConversations(userId: string) {
    this.logger.log(`Fetching conversations for user ${userId}`);
    return this.conversationRepository.getUserConversations(userId);
  }

  async getConversationDetails(conversationId: string, userId: string) {
    const conversation = await this.conversationRepository.getConversationById(conversationId, userId);
    
    if (!conversation) {
      this.logger.warn(`Conversation ${conversationId} not found for user ${userId}`);
      throw new NotFoundException('Conversation not found');
    }
    
    const messages = await this.conversationRepository.getConversationMessages(conversationId, userId);
    
    return {
      ...conversation,
      messages,
    };
  }

  async createConversation(userId: string, deviceId?: string) {
    this.logger.log(`Creating new conversation for user ${userId}`);
    return this.conversationRepository.createConversation(userId, deviceId);
  }

  async recordUserMessage(conversationId: string, audioPath?: string) {
    this.logger.log(`Recording user message for conversation ${conversationId}`);
    return this.conversationRepository.saveUserMessage(conversationId, audioPath);
  }

  async saveTranscription(userMessageId: string, transcriptionText: string) {
    this.logger.log(`Saving transcription for message ${userMessageId}`);
    return this.conversationRepository.saveTranscription(userMessageId, transcriptionText);
  }

  async saveAssistantResponse(conversationId: string, messageText: string) {
    this.logger.log(`Saving assistant response for conversation ${conversationId}`);
    return this.conversationRepository.saveAssistantMessage(conversationId, messageText);
  }

  async recordConversationExchange(
    userId: string, 
    userInput: string, 
    assistantResponse: string,
    deviceId?: string,
    audioPath?: string
  ) {
    // Create or get existing conversation
    let conversationId: string;
    
    // Create new conversation if this is the start of one
    const conversation = await this.createConversation(userId, deviceId);
    conversationId = conversation.id;
    
    // Save user message
    const userMessage = await this.recordUserMessage(conversationId, audioPath);
    
    // Save transcription
    await this.saveTranscription(userMessage.id, userInput);
    
    // Save assistant response
    await this.saveAssistantResponse(conversationId, assistantResponse);
    
    this.logger.log(`Recorded complete exchange in conversation ${conversationId}`);
    
    return {
      conversationId,
      userMessageId: userMessage.id
    };
  }
}