import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'database/database.service';
import { Kysely } from 'kysely';
import { DB } from 'database/schema/db';
import { withTimestamps } from 'database/utils/datetime';
import { getUUIDV4 } from 'utils/uuid';

@Injectable()
export class ConversationRepository {
  private readonly db: Kysely<DB>;

  constructor(private readonly dbService: DatabaseService) {
    this.db = this.dbService.getDB();
  }

  async getUserConversations(userId: string) {
    return this.db
      .selectFrom('conversations')
      .where('conversations.userId', '=', userId)
      .leftJoin('devices', 'devices.id', 'conversations.deviceId')
      .select([
        'conversations.id',
        'conversations.startDatetime',
        'conversations.createdAt',
        'devices.name as deviceName',
        'devices.model as deviceModel',
      ])
      .orderBy('conversations.createdAt', 'desc')
      .execute();
  }

  async getConversationById(conversationId: string, userId: string) {
    return this.db
      .selectFrom('conversations')
      .where('conversations.id', '=', conversationId)
      .where('conversations.userId', '=', userId)
      .leftJoin('devices', 'devices.id', 'conversations.deviceId')
      .select([
        'conversations.id',
        'conversations.startDatetime',
        'conversations.createdAt',
        'devices.name as deviceName',
        'devices.model as deviceModel',
      ])
      .executeTakeFirst();
  }

  async getConversationMessages(conversationId: string, userId: string) {
    const isUserConversation = await this.db
      .selectFrom('conversations')
      .where('conversations.id', '=', conversationId)
      .where('conversations.userId', '=', userId)
      .select('conversations.id')
      .executeTakeFirst();

    if (!isUserConversation) {
      return null;
    }

    // Get user messages with transcriptions
    const userMessages = await this.db
      .selectFrom('userMessages')
      .where('userMessages.conversationId', '=', conversationId)
      .leftJoin('transcriptions', 'transcriptions.userMessageId', 'userMessages.id')
      .select([
        'userMessages.id',
        'userMessages.registeredAt',
        'userMessages.audioPath',
        'transcriptions.transcriptionText',
      ])
      .execute();

    // Get assistant responses
    const assistantMessages = await this.db
      .selectFrom('assistantMessages')
      .where('assistantMessages.conversationId', '=', conversationId)
      .select([
        'assistantMessages.id',
        'assistantMessages.messageText',
        'assistantMessages.registeredAt',
      ])
      .execute();

    // Combine and sort by timestamp
    const allMessages = [
      ...userMessages.map(msg => ({
        id: msg.id,
        type: 'user',
        content: msg.transcriptionText || '(No transcription available)',
        audioPath: msg.audioPath,
        timestamp: msg.registeredAt,
      })),
      ...assistantMessages.map(msg => ({
        id: msg.id,
        type: 'assistant',
        content: msg.messageText,
        timestamp: msg.registeredAt,
      })),
    ].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return allMessages;
  }
  
  async createConversation(userId: string, deviceId?: string) {
    const id = getUUIDV4();
    const now = new Date();
    
    const insertable = withTimestamps({
      id,
      userId,
      deviceId,
      startDatetime: now,
    });
    
    const result = await this.db
      .insertInto('conversations')
      .values(insertable)
      .returningAll()
      .executeTakeFirst();
      
    return result;
  }
  
  async saveUserMessage(conversationId: string, audioPath?: string) {
    const id = getUUIDV4();
    const now = new Date();
    
    const insertable = withTimestamps({
      id,
      conversationId,
      audioPath,
      registeredAt: now,
    });
    
    const result = await this.db
      .insertInto('userMessages')
      .values(insertable)
      .returningAll()
      .executeTakeFirst();
      
    return result;
  }
  
  async saveTranscription(userMessageId: string, transcriptionText: string) {
    const id = getUUIDV4();
    
    const insertable = withTimestamps({
      id,
      userMessageId,
      transcriptionText,
    });
    
    const result = await this.db
      .insertInto('transcriptions')
      .values(insertable)
      .returningAll()
      .executeTakeFirst();
      
    return result;
  }
  
  async saveAssistantMessage(conversationId: string, messageText: string) {
    const id = getUUIDV4();
    const now = new Date();
    
    const insertable = withTimestamps({
      id,
      conversationId,
      messageText,
      registeredAt: now,
    });
    
    const result = await this.db
      .insertInto('assistantMessages')
      .values(insertable)
      .returningAll()
      .executeTakeFirst();
      
    return result;
  }
}