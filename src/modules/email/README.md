# Email Service Module

Email service implementation using Nodemailer for the CRM CD Platform.

## Features

- ✉️ Send generic emails with HTML/text content
- 🎉 Welcome emails for new users
- 🔐 Password reset emails with tokens
- ✅ Email verification functionality
- 📢 Custom notification emails

## Configuration

Email service uses the following environment variables from `.env`:

```env
SMTP_HOST=uz01.ahost.uz
SMTP_PORT=465
SMTP_USERNAME=_mainaccount@mockmee.uz
SMTP_PASSWORD="your-password"
SMTP_ENCRYPTION=ssl
FRONTEND_URL=http://localhost:3000
```

## Usage

### 1. Import EmailModule

Add `EmailModule` to your module's imports:

```typescript
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule, /* other imports */],
  // ...
})
export class YourModule {}
```

### 2. Inject EmailService

```typescript
import { EmailService } from '../email/email.service';

@Injectable()
export class YourService {
  constructor(private emailService: EmailService) {}
}
```

### 3. Send Emails

#### Send Custom Email

```typescript
await this.emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Your Subject',
  html: '<h1>Hello!</h1><p>This is your email content</p>',
  text: 'Hello! This is your email content',
});
```

#### Send Welcome Email

```typescript
await this.emailService.sendWelcomeEmail('user@example.com', 'John Doe');
```

#### Send Password Reset Email

```typescript
await this.emailService.sendPasswordResetEmail('user@example.com', 'reset-token-here');
```

#### Send Verification Email

```typescript
await this.emailService.sendVerificationEmail('user@example.com', 'verification-token');
```

#### Send Notification Email

```typescript
await this.emailService.sendNotificationEmail(
  'user@example.com',
  'Important Update',
  'Your account has been updated successfully.'
);

// Send to multiple recipients
await this.emailService.sendNotificationEmail(
  ['user1@example.com', 'user2@example.com'],
  'Group Notification',
  'This is a message for multiple users.'
);
```

## Current Implementation

The email service is currently integrated with:

### Auth Module

- ✅ **Registration**: Sends welcome email to new users
- ✅ **Google OAuth**: Sends welcome email on first login
- ✅ **Forgot Password**: Sends password reset link via email
- ✅ **Reset Password**: Validates token and updates password

#### Auth Endpoints

```
POST /auth/register           - Sends welcome email after registration
POST /auth/forgot-password    - Sends password reset email
POST /auth/reset-password     - Resets password using token
```

## Error Handling

The service logs all errors but doesn't fail the main operation (e.g., user registration) if email sending fails. This ensures the core functionality continues even if the email service is temporarily unavailable.

## Future Enhancements

Consider adding:
- Email templates with better styling
- Email queue for batch processing
- Email tracking and analytics
- Scheduled email functionality
- Email templates management
- Multi-language support
