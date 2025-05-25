import { CreatedAt, UpdatedAt } from './common/datetime';
import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export interface PasswordResetTokenTable {
  id: Generated<string>;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
}

export type PasswordResetToken = Selectable<PasswordResetTokenTable>;
export type PasswordResetTokenCreate = Insertable<PasswordResetTokenTable>;
export type PasswordResetTokenUpdate = Updateable<PasswordResetTokenTable>;