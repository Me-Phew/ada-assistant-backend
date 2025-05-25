import { Injectable, Logger } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { UserRole } from '../../database/schema/common/role.enum';
import { UserUpdate } from '../../database/schema/users';
import { AdminCreateUserDto } from '../../modules/admin/dtos/admin-create-user.dto';
import { EmailVerificationRepository } from '../auth/repository/email-verification.repository';
import { MailService } from '../mail/mail.service';
import { UserObject } from './dtos/objects/user.object';
import { RegisterUserDto } from './dtos/register-user.dto';
import { EmailAlreadyTakenException } from './exceptions/email-already-taken.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UserModel } from './models/user.model';
import { UserRepositoy } from './repository/user.respository';

const BCRYPT_HASH_ROUNDS = 10;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepositoy: UserRepositoy,
    private readonly mailService: MailService,
    private readonly emailVerificationRepository: EmailVerificationRepository,
  ) {}

  /**
   * Register a new user
   *
   * @param {RegisterUserDto} registerUser
   * @memberof UserService
   */
  async registerUser(registerUser: RegisterUserDto) {
    const { email, password } = registerUser;

    const prevUser = await this.userRepositoy.getUserByEmail(
      email.toLowerCase(),
    );

    if (prevUser) {
      throw new EmailAlreadyTakenException(email);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_HASH_ROUNDS);

    const user = await this.userRepositoy.createUser({
      email: email.toLowerCase(),
      passwordHash,
      verified: false,
      role: UserRole.USER,
    });

    // Generate verification token
    const token =
      await this.emailVerificationRepository.createVerificationToken(user.id);

    // Send verification email using Mailtrap
    await this.mailService.sendVerificationEmail(user.email, token);
    this.logger.log(`Verification email sent to ${user.email}`);

    return user.toDto();
  }

  async verifyEmail(token: string): Promise<boolean> {
    // Find the token
    const verificationToken =
      await this.emailVerificationRepository.findByToken(token);

    if (!verificationToken) {
      this.logger.warn(`Invalid verification token: ${token}`);
      return false;
    }

    // Check if token is expired
    const now = new Date();
    if (now > verificationToken.expiresAt) {
      this.logger.warn(
        `Expired verification token for user ${verificationToken.userId}`,
      );
      return false;
    }

    // Update user as verified
    const user = await this.userRepositoy.getUserById(verificationToken.userId);

    if (!user) {
      this.logger.warn(`User not found for verification token: ${token}`);
      return false;
    }

    await this.userRepositoy.updateUser(user.id, { verified: true });
    this.logger.log(`Email verified for user ${user.email}`);

    // Delete the used token
    await this.emailVerificationRepository.deleteByUserId(user.id);

    return true;
  }

  async findUserByEmail(email: string) {
    return this.userRepositoy.getUserByEmail(email);
  }

  async findUserById(id: string) {
    return this.userRepositoy.getUserById(id);
  }

  async loadUsersByIdBatch(userIds: string[]): Promise<(Error | UserObject)[]> {
    const users = await this.userRepositoy.getUsersByIds(userIds);
    const userDtosMap = users.reduce<Map<string, UserObject>>(
      (result, user) => {
        result.set(user.id, user);
        return result;
      },
      new Map<string, UserObject>(),
    );

    return userIds.map(
      (userId) =>
        userDtosMap.get(userId) || new Error(`No user found for key ${userId}`),
    );
  }

  async findAllUsers(): Promise<UserModel[]> {
    return this.userRepositoy.getAllUsers();
  }

  async updateUserRole(userId: string, role: UserRole): Promise<UserModel> {
    const user = await this.userRepositoy.getUserById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    return this.userRepositoy.updateUser(userId, { role });
  }

  async createUserByAdmin(createUserDto: AdminCreateUserDto) {
    const {
      email,
      password,
      role = UserRole.USER,
      verified = true,
    } = createUserDto;

    const prevUser = await this.userRepositoy.getUserByEmail(
      email.toLowerCase(),
    );
    if (prevUser) {
      throw new EmailAlreadyTakenException(email);
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_HASH_ROUNDS);

    const user = await this.userRepositoy.createUser({
      email: email.toLowerCase(),
      passwordHash,
      verified,
      role,
    });

    this.logger.log(`Admin created user: ${user.id} (${user.email})`);
    return user.toDto();
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = await this.userRepositoy.getUserById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (user.role === UserRole.ADMIN) {
      const admins = await this.findUsersByRole(UserRole.ADMIN);
      if (admins.length <= 1) {
        throw new Error('Cannot delete the last admin user');
      }
    }

    const result = await this.userRepositoy.deleteUser(userId);
    this.logger.log(`User deleted: ${userId}`);

    return result;
  }

  async findUsersByRole(role: UserRole): Promise<UserModel[]> {
    return this.userRepositoy.getUsersByRole(role);
  }

  async updateUserDetails(
    userId: string,
    updateData: Partial<UserUpdate>,
  ): Promise<UserModel> {
    const user = await this.userRepositoy.getUserById(userId);

    if (!user) {
      throw new UserNotFoundException();
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepositoy.getUserByEmail(
        updateData.email,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new EmailAlreadyTakenException(updateData.email);
      }
    }

    return this.userRepositoy.updateUser(userId, updateData);
  }

  async updateUserPassword(userId: string, passwordHash: string): Promise<boolean> {
    const user = await this.userRepositoy.getUserById(userId);
    
    if (!user) {
      return false;
    }
    
    await this.userRepositoy.updateUser(userId, { passwordHash });
    this.logger.log(`Password updated for user ${userId}`);
    
    return true;
  }
}
