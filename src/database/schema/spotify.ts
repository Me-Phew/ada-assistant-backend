import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { CreatedAt, UpdatedAt } from './common/datetime';

export interface SpotifyCredentialsTable {
  id: Generated<string>;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
}

export type SpotifyCredentials = Selectable<SpotifyCredentialsTable>;
export type SpotifyCredentialsCreate = Insertable<SpotifyCredentialsTable>;
export type SpotifyCredentialsUpdate = Updateable<SpotifyCredentialsTable>;
