# Google OAuth Authentication Setup

This document explains how to set up and use Google OAuth authentication in the CRM CD Platform.

## Prerequisites

1. **Google Cloud Console Setup**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API and Google OAuth2 API
   - Create OAuth 2.0 credentials (Web Application)

## Configuration

### 1. Google Cloud Console Configuration

1. In Google Cloud Console, go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
2. Choose "Web application" as the application type
3. Add authorized redirect URIs:
   - For development: `http://localhost:3000/auth/google/callback`
   - For production: `https://yourdomain.com/auth/google/callback`
4. Save the Client ID and Client Secret

### 2. Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend URL (where users are redirected after authentication)
FRONTEND_URL=http://localhost:3001
```

## Usage

### Authentication Flow

1. **Initiate Google OAuth**
   ```
   GET /auth/google
   ```
   Redirects the user to Google's OAuth consent screen.

2. **Google Callback**
   ```
   GET /auth/google/callback
   ```
   Google redirects here after user consent. The system:
   - Validates the Google user
   - Creates a new user account (if doesn't exist) or links to existing account
   - Generates a JWT token
   - Redirects to frontend with the token

### Frontend Integration

After successful authentication, users are redirected to:
```
${FRONTEND_URL}/auth/callback?token=${jwt_token}
```

The frontend should:
1. Extract the token from URL parameters
2. Store the token (localStorage, cookies, etc.)
3. Use the token for subsequent API requests

### API Endpoints

#### Local Authentication (existing)
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user

#### Google OAuth (new)
- `GET /auth/google` - Initiate Google OAuth flow
- `GET /auth/google/callback` - Google OAuth callback

## User Entity Changes

The `User` entity now includes:
- `google_id`: Unique Google user identifier
- `avatar_url`: User's Google profile picture
- `provider`: Authentication provider ('local', 'google')
- `password`: Now nullable (not required for Google users)

## Database Migration

Run the following SQL to update existing database:

```sql
ALTER TABLE users 
ADD COLUMN google_id VARCHAR(255) UNIQUE,
ADD COLUMN avatar_url VARCHAR(500),
ADD COLUMN provider VARCHAR(50) DEFAULT 'local',
ALTER COLUMN password DROP NOT NULL;
```

## Security Considerations

1. **JWT Security**: Ensure JWT_SECRET is strong and secure
2. **HTTPS**: Use HTTPS in production for OAuth callbacks
3. **CORS**: Configure CORS properly for your frontend domain
4. **Token Expiry**: JWT tokens expire in 7 days by default

## Testing

### Test Google OAuth Flow

1. Start the application: `npm run start:dev`
2. Visit: `http://localhost:3000/auth/google`
3. Complete Google OAuth consent
4. Verify redirection to frontend with token
5. Check database for new user creation

### Test User Creation

When a user authenticates with Google:
- If user exists (by email), Google info is linked to existing account
- If user doesn't exist, new user is created with:
  - Student role by default
  - Empty phone number (to be filled later)
  - Google profile information

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch"**
   - Ensure GOOGLE_CALLBACK_URL matches exactly with Google Console settings
   - Check for trailing slashes or protocol mismatches

2. **"Client ID not found"**
   - Verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are correct
   - Ensure Google APIs are enabled

3. **"Token verification failed"**
   - Check JWT_SECRET configuration
   - Verify token isn't expired

### Environment Variables Checklist
- [ ] GOOGLE_CLIENT_ID is set
- [ ] GOOGLE_CLIENT_SECRET is set  
- [ ] GOOGLE_CALLBACK_URL matches Google Console
- [ ] FRONTEND_URL is correct
- [ ] JWT_SECRET is configured

## Development vs Production

### Development
- Use `http://localhost:3000` for callback URLs
- Frontend typically runs on `http://localhost:3001`

### Production
- Use HTTPS for all URLs
- Update Google Console with production callback URLs
- Set secure environment variables
- Configure proper CORS settings

## Next Steps

1. Configure your Google Cloud Console
2. Set up environment variables
3. Test the OAuth flow
4. Integrate with your frontend application
5. Set up user profile completion for Google users (phone number, center assignment)