import { DeviceTable } from './device';
import { EmailVerificationTokenTable } from './email-verification';
import { FirmwareVersionTable } from './firmware';
import { SpotifyCredentialsTable } from './spotify';
import { UserTable } from './users';

export interface DB {
  users: UserTable;
  spotifyCredentials: SpotifyCredentialsTable;
  emailVerificationTokens: EmailVerificationTokenTable;
  firmwareVersions: FirmwareVersionTable;
  devices: DeviceTable;
}
