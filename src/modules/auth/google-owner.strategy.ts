import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleOwnerStrategy extends PassportStrategy(
  Strategy,
  'google-owner',
) {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:
        process.env.GOOGLE_OWNER_CALLBACK_URL ||
        'http://localhost:3000/auth/google/owner/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const { id, name, emails, photos } = profile;

    const user = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      google_id: id,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      email: emails[0].value,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      name: name.givenName + ' ' + name.familyName,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      avatar_url: photos[0].value,
      provider: 'google',
      accessToken,
      preferredRole: 'owner',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const validatedUser = await this.authService.validateGoogleUser(user);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    done(null, validatedUser);
  }
}
