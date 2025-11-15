import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Session, TokenBlacklist } from '../../entities';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private sessionRepository: Repository<Session>,
    @InjectRepository(TokenBlacklist)
    private tokenBlacklistRepository: Repository<TokenBlacklist>,
    private jwtService: JwtService,
  ) {}

  async createSession(
    userId: string,
    token: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Session> {
    // Extract token expiration
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const decoded = this.jwtService.decode(token);
    const expiresAt = new Date((decoded as { exp: number }).exp * 1000);

    // Determine device type from user agent
    const deviceType = this.getDeviceType(userAgent);

    const session = this.sessionRepository.create({
      user_id: userId,
      token,
      ip_address: ipAddress,
      user_agent: userAgent,
      device_type: deviceType,
      expires_at: expiresAt,
      is_active: true,
      last_activity: new Date(),
    });

    return this.sessionRepository.save(session);
  }

  async updateLastActivity(token: string): Promise<void> {
    await this.sessionRepository.update(
      { token, is_active: true },
      { last_activity: new Date() },
    );
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    return this.sessionRepository.find({
      where: { user_id: userId, is_active: true },
      order: { last_activity: 'DESC' },
    });
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, user_id: userId },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    // Mark session as inactive
    session.is_active = false;
    await this.sessionRepository.save(session);

    // Add token to blacklist
    await this.blacklistToken(session.token, userId, 'revoked');
  }

  async revokeAllSessions(userId: string, exceptToken?: string): Promise<void> {
    const sessions = await this.sessionRepository.find({
      where: { user_id: userId, is_active: true },
    });

    for (const session of sessions) {
      if (exceptToken && session.token === exceptToken) {
        continue;
      }

      session.is_active = false;
      await this.sessionRepository.save(session);
      await this.blacklistToken(session.token, userId, 'revoked');
    }
  }

  async blacklistToken(
    token: string,
    userId: string,
    reason: string,
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const decoded = this.jwtService.decode(token);
    const expiresAt = new Date((decoded as { exp: number }).exp * 1000);

    const blacklistedToken = this.tokenBlacklistRepository.create({
      token,
      user_id: userId,
      reason,
      expires_at: expiresAt,
    });

    await this.tokenBlacklistRepository.save(blacklistedToken);
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.tokenBlacklistRepository.findOne({
      where: { token },
    });

    return !!blacklisted;
  }

  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();

    // Delete expired sessions
    await this.sessionRepository.delete({
      expires_at: LessThan(now),
    });

    // Delete expired blacklist entries
    await this.tokenBlacklistRepository.delete({
      expires_at: LessThan(now),
    });
  }

  private getDeviceType(userAgent?: string): string {
    if (!userAgent) return 'unknown';

    const ua = userAgent.toLowerCase();

    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }

    if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
        ua,
      )
    ) {
      return 'mobile';
    }

    return 'desktop';
  }

  async getSessionInfo(sessionId: string, userId: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, user_id: userId },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    return session;
  }

  async getActiveSessionCount(userId: string): Promise<number> {
    return this.sessionRepository.count({
      where: { user_id: userId, is_active: true },
    });
  }
}
