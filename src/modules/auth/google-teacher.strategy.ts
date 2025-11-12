import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleTeacherStrategy extends PassportStrategy(Strategy, 'google-teacher') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_TEACHER_CALLBACK_URL || 'http://localhost:3000/auth/google/teacher/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;
    
    const user = {
      google_id: id,
      email: emails[0].value,
      name: name.givenName + ' ' + name.familyName,
      avatar_url: photos[0].value,
      provider: 'google',
      accessToken,
      preferredRole: 'teacher',
    };

    const validatedUser = await this.authService.validateGoogleUser(user);
    done(null, validatedUser);
  }
}