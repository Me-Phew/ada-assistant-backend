import { Generated, Insertable, Selectable, Updateable } from 'kysely';
import { CreatedAt, UpdatedAt } from './common/datetime';
import { UserRole } from './common/role.enum';

export interface UserTable {
  id: Generated<string>;
  name: string;
  email: string;
  passwordHash: string;
  verified: boolean;
  role: UserRole;
  createdAt: CreatedAt;
  updatedAt: UpdatedAt;
}

export type User = Selectable<UserTable>;
export type UserCreate = Insertable<UserTable>;
export type UserUpdate = Updateable<UserTable>;
