import { UserTable } from './users';
import { SpotifyCredentialsTable } from './spotify';

export interface DB {
  users: UserTable;
  spotifyCredentials: SpotifyCredentialsTable;
}
