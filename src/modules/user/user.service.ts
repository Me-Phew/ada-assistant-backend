import { Injectable, Logger } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import bcrypt from 'bcrypt';
import { UserObject } from './dtos/objects/user.object';
import { EmailAlreadyTakenException } from './exceptions/email-already-taken.exception';
import { UserRepositoy } from './repository/user.respository';
import { MailService } from '../mail/mail.service';
import { EmailVerificationRepository } from '../auth/repository/email-verification.repository';
import { UserRole } from '../../database/schema/common/role.enum';
import { UserModel } from './models/user.model';
import { UserNotFoundException } from './exceptions/user-not-found.exception';

const BCRYPT_HASH_ROUNDS = 10;

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepositoy: UserRepositoy,
    private readonly mailService: MailService,
    private readonly emailVerificationRepository: EmailVerificationRepository
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
    const token = await this.emailVerificationRepository.createVerificationToken(user.id);
    
    // Send verification email using Mailtrap
    await this.mailService.sendVerificationEmail(user.email, token);
    this.logger.log(`Verification email sent to ${user.email}`);

    return user.toDto();
  }

  async verifyEmail(token: string): Promise<boolean> {
    // Find the token
    const verificationToken = await this.emailVerificationRepository.findByToken(token);
    
    if (!verificationToken) {
      this.logger.warn(`Invalid verification token: ${token}`);
      return false;
    }

    // Check if token is expired
    const now = new Date();
    if (now > verificationToken.expiresAt) {
      this.logger.warn(`Expired verification token for user ${verificationToken.userId}`);
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
}
