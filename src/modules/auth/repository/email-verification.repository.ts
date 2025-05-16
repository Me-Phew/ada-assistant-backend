import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'database/database.service';
import { DB } from 'database/schema/db';
import { Kysely } from 'kysely';
import { getUUIDV4 } from 'utils/uuid';
import { withTimestamps } from 'database/utils/datetime';
import { EmailVerificationTokenCreate, EmailVerificationToken } from 'database/schema/email-verification';
import * as crypto from 'crypto';

@Injectable()
export class EmailVerificationRepository {
  private readonly db: Kysely<DB>;

  constructor(private readonly dbService: DatabaseService) {
    this.db = this.dbService.getDB();
  }

  async createVerificationToken(userId: string): Promise<string> {
    const id = getUUIDV4();
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiration to 24 hours from now
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const tokenData: EmailVerificationTokenCreate = withTimestamps({
      id,
      userId,
      token,
      expiresAt,
    });

    await this.db
      .insertInto('emailVerificationTokens')
      .values(tokenData)
      .executeTakeFirst();

    return token;
  }

  async findByToken(token: string): Promise<EmailVerificationToken | null> {
    const result = await this.db
      .selectFrom('emailVerificationTokens')
      .where('token', '=', token)
      .selectAll()
      .executeTakeFirst();

    return result || null;
  }

  async deleteByUserId(userId: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('emailVerificationTokens')
      .where('userId', '=', userId)
      .execute();

    return !!result;
  }
}