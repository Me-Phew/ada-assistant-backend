import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { UserService } from '../user/user.service';
import { LoginResponseDto } from './dtos/login-response.dto';
import { LoginDto } from './dtos/login.dto';
import { EmailNotVerifiedException } from './exceptions/email-not-verified.exception';
import { InvalidLoginOrPasswordException } from './exceptions/invalid-login-or-password.exception';
import { PasswordResetRepository } from './repository/password-reset.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly passwordResetRepository: PasswordResetRepository,
  ) {}

  async loginUser(loginDto: LoginDto): Promise<LoginResponseDto> {
    const { login, password } = loginDto;
    const user = await this.userService.findUserByEmail(login);
    if (!user) {
      throw new InvalidLoginOrPasswordException();
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      throw new InvalidLoginOrPasswordException();
    }

    if (!user.verified) {
      throw new EmailNotVerifiedException();
    }

    const jwtPayload = { id: user.id };

    const accessToken = await this.jwtService.signAsync(jwtPayload, {
      issuer: 'api',
      subject: user.id,
      expiresIn: '1h',
    });

    const response: LoginResponseDto = {
      accessToken,
      user: user.toDto(),
    };

    return response;
  }

  async authenticateWithJwt(token: string) {
    const decodedJwt = await this.jwtService.verifyAsync(token);
    if (!decodedJwt) {
      throw new UnauthorizedException();
    }

    const id: string = decodedJwt['id'];
    const user = await this.userService.findUserById(id);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async requestPasswordReset(email: string): Promise<boolean> {
    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      return true;
    }

    await this.passwordResetRepository.deleteByUserId(user.id);

    const token = await this.passwordResetRepository.createResetToken(user.id);

    await this.mailService.sendPasswordResetEmail(user.email, token);

    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const resetToken = await this.passwordResetRepository.findByToken(token);

    if (!resetToken) {
      return false;
    }

    const now = new Date();
    if (now > resetToken.expiresAt) {
      await this.passwordResetRepository.deleteByToken(token);
      return false;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.userService.updateUserPassword(resetToken.userId, passwordHash);

    await this.passwordResetRepository.deleteByToken(token);

    return true;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<boolean> {
    const user = await this.userService.findUserById(userId);

    if (!user) {
      return false;
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      return false;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    return this.userService.updateUserPassword(userId, passwordHash);
  }
}
