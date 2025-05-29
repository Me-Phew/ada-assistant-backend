import { CreatedAt, UpdatedAt } from './common/datetime';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface EmailVerificationTokenTable {
  id: Generated<string>;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
}

export type EmailVerificationToken = Selectable<EmailVerificationTokenTable>;
export type EmailVerificationTokenCreate = Insertable<EmailVerificationTokenTable>;
export type EmailVerificationTokenUpdate = Updateable<EmailVerificationTokenTable>;