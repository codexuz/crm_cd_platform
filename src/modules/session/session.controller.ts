import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SessionService } from './session.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('Sessions')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SessionController {
  constructor(private sessionService: SessionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active sessions for current user' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  async getUserSessions(@GetUser('userId') userId: string) {
    const sessions = await this.sessionService.getUserSessions(userId);
    return {
      count: sessions.length,
      sessions: sessions.map((session) => ({
        id: session.id,
        ip_address: session.ip_address,
        device_type: session.device_type,
        user_agent: session.user_agent,
        last_activity: session.last_activity,
        created_at: session.created_at,
      })),
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get session details by ID' })
  @ApiResponse({ status: 200, description: 'Session details retrieved' })
  @ApiResponse({ status: 401, description: 'Session not found' })
  async getSession(
    @Param('id') sessionId: string,
    @GetUser('userId') userId: string,
  ) {
    return this.sessionService.getSessionInfo(sessionId, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 200, description: 'Session revoked successfully' })
  @ApiResponse({ status: 401, description: 'Session not found' })
  async revokeSession(
    @Param('id') sessionId: string,
    @GetUser('userId') userId: string,
  ) {
    await this.sessionService.revokeSession(sessionId, userId);
    return { message: 'Session revoked successfully' };
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke all sessions except current one' })
  @ApiResponse({ status: 200, description: 'All sessions revoked' })
  async revokeAllSessions(@GetUser('userId') userId: string) {
    await this.sessionService.revokeAllSessions(userId);
    return { message: 'All other sessions have been revoked' };
  }
}
