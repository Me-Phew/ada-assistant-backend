import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'database/database.service';
import { DB } from 'database/schema/db';
import { UserCreate, UserUpdate } from 'database/schema/users';
import { withTimestamps } from 'database/utils/datetime';
import { Kysely } from 'kysely';
import { getUUIDV4 } from 'utils/uuid';
import { UserModel } from '../models/user.model';
import { UserRole } from '../../../database/schema/common/role.enum';

@Injectable()
export class UserRepositoy {
  private readonly db: Kysely<DB>;
  constructor(private readonly dbService: DatabaseService) {
    this.db = this.dbService.getDB();
  }

  async createUser(createUserInput: UserCreate) {
    const id = getUUIDV4();

    const insertable: UserCreate = withTimestamps({
      id,
      ...createUserInput,
    });

    const result = await this.db
      .insertInto('users')
      .values(insertable)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    return new UserModel(result);
  }

  async updateUser(userId: string, updateData: Partial<UserUpdate>) {
    const updateWithTimestamps = withTimestamps({ ...updateData }, { createdAt: false });

    const result = await this.db
      .updateTable('users')
      .set(updateWithTimestamps)
      .where('id', '=', userId)
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    return new UserModel(result);
  }

  async getUserByEmail(email: string) {
    const result = await this.db
      .selectFrom('users')
      .where('email', '=', email.toLowerCase())
      .selectAll()
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    return new UserModel(result);
  }

  async getUserById(id: string) {
    const result = await this.db
      .selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();

    if (!result) {
      return null;
    }

    return UserModel.fromResult(result);
  }

  async getUsersByIds(ids: string[]) {
    const users = await this.db
      .selectFrom('users')
      .where('id', 'in', ids)
      .selectAll()
      .execute();

    return users.map((user) => new UserModel(user));
  }

  async getAllUsers() {
    const users = await this.db
      .selectFrom('users')
      .selectAll()
      .execute();

    return users.map(user => new UserModel(user));
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await this.db
      .deleteFrom('users')
      .where('id', '=', userId)
      .execute();
    
    return result.length > 0;
  }

  async getUsersByRole(role: UserRole): Promise<UserModel[]> {
    const users = await this.db
      .selectFrom('users')
      .where('role', '=', role)
      .selectAll()
      .execute();

    return users.map(user => new UserModel(user));
  }
}
