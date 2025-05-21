import { UserTable } from './users';
import { SpotifyCredentialsTable } from './spotify';
import { EmailVerificationTokenTable } from './email-verification';
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
  firmwareVersions: FirmwareVersionTable;
  devices: DeviceTable;
  conversations: ConversationTable;
  userMessages: UserMessageTable;
  transcriptions: TranscriptionTable;
  assistantMessages: AssistantMessageTable;
}
