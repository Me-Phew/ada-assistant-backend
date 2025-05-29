import {
  AssistantMessageTable,
  ConversationTable,
  TranscriptionTable,
  UserMessageTable,
} from './conversation';
import { DeviceTable } from './device';
import { EmailVerificationTokenTable } from './email-verification';
import { FirmwareVersionTable } from './firmware';
import { PasswordResetTokenTable } from './password-reset';
import { SpotifyCredentialsTable } from './spotify';
import { UserTable } from './users';

export interface DB {
  users: UserTable;
  spotifyCredentials: SpotifyCredentialsTable;
  emailVerificationTokens: EmailVerificationTokenTable;
  passwordResetTokens: PasswordResetTokenTable;
  firmwareVersions: FirmwareVersionTable;
  devices: DeviceTable;
  conversations: ConversationTable;
  userMessages: UserMessageTable;
  transcriptions: TranscriptionTable;
  assistantMessages: AssistantMessageTable;
}
