import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class StudentAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      return false;
    }

    try {
      const payload = this.jwtService.verify(token);

      // Check if this is a student token
      if (payload.type !== 'student') {
        return false;
      }

      // Attach student info to request
      request.student = {
        assignmentId: payload.sub,
        candidateId: payload.candidate_id,
        studentId: payload.student_id,
        centerId: payload.center_id,
        testId: payload.test_id,
      };

      return true;
    } catch {
      return false;
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
