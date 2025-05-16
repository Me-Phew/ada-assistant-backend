import { UserTable } from './users';
import { SpotifyCredentialsTable } from './spotify';
import { EmailVerificationTokenTable } from './email-verification';

export interface DB {
  users: UserTable;
  spotifyCredentials: SpotifyCredentialsTable;
  emailVerificationTokens: EmailVerificationTokenTable;
}
