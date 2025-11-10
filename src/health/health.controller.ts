import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'CRM CD Platform',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({ status: 200, description: 'Detailed service health' })
  detailed() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'CRM CD Platform',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      env: process.env.NODE_ENV || 'development',
    };
  }
}