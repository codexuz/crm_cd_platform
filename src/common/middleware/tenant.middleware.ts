import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request - no longer needed for subdomain, but kept for compatibility
export interface TenantRequest extends Request {
  tenant?: {
    centerId?: number;
  };
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: TenantRequest, res: Response, next: NextFunction) {
    // No subdomain logic needed anymore
    // Center ID will be extracted from JWT token in controllers
    next();
  }
}
