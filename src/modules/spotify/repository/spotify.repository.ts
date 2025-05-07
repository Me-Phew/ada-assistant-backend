import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'database/database.service';
import { Kysely } from 'kysely';
import { DB } from 'database/schema/db';
import { SpotifyCredentialsCreate, SpotifyCredentialsUpdate } from 'database/schema/spotify';
import { withTimestamps } from 'database/utils/datetime';
import { getUUIDV4 } from 'utils/uuid';
import { SpotifyCredentialsModel } from '../models/spotify-credentials.model';

@Injectable()
export class SpotifyRepository {
  private readonly db: Kysely<DB>;

  constructor(private readonly dbService: DatabaseService) {
    this.db = this.dbService.getDB();
  }

  async createCredentials(credentials: Omit<SpotifyCredentialsCreate, 'id'>): Promise<SpotifyCredentialsModel | null> {
    const id = getUUIDV4();

    const insertable: SpotifyCredentialsCreate = withTimestamps({
      id,
      ...credentials,
    });

    const result = await this.db
      .insertInto('spotifyCredentials')
      .values(insertable)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    return new SpotifyCredentialsModel(result);
  }

  async getCredentialsByUserId(userId: string): Promise<SpotifyCredentialsModel | null> {
    const result = await this.db
      .selectFrom('spotifyCredentials')
      .where('userId', '=', userId)
      .selectAll()
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    return new SpotifyCredentialsModel(result);
  }

  async updateCredentials(userId: string, update: Partial<SpotifyCredentialsUpdate>): Promise<SpotifyCredentialsModel | null> {
    const updateData = withTimestamps({ ...update }, { createdAt: false });

    const result = await this.db
      .updateTable('spotifyCredentials')
      .set(updateData)
      .where('userId', '=', userId)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    return new SpotifyCredentialsModel(result);
  }

  async deleteCredentials(userId: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('spotifyCredentials')
      .where('userId', '=', userId)
      .executeTakeFirst();

    return !!result;
  }
}