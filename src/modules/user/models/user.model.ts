import { User } from 'database/schema/users';
import { UserDto } from '../dtos/user.dto';
import { UserRole } from 'database/schema/common/role.enum';

export class UserModel implements User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  verified: boolean;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.passwordHash = user.passwordHash;
    this.verified = user.verified;
    this.role = user.role;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static fromResult(result: User): UserModel {
    return new UserModel(result);
  }

  // any calculated properties goes here
  get joined_years_ago() {
    return new Date().getFullYear() - this.createdAt.getFullYear();
  }

  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  toDto(): UserDto {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      verified: this.verified,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
