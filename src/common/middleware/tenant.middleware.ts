import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Center } from '../../entities';

// Extend Express Request to include tenant info
export interface TenantRequest extends Request {
  tenant?: {
    center: Center;
    subdomain: string;
  };
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Center)
    private centerRepository: Repository<Center>,
  ) {}

  async use(req: TenantRequest, res: Response, next: NextFunction) {
    try {
      const host = req.get('host') || req.headers.host;
      
      if (!host) {
        throw new BadRequestException('Host header is missing');
      }

      // Extract subdomain from host
      const subdomain = this.extractSubdomain(host);
      
      // If no subdomain (main domain), allow request to continue
      if (!subdomain) {
        return next();
      }

      // Find center by subdomain
      const center = await this.findCenterBySubdomain(subdomain);
      
      if (!center) {
        throw new BadRequestException(`Tenant '${subdomain}' not found`);
      }

      if (!center.is_active) {
        throw new BadRequestException(`Tenant '${subdomain}' is not active`);
      }

      // Attach tenant info to request
      req.tenant = {
        center,
        subdomain,
      };

      next();
    } catch (error) {
      throw new BadRequestException(`Invalid tenant: ${error.message}`);
    }
  }

  private extractSubdomain(host: string): string | null {
    // Remove port if present
    const hostname = host.split(':')[0];
    
    // Split by dots
    const parts = hostname.split('.');
    
    // If less than 3 parts, no subdomain (e.g., localhost, domain.com)
    if (parts.length < 3) {
      return null;
    }

    // Return the first part as subdomain (assuming format: subdomain.domain.com)
    const subdomain = parts[0];
    
    // Ignore common subdomains that aren't tenants
    if (['www', 'api', 'admin', 'app'].includes(subdomain.toLowerCase())) {
      return null;
    }

    return subdomain;
  }

  private async findCenterBySubdomain(subdomain: string): Promise<Center | null> {
    // You can implement different strategies:
    // 1. Store subdomain in center table
    // 2. Use center name/slug as subdomain
    // 3. Have a separate subdomain mapping table
    
    // Strategy 1: Add subdomain field to Center entity (recommended)
    return this.centerRepository.findOne({
      where: { subdomain: subdomain.toLowerCase() },
      relations: ['users'],
    });

    // Alternative Strategy 2: Use center name as slug
    // const slug = subdomain.toLowerCase().replace(/[^a-z0-9]/g, '-');
    // return this.centerRepository
    //   .createQueryBuilder('center')
    //   .where('LOWER(REPLACE(center.name, \' \', \'-\')) = :slug', { slug })
    //   .andWhere('center.is_active = :isActive', { isActive: true })
    //   .getOne();
  }
}