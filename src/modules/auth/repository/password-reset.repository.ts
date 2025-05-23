import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'database/database.service';
import { DB } from 'database/schema/db';
import { Kysely } from 'kysely';
import { getUUIDV4 } from 'utils/uuid';
import { withTimestamps } from 'database/utils/datetime';
import { PasswordResetTokenCreate, PasswordResetToken } from 'database/schema/password-reset';
import * as crypto from 'crypto';

@Injectable()
export class PasswordResetRepository {
  private readonly db: Kysely<DB>;

  constructor(private readonly dbService: DatabaseService) {
    this.db = this.dbService.getDB();
  }

  async createResetToken(userId: string): Promise<string> {
    const id = getUUIDV4();
    const token = crypto.randomBytes(32).toString('hex');
    
    // Expiration set to 1 hour
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    const tokenData: PasswordResetTokenCreate = withTimestamps({
      id,
      userId,
      token,
      expiresAt,
    });

    await this.db
      .insertInto('passwordResetTokens')
      .values(tokenData)
      .executeTakeFirst();

    return token;
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const result = await this.db
      .selectFrom('passwordResetTokens')
      .where('token', '=', token)
      .selectAll()
      .executeTakeFirst();

    return result || null;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('passwordResetTokens')
      .where('userId', '=', userId)
      .execute();

    return result.length > 0;
  }

  async deleteByToken(token: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('passwordResetTokens')
      .where('token', '=', token)
      .execute();

    return result.length > 0;
  }
}