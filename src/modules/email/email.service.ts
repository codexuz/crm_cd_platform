import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { SendEmailDto } from './dto/send-email.dto';

/**
 * EmailService - Handles all email operations using Nodemailer
 *
 * Usage in other modules:
 * 1. Import EmailModule in your module's imports array
 * 2. Inject EmailService in your service constructor:
 *    constructor(private emailService: EmailService) {}
 * 3. Use any of the available methods to send emails
 */
@Injectable()
export class EmailService {
  private transporter: Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = this.configService.get<number>('SMTP_PORT');
    const smtpUsername = this.configService.get<string>('SMTP_USERNAME');
    const smtpPassword = this.configService.get<string>('SMTP_PASSWORD');
    const smtpEncryption = this.configService.get<string>('SMTP_ENCRYPTION');

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpEncryption === 'ssl', // true for SSL (port 465), false for other ports
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });

    // Verify connection configuration
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('SMTP connection error:', error);
      } else {
        this.logger.log('SMTP server is ready to send emails');
      }
    });
  }

  async sendEmail(sendEmailDto: SendEmailDto): Promise<void> {
    const { to, subject, text, html, from } = sendEmailDto;

    const mailOptions = {
      from: from || this.configService.get<string>('SMTP_USERNAME'),
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html,
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        `Email sent successfully to ${mailOptions.to}: ${info.messageId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email to ${mailOptions.to}:`, error);
      throw error;
    }
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Welcome to CRM CD Platform',
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for joining our platform. We're excited to have you on board.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
      `,
      text: `Welcome, ${name}! Thank you for joining our platform.`,
    });
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;

    await this.sendEmail({
      to,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
      text: `Password Reset: ${resetUrl}`,
    });
  }

  async sendVerificationEmail(
    to: string,
    verificationToken: string,
  ): Promise<void> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${verificationToken}`;

    await this.sendEmail({
      to,
      subject: 'Email Verification',
      html: `
        <h1>Verify Your Email</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
      text: `Verify your email: ${verificationUrl}`,
    });
  }

  async sendNotificationEmail(
    to: string | string[],
    subject: string,
    message: string,
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>${subject}</h2>
          <p>${message}</p>
        </div>
      `,
      text: message,
    });
  }

  async sendOtpEmail(to: string, otp: string, name?: string): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Email Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">Email Verification</h1>
          ${name ? `<p>Hello ${name},</p>` : '<p>Hello,</p>'}
          <p>Your verification code is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in <strong>10 minutes</strong>.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `,
      text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
    });
  }
}
