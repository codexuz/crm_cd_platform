# Email OTP Authentication Migration

## Overview

The authentication system has been migrated from Google OAuth to email-based OTP (One-Time Password) verification.

## Database Changes

### User Entity Updates

Added new fields to the `users` table:

```sql
ALTER TABLE users 
  ADD COLUMN email_verification_otp VARCHAR(6) NULL,
  ADD COLUMN email_verification_otp_expires TIMESTAMP NULL,
  ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
```

## New Authentication Flow

### 1. Registration Flow

**Old Flow:**
1. User registers → Auto-login with JWT token
2. Optional: Google OAuth for registration

**New Flow:**
1. User registers → OTP sent to email
2. User verifies email with OTP code → Login with JWT token
3. Email must be verified before login

### 2. API Endpoints

#### Removed Endpoints
- `GET /auth/google/owner` - Initiate Google OAuth
- `GET /auth/google/owner/callback` - Google OAuth callback

#### New Endpoints

**Send OTP**
```
POST /auth/send-otp
Body: { "email": "user@example.com" }
Response: { "message": "Verification code sent to your email" }
```

**Verify OTP**
```
POST /auth/verify-otp
Body: { 
  "email": "user@example.com",
  "otp": "123456"
}
Response: {
  "message": "Email verified successfully",
  "access_token": "jwt-token",
  "user": { ... }
}
```

**Resend OTP**
```
POST /auth/resend-otp
Body: { "email": "user@example.com" }
Response: { "message": "Verification code sent to your email" }
```

**Register (Updated)**
```
POST /auth/register
Body: {
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "student" // optional
}
Response: {
  "message": "Registration successful. Please check your email for verification code.",
  "email": "user@example.com"
}
```

**Login (Updated)**
```
POST /auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
Response: {
  "access_token": "jwt-token",
  "user": { ... }
}
// Note: Will fail if email not verified
```

## OTP Details

- **Code Length:** 6 digits
- **Expiration:** 10 minutes
- **Delivery:** Email via SMTP
- **Format:** Numeric only (100000-999999)

## Email Templates

### OTP Email
Includes:
- Large, centered OTP code
- Expiration notice (10 minutes)
- Security reminder
- Professional styling

## Error Handling

### Common Error Responses

**Login - Email Not Verified**
```json
{
  "statusCode": 401,
  "message": "Email not verified. Please verify your email first."
}
```

**Invalid OTP**
```json
{
  "statusCode": 400,
  "message": "Invalid verification code"
}
```

**Expired OTP**
```json
{
  "statusCode": 400,
  "message": "Verification code expired. Please request a new one."
}
```

**Already Verified**
```json
{
  "statusCode": 400,
  "message": "Email already verified"
}
```

## Frontend Integration Example

### Registration + Verification Flow

```typescript
// Step 1: Register
const registerResponse = await fetch('/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    password: 'securePassword123'
  })
});

const { email } = await registerResponse.json();
// Show OTP input form

// Step 2: Verify OTP
const verifyResponse = await fetch('/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: email,
    otp: '123456' // from user input
  })
});

const { access_token, user } = await verifyResponse.json();
// Store token and redirect to dashboard

// Optional: Resend OTP if needed
const resendResponse = await fetch('/auth/resend-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: email })
});
```

## Removed Files

The following Google OAuth strategy files are no longer used:
- `src/modules/auth/google.strategy.ts`
- `src/modules/auth/google-student.strategy.ts`
- `src/modules/auth/google-teacher.strategy.ts`
- `src/modules/auth/google-owner.strategy.ts`

You can safely delete these files.

## Environment Variables

### Removed
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `GOOGLE_OWNER_CALLBACK_URL`

### Required (Existing)
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_ENCRYPTION`
- `FRONTEND_URL`
- `JWT_SECRET`

## Security Considerations

1. **OTP Security**
   - 10-minute expiration
   - Single-use codes
   - Stored as plain text (consider hashing for production)

2. **Rate Limiting**
   - Consider implementing rate limiting on OTP endpoints
   - Prevent brute force attacks

3. **Email Delivery**
   - Monitor email delivery success
   - Implement retry mechanism if needed

## Testing

### Test Registration Flow

```bash
# 1. Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "test123"
  }'

# 2. Check email for OTP code

# 3. Verify OTP
curl -X POST http://localhost:3000/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'

# 4. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123"
  }'
```

## Migration Checklist

- [x] Remove Google OAuth strategies from auth module
- [x] Add OTP fields to User entity
- [x] Implement OTP generation and verification
- [x] Update registration to send OTP
- [x] Add email verification check to login
- [x] Create OTP email template
- [x] Add OTP endpoints to controller
- [x] Remove Google OAuth environment variables
- [ ] Run database migration to add new columns
- [ ] Delete unused Google OAuth strategy files
- [ ] Update frontend registration flow
- [ ] Test complete registration + verification flow
- [ ] Configure rate limiting for OTP endpoints
- [ ] Monitor email delivery metrics
