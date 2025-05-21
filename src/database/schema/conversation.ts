import { CreatedAt, UpdatedAt } from './common/datetime';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface ConversationTable {
  id: Generated<string>;
  userId: string;
  deviceId?: string;
  startDatetime?: Date;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
}

export interface UserMessageTable {
  id: Generated<string>;
  conversationId: string;
  audioPath?: string;
  registeredAt: Date;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
}

export interface TranscriptionTable {
  id: Generated<string>;
  userMessageId: string;
  transcriptionText: string;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
}

export interface AssistantMessageTable {
  id: Generated<string>;
  conversationId: string;
  messageText: string;
  registeredAt: Date;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
}

// Types for CRUD operations
export type Conversation = Selectable<ConversationTable>;
export type ConversationCreate = Insertable<ConversationTable>;
export type ConversationUpdate = Updateable<ConversationTable>;

export type UserMessage = Selectable<UserMessageTable>;
export type UserMessageCreate = Insertable<UserMessageTable>;
export type UserMessageUpdate = Updateable<UserMessageTable>;

export type Transcription = Selectable<TranscriptionTable>;
export type TranscriptionCreate = Insertable<TranscriptionTable>;
export type TranscriptionUpdate = Updateable<TranscriptionTable>;

export type AssistantMessage = Selectable<AssistantMessageTable>;
export type AssistantMessageCreate = Insertable<AssistantMessageTable>;
export type AssistantMessageUpdate = Updateable<AssistantMessageTable>;