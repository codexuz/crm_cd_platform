# OTP Authentication - Quick Reference

## Overview
Email-based OTP (One-Time Password) verification system for user authentication.

## User Registration & Login Flow

```
1. Register → 2. Receive OTP → 3. Verify OTP → 4. Login
```

### 1. Register User
```bash
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "securePass123",
  "role": "student"  # optional: student, teacher, owner
}

Response:
{
  "message": "Registration successful. Please check your email for verification code.",
  "email": "john@example.com"
}
```

### 2. User Receives OTP Email
- 6-digit code
- Valid for 10 minutes
- Sent to registered email

### 3. Verify OTP
```bash
POST /auth/verify-otp
{
  "email": "john@example.com",
  "otp": "123456"
}

Response:
{
  "message": "Email verified successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "center_id": null,
    "roles": ["student"]
  }
}
```

### 4. Login (After Verification)
```bash
POST /auth/login
{
  "email": "john@example.com",
  "password": "securePass123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}
```

## Additional Endpoints

### Resend OTP
```bash
POST /auth/resend-otp
{
  "email": "john@example.com"
}
```

### Request OTP for Existing User
```bash
POST /auth/send-otp
{
  "email": "john@example.com"
}
```

### Password Reset
```bash
# Request reset
POST /auth/forgot-password
{
  "email": "john@example.com"
}

# Reset with token
POST /auth/reset-password
{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePass123"
}
```

## Key Features

✅ 6-digit OTP codes  
✅ 10-minute expiration  
✅ Email delivery via SMTP  
✅ Email verification required before login  
✅ Welcome email after verification  
✅ Password reset functionality  

## Error Responses

### Email Not Verified
```json
{
  "statusCode": 401,
  "message": "Email not verified. Please verify your email first."
}
```

### Invalid OTP
```json
{
  "statusCode": 400,
  "message": "Invalid verification code"
}
```

### Expired OTP
```json
{
  "statusCode": 400,
  "message": "Verification code expired. Please request a new one."
}
```

### User Already Exists
```json
{
  "statusCode": 409,
  "message": "User with this email or phone already exists"
}
```

## Database Schema Changes

```sql
-- New columns in users table
email_verification_otp VARCHAR(6) NULL
email_verification_otp_expires TIMESTAMP NULL
email_verified BOOLEAN DEFAULT FALSE
```

## Environment Variables Required

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=465
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_ENCRYPTION=ssl
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

## Testing with curl

```bash
# Complete flow
# 1. Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"+123","password":"test123"}'

# 2. Check email for OTP

# 3. Verify
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'

# 4. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Use token
curl -X GET http://localhost:3000/protected-route \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Notes

1. **Rate Limiting**: Implement rate limiting on OTP endpoints
2. **OTP Storage**: Currently plain text - consider hashing for production
3. **Brute Force**: Add attempt limits for OTP verification
4. **Email Delivery**: Monitor delivery rates and implement fallbacks

## Next Steps

- [ ] Run database migration
- [ ] Test email delivery
- [ ] Implement rate limiting
- [ ] Add OTP attempt tracking
- [ ] Set up email monitoring
- [ ] Update frontend integration
