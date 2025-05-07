import { SpotifyCredentials } from 'database/schema/spotify';

export class SpotifyCredentialsModel implements SpotifyCredentials {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: SpotifyCredentials) {
    this.id = data.id;
    this.userId = data.userId;
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  isTokenExpired(): boolean {
    return new Date() > this.expiresAt;
  }
}