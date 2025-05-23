import { UserTable } from './users';
import { SpotifyCredentialsTable } from './spotify';
import { EmailVerificationTokenTable } from './email-verification';
import { PasswordResetTokenTable } from './password-reset';
import { FirmwareVersionTable } from './firmware';
import { DeviceTable } from './device';
import { 
  ConversationTable, 
  UserMessageTable, 
  TranscriptionTable, 
  AssistantMessageTable 
} from './conversation';

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
