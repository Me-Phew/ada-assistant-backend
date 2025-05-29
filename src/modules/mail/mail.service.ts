import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    // Mailtrap transporter
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('mail.host'),
      port: this.configService.get('mail.port'),
      auth: {
        user: this.configService.get('mail.user'),
        pass: this.configService.get('mail.password'),
      }
    });
    
    this.logger.log('Email transporter created with Mailtrap');
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const appUrl = this.configService.get('appUrl') || 'http://localhost:3001';
    const verificationUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"Ada Voice Assistant" <${this.configService.get('mail.from') || 'noreply@adavoice.com'}>`,
    to,
    subject: 'Verify Your Email Address',
    text: `Please verify your email address by clicking on the link: ${verificationUrl}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f7f7f7;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-spacing: 0; border-collapse: collapse; box-shadow: 0 4px 10px rgba(0,0,0,0.08); border-radius: 12px; margin-top: 40px;">
            <!-- Header -->
            <tr>
              <td style="padding: 0;">
                <div style="height: 8px; background: linear-gradient(90deg, black 0%, black 100%); border-radius: 12px 12px 0 0;"></div>
              </td>
            </tr>
            
            <!-- Logo Section -->
            <tr>
                <td style="text-align: center; padding: 30px 0 20px;">
                    <div style="width: 100px; height: 100px; margin: 0 auto; background-color: black; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2Ny44NDQ5NjMiIHZpZXdCb3g9IjAgMCA2Ny44NDQ5NjMgNzUuNDgzNjQzIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAzNjggMjcyIiB4bWw6c3BhY2U9InByZXNlcnZlIiBoZWlnaHQ9Ijc1LjQ4MzY0MyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIGQ9Im0gMjAuNDMzODMsNS44NDU1MjQ5IGMgOC45ODM4MywtNy41OTk5NTMgMTcuNDExNTYsLTcuODIxNzkzIDI2LjU2MTIzLC0wLjQ3NDYyIDUuMTMwMDIsNC4xMTk0IDExLjM3OTAzLDYuODQyMzUwMSAxNy4xMTEwMywxMC4yMTYzMzAxIDIuNjY1MjIsMS41Njg4MiAzLjgwMzAyLDMuNzczNzcgMy43MzYwOSw3LjAyMTUzIC0wLjE5ODk5LDkuNjU1MTkgLTAuMjQxMSwxOS4zMjAzNSAtMC4wMjIyLDI4Ljk3NDI5IDAuMDk1Miw0LjE5NjUyIC0xLjQ0ODU3LDYuODkzNiAtNS4wNTExNiw4Ljg4MzI5IC03Ljg2NTE3LDQuMzQzODQgLTE1LjY3NzIxLDguNzg5MjkgLTIzLjQxNjQzLDEzLjM1MzUxIC0zLjg2NzU4LDIuMjgwOTMgLTcuMzAxMTYsMi4yMTQ1MSAtMTEuMTcyMzEsLTAuMTg2MjQgLTcuNjMwNjcsLTQuNzMyMjYgLTE1LjQ0OTE0LC05LjE2NjUxIC0yMy4yNTczMTMsLTEzLjYwNTUgLTMuMzgyNDg0LC0xLjkyMjk4IC00Ljk3NDc3Njk4LC00LjUzODQ0IC00LjkxMjc5NTk4LC04LjUwNTMzIDAuMTQ4Mjc3LC05LjQ5MDMxIDAuMTc0Mjg2LC0xOC45ODY4NSAtMC4wMDcyLC0yOC40NzU5NyAtMC4wNzYyOSwtMy45ODk4MiAxLjM3NzEwNDk4LC02LjU2MDc2IDQuOTA0MjUwOTgsLTguNDA5MjEgNS4xNTc3NzQsLTIuNzAzIDEwLjE0ODkzNCwtNS43MjM5MzAxIDE1LjUyNjczNCwtOC43OTIwODAxIG0gMTUuMzUzMDcsMjYuMTMyMzUwMSBjIC00LjA3NzI0LDAuODYxMDcgLTQuODYzNDQsLTEuNDU2ODMgLTQuODQyMTYsLTQuODIzMTcgMC4wMzgzLC02LjA1ODM0IDAuNTM5NSwtMTIuMTUzMTggLTAuNDc5NiwtMTguOTAxMDUwMSAtNy45MDE0MiwyLjg3ODcwMDEgLTE0LjA4NDY2LDcuMDU2NDkwMSAtMjEuMTU2MzgsMTEuNzUyMzgwMSA4LjA4OTY1LDQuNTk2NDMgMTUuMzg5OTgsOC43NTM2IDIyLjcwMTA2LDEyLjg5MTcyIDEuNzYzNDYsMC45OTgxNCAzLjE4MTE4LDAuMzg2NDYgNS4wNDk0NywtMS4yODgxNiA2Ljg5NzcsLTMuNzQ5MzggMTMuNzk1NDIsLTcuNDk4NzYgMjEuNzIxODEsLTExLjgwNzMxIC03LjcwNDQsLTQuNDg0NTIgLTE0LjI5NzYzLC04LjMyMjI2IC0yMi4zNTM2LC0xMy4wMTE0MjAxIDAsMTEuMzQxNDcwMSAwLDE1LjIxMjI4MDEgLTAuNjQwNiwyMy4xODcwMTAxIG0gLTcuODExNTYsNi4zNTI0MSBjIC02LjkwMDE3LC00LjM1MTk1IC0xMy44NTY0MSwtOC41OTY5NCAtMjEuNzU0OTA1LC0xMi4xMjkwOSAwLDguMTAyODcgMCwxNS4zOTcyNCAwLDIzLjQxMzQ2IDUuOTg2MDk1LC0zLjM1ODI5IDExLjMzMzAzNSwtNi4yODQ4IDE2LjU5Nzc3NSwtOS4zNTI0MSAxLjc3NzQyLC0xLjAzNTY2IDMuNDgyMjYsLTEuOTA4MjUgNS44NDcxMSwtMC43NjI3MyAxLjcyOTE2LDMuNjYyOTUgLTAuOTI2LDUuMDk4MDcgLTMuMzkyNjEsNi41NTcwNSAtNS4wNDY4NiwyLjk4NTE5IC0xMC4xMjcyNiw1LjkxMzY0IC0xNi4wODY0NSw5LjM4NTUgNy43NjUwNiw0LjE5OTEzIDE0LjA0MDYxLDguNjA5MSAyMS43NzI1MiwxMS44OTUxOSAwLC04LjcyNTA4IDAuMDI0OCwtMTYuNjQ5OCAtMC4wMTkxLC0yNC41NzQxMSAtMC4wMSwtMS43NzAxOCAtMC43NjIzMSwtMy4yMTE1NyAtMi45NjQzMSwtNC40MzI4NiBtIDguODA3MTQsMTYuMDUxMTEgYyAwLjM2NjczLDQuMTk5MTggLTAuNzc3NDgsOC41MjA1IDAuODY1OTYsMTMuMjg5MjkgNi45NjEwMywtMy45NDg3MSAxMy41MDk2OCwtNy42NjM1MSAyMC4zODA4MywtMTEuNTYxMjMgLTQuNTczNjUsLTQuNDI3MTUgLTkuOTg5NTgsLTYuMDM3NzMgLTE0LjQ3MDIzLC05LjEzMjI1IC0yLjMyMTE1LC0xLjYwMzA2IC02LjYyMTEyLC0yLjU0MzMyIC00LjQyMzU3LC02LjMzNzA1IDIuMDU4NywtMy41NTQwMSA1LjAzMTk5LC0wLjI5NTMzIDcuMzU1NzgsMC43ODU0NSA1LjAxNzU5LDIuMzMzNTkgOS40NzIxOCw1LjgzNTEzIDE0Ljg2MjU2LDcuNzEyNjkgMS4xMjQ5NCwtNi4wNTY3NiAwLjkwMDYyLC0xOC44NDMwOSAtMC4zNzAwMiwtMjIuNzMyNzkgLTQuMzgxNjEsMS4yMjIyMiAtNy45MzY5Miw0LjA0OTIzIC0xMS43NzcwMSw2LjIzMDI0IC0xNC45Mzk0Miw4LjQ4NDk5IC0xMS45NDQxOSw0LjE2MDM3IC0xMi40MjQzLDIxLjc0NTY1IHoiIC8+PC9zdmc+" 
                        alt="Ada Voice Assistant Logo" 
                        style="width: 60%; height: 60%; filter: brightness(1) invert(0);">
                    </div>
                </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 20px 40px 40px;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #333; text-align: center;">Verify Your Email Address</h1>
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #555;">Hello,</p>
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #555;">Welcome to Ada Voice Assistant! Please verify your email address to get started. This helps us keep your account secure.</p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background: black; color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; transition: all 0.3s; box-shadow: 0 4px 12px black;">
                    Verify My Email
                  </a>
                </div>
                
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #555;">This link will expire in 24 hours. If you didn't create an Ada Voice Assistant account, you can safely ignore this email.</p>
                
                <div style="margin: 40px 0 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                  <p style="margin: 0; font-size: 14px; color: #777;">If the button doesn't work, copy and paste this link into your browser:</p>
                  <p style="margin: 10px 0 0; font-size: 14px; color: black; word-break: break-all;">${verificationUrl}</p>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 12px 12px;">
                <p style="margin: 0; font-size: 14px; color: #777;">© ${new Date().getFullYear()} Ada Voice Assistant</p>
                <p style="margin: 10px 0 0; font-size: 14px; color: #777;">This is an automated message, please do not reply.</p>
              </td>
            </tr>
          </table>
          
          <!-- Spacing at bottom of email -->
          <div style="height: 40px;"></div>
        </body>
      </html>
    `,
  };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Verification email sent: ${info.messageId}`);
    } catch (error: any) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      throw new Error('Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<void> {
    const backendUrl = this.configService.get('appUrl') || 'http://localhost:3001';
    const resetUrl = `${backendUrl}/api/auth/reset-password?token=${token}`;

  const mailOptions = {
    from: `"Ada Voice Assistant" <${this.configService.get('mail.from') || 'noreply@adavoice.com'}>`,
    to,
    subject: 'Reset Your Password',
    text: `Please reset your password by clicking on the link: ${resetUrl}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333; background-color: #f7f7f7;">
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-spacing: 0; border-collapse: collapse; box-shadow: 0 4px 10px rgba(0,0,0,0.08); border-radius: 12px; margin-top: 40px;">
            <!-- Header -->
            <tr>
              <td style="padding: 0;">
                <div style="height: 8px; background: linear-gradient(90deg, black 0%, black 100%); border-radius: 12px 12px 0 0;"></div>
              </td>
            </tr>
            
            <!-- Logo Section -->
            <tr>
                <td style="text-align: center; padding: 30px 0 20px;">
                    <div style="width: 100px; height: 100px; margin: 0 auto; background-color: black; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <img src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2Ny44NDQ5NjMiIHZpZXdCb3g9IjAgMCA2Ny44NDQ5NjMgNzUuNDgzNjQzIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCAzNjggMjcyIiB4bWw6c3BhY2U9InByZXNlcnZlIiBoZWlnaHQ9Ijc1LjQ4MzY0MyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjZmZmZmZmIiBvcGFjaXR5PSIxIiBzdHJva2U9Im5vbmUiIGQ9Im0gMjAuNDMzODMsNS44NDU1MjQ5IGMgOC45ODM4MywtNy41OTk5NTMgMTcuNDExNTYsLTcuODIxNzkzIDI2LjU2MTIzLC0wLjQ3NDYyIDUuMTMwMDIsNC4xMTk0IDExLjM3OTAzLDYuODQyMzUwMSAxNy4xMTEwMywxMC4yMTYzMzAxIDIuNjY1MjIsMS41Njg4MiAzLjgwMzAyLDMuNzczNzcgMy43MzYwOSw3LjAyMTUzIC0wLjE5ODk5LDkuNjU1MTkgLTAuMjQxMSwxOS4zMjAzNSAtMC4wMjIyLDI4Ljk3NDI5IDAuMDk1Miw0LjE5NjUyIC0xLjQ0ODU3LDYuODkzNiAtNS4wNTExNiw4Ljg4MzI5IC03Ljg2NTE3LDQuMzQzODQgLTE1LjY3NzIxLDguNzg5MjkgLTIzLjQxNjQzLDEzLjM1MzUxIC0zLjg2NzU4LDIuMjgwOTMgLTcuMzAxMTYsMi4yMTQ1MSAtMTEuMTcyMzEsLTAuMTg2MjQgLTcuNjMwNjcsLTQuNzMyMjYgLTE1LjQ0OTE0LC05LjE2NjUxIC0yMy4yNTczMTMsLTEzLjYwNTUgLTMuMzgyNDg0LC0xLjkyMjk4IC00Ljk3NDc3Njk4LC00LjUzODQ0IC00LjkxMjc5NTk4LC04LjUwNTMzIDAuMTQ4Mjc3LC05LjQ5MDMxIDAuMTc0Mjg2LC0xOC45ODY4NSAtMC4wMDcyLC0yOC40NzU5NyAtMC4wNzYyOSwtMy45ODk4MiAxLjM3NzEwNDk4LC02LjU2MDc2IDQuOTA0MjUwOTgsLTguNDA5MjEgNS4xNTc3NzQsLTIuNzAzIDEwLjE0ODkzNCwtNS43MjM5MzAxIDE1LjUyNjczNCwtOC43OTIwODAxIG0gMTUuMzUzMDcsMjYuMTMyMzUwMSBjIC00LjA3NzI0LDAuODYxMDcgLTQuODYzNDQsLTEuNDU2ODMgLTQuODQyMTYsLTQuODIzMTcgMC4wMzgzLC02LjA1ODM0IDAuNTM5NSwtMTIuMTUzMTggLTAuNDc5NiwtMTguOTAxMDUwMSAtNy45MDE0MiwyLjg3ODcwMDEgLTE0LjA4NDY2LDcuMDU2NDkwMSAtMjEuMTU2MzgsMTEuNzUyMzgwMSA4LjA4OTY1LDQuNTk2NDMgMTUuMzg5OTgsOC43NTM2IDIyLjcwMTA2LDEyLjg5MTcyIDEuNzYzNDYsMC45OTgxNCAzLjE4MTE4LDAuMzg2NDYgNS4wNDk0NywtMS4yODgxNiA2Ljg5NzcsLTMuNzQ5MzggMTMuNzk1NDIsLTcuNDk4NzYgMjEuNzIxODEsLTExLjgwNzMxIC03LjcwNDQsLTQuNDg0NTIgLTE0LjI5NzYzLC04LjMyMjI2IC0yMi4zNTM2LC0xMy4wMTE0MjAxIDAsMTEuMzQxNDcwMSAwLDE1LjIxMjI4MDEgLTAuNjQwNiwyMy4xODcwMTAxIG0gLTcuODExNTYsNi4zNTI0MSBjIC02LjkwMDE3LC00LjM1MTk1IC0xMy44NTY0MSwtOC41OTY5NCAtMjEuNzU0OTA1LC0xMi4xMjkwOSAwLDguMTAyODcgMCwxNS4zOTcyNCAwLDIzLjQxMzQ2IDUuOTg2MDk1LC0zLjM1ODI5IDExLjMzMzAzNSwtNi4yODQ4IDE2LjU5Nzc3NSwtOS4zNTI0MSAxLjc3NzQyLC0xLjAzNTY2IDMuNDgyMjYsLTEuOTA4MjUgNS44NDcxMSwtMC43NjI3MyAxLjcyOTE2LDMuNjYyOTUgLTAuOTI2LDUuMDk4MDcgLTMuMzkyNjEsNi41NTcwNSAtNS4wNDY4NiwyLjk4NTE5IC0xMC4xMjcyNiw1LjkxMzY0IC0xNi4wODY0NSw5LjM4NTUgNy43NjUwNiw0LjE5OTEzIDE0LjA0MDYxLDguNjA5MSAyMS43NzI1MiwxMS44OTUxOSAwLC04LjcyNTA4IDAuMDI0OCwtMTYuNjQ5OCAtMC4wMTkxLC0yNC41NzQxMSAtMC4wMSwtMS43NzAxOCAtMC43NjIzMSwtMy4yMTE1NyAtMi45NjQzMSwtNC40MzI4NiBtIDguODA3MTQsMTYuMDUxMTEgYyAwLjM2NjczLDQuMTk5MTggLTAuNzc3NDgsOC41MjA1IDAuODY1OTYsMTMuMjg5MjkgNi45NjEwMywtMy45NDg3MSAxMy41MDk2OCwtNy42NjM1MSAyMC4zODA4MywtMTEuNTYxMjMgLTQuNTczNjUsLTQuNDI3MTUgLTkuOTg5NTgsLTYuMDM3NzMgLTE0LjQ3MDIzLC05LjEzMjI1IC0yLjMyMTE1LC0xLjYwMzA2IC02LjYyMTEyLC0yLjU0MzMyIC00LjQyMzU3LC02LjMzNzA1IDIuMDU4NywtMy41NTQwMSA1LjAzMTk5LC0wLjI5NTMzIDcuMzU1NzgsMC43ODU0NSA1LjAxNzU5LDIuMzMzNTkgOS40NzIxOCw1LjgzNTEzIDE0Ljg2MjU2LDcuNzEyNjkgMS4xMjQ5NCwtNi4wNTY3NiAwLjkwMDYyLC0xOC44NDMwOSAtMC4zNzAwMiwtMjIuNzMyNzkgLTQuMzgxNjEsMS4yMjIyMiAtNy45MzY5Miw0LjA0OTIzIC0xMS43NzcwMSw2LjIzMDI0IC0xNC45Mzk0Miw4LjQ4NDk5IC0xMS45NDQxOSw0LjE2MDM3IC0xMi40MjQzLDIxLjc0NTY1IHoiIC8+PC9zdmc+" 
                        alt="Ada Voice Assistant Logo" 
                        style="width: 60%; height: 60%; filter: brightness(1) invert(0);">
                    </div>
                </td>
            </tr>
            
            <!-- Content -->
            <tr>
              <td style="padding: 20px 40px 40px;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #333; text-align: center;">Reset Your Password</h1>
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #555;">Hello,</p>
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #555;">You've requested to reset your password for your Ada Voice Assistant account. Click the button below to set a new password.</p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: black; color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; transition: all 0.3s; box-shadow: 0 4px 12px black;">
                    Reset Password
                  </a>
                </div>
                
                <p style="margin: 20px 0; font-size: 16px; line-height: 1.6; color: #555;">This link will expire in 1 hour. If you didn't request to reset your password, you can safely ignore this email.</p>
                
                <div style="margin: 40px 0 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                  <p style="margin: 0; font-size: 14px; color: #777;">If the button doesn't work, copy and paste this link into your browser:</p>
                  <p style="margin: 10px 0 0; font-size: 14px; color: black; word-break: break-all;">${resetUrl}</p>
                </div>
              </td>
            </tr>
            
            <!-- Footer -->
            <tr>
              <td style="padding: 30px 40px; text-align: center; background-color: #f9f9f9; border-radius: 0 0 12px 12px;">
                <p style="margin: 0; font-size: 14px; color: #777;">© ${new Date().getFullYear()} Ada Voice Assistant</p>
                <p style="margin: 10px 0 0; font-size: 14px; color: #777;">This is an automated message, please do not reply.</p>
              </td>
            </tr>
          </table>
          
          <!-- Spacing at bottom of email -->
          <div style="height: 40px;"></div>
        </body>
      </html>
    `,
  };

  try {
    const info = await this.transporter.sendMail(mailOptions);
    this.logger.log(`Password reset email sent to ${to}`);
  } catch (error: any) {
    this.logger.error(`Failed to send password reset email to ${to}: ${error.message}`);
    throw new Error('Failed to send password reset email');
  }
}
}