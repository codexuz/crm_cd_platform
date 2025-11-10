# Multi-Tenant Subdomain Setup Guide

## 🌐 Subdomain Multi-Tenancy Implementation

Your CRM platform now supports subdomain-based multi-tenancy where each learning center gets its own subdomain:

- `center1.yourdomain.com` → Center 1
- `center2.yourdomain.com` → Center 2  
- `app.yourdomain.com` → Main application

## 🏗️ Architecture Overview

### Middleware Flow:
1. **TenantMiddleware** extracts subdomain from request
2. **TenantGuard** enforces tenant-based access control
3. **Routes** can require or optionally use tenant context

### Database Changes:
- Added `subdomain` field to `centers` table
- Auto-generates subdomain from center name
- Ensures subdomain uniqueness

## 🚀 Deployment Options

### Option 1: Coolify Deployment

1. **Setup Coolify Project:**
```bash
# Create new project in Coolify
# Connect your Git repository
# Set environment variables from .env.production
```

2. **Domain Configuration:**
   - Main domain: `yourdomain.com` → redirects to `app.yourdomain.com`
   - Wildcard: `*.yourdomain.com` → handles all subdomains
   - SSL: Auto-generated via Let's Encrypt

3. **Environment Variables in Coolify:**
```env
DOMAIN=yourdomain.com
DB_HOST=mysql
DB_USERNAME=crm_user
DB_PASSWORD=secure_password
DB_DATABASE=crm_cd_platform
JWT_SECRET=your-jwt-secret
NODE_ENV=production
```

### Option 2: Docker Compose Deployment

```bash
# Clone repository
git clone https://github.com/your-username/crm_cd_platform.git
cd crm_cd_platform

# Configure environment
cp .env.production .env
# Edit .env with your settings

# Deploy with Docker Compose
docker-compose up -d

# Check services
docker-compose ps
```

### Option 3: Manual Docker Deployment

```bash
# Build image
docker build -t crm-platform .

# Run with environment
docker run -d \
  --name crm-app \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e DB_USERNAME=your-db-user \
  -e DB_PASSWORD=your-db-pass \
  -e DB_DATABASE=crm_cd_platform \
  -e JWT_SECRET=your-jwt-secret \
  crm-platform
```

## 🔧 DNS Configuration

### For Wildcard Subdomains:

1. **A Record:** `yourdomain.com` → `YOUR_SERVER_IP`
2. **CNAME:** `*.yourdomain.com` → `yourdomain.com`
3. **CNAME:** `app.yourdomain.com` → `yourdomain.com`

### Cloudflare DNS Example:
```
Type    Name                    Content
A       yourdomain.com          192.168.1.100
CNAME   *                       yourdomain.com
CNAME   app                     yourdomain.com
```

## 🎯 Usage Examples

### 1. Create Center with Subdomain:

```typescript
POST /centers
{
  "name": "IELTS Excellence Center",
  "subdomain": "ielts-excellence",  // optional - auto-generated if not provided
  "address": "123 Education Street",
  "owner_id": 1
}
```

### 2. Access Center via Subdomain:

```bash
# Access specific center
curl -H "Host: ielts-excellence.yourdomain.com" \
     https://yourdomain.com/api/leads

# Access main app
curl https://app.yourdomain.com/api/centers
```

### 3. Controller with Tenant Context:

```typescript
@Controller('dashboard')
@RequiresTenant() // Requires subdomain
export class DashboardController {
  
  @Get('stats')
  async getStats(@GetTenant('center') center: Center) {
    // Automatically filtered to tenant's center
    return this.dashboardService.getStats(center.id);
  }
}
```

### 4. Optional Tenant Routes:

```typescript
@Controller('public')
export class PublicController {
  
  @Get('info')
  @OptionalTenant() // Works with or without subdomain
  async getInfo(@GetTenant() tenant?: any) {
    if (tenant) {
      return `Welcome to ${tenant.center.name}`;
    }
    return 'Welcome to CRM Platform';
  }
}
```

## 🛡️ Security Features

### Automatic Tenant Isolation:
- Users can only access data from their center
- JWT tokens include `center_id` 
- Middleware validates subdomain → center mapping
- Guards enforce tenant-based permissions

### Access Control Matrix:
```
Role      | Own Center | Other Centers | Main App
----------|------------|---------------|----------
Admin     | Full       | Full          | Full
Manager   | Full       | None          | Limited  
Teacher   | Limited    | None          | None
Student   | Limited    | None          | None
```

## 🧪 Testing Subdomain Locally

### 1. Update `/etc/hosts` (Linux/Mac) or `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 app.localhost
127.0.0.1 center1.localhost  
127.0.0.1 center2.localhost
127.0.0.1 test-center.localhost
```

### 2. Start Development Server:

```bash
npm run start:dev
```

### 3. Test Subdomains:

```bash
# Main app
curl http://app.localhost:3000/health

# Tenant-specific (after creating centers)
curl http://center1.localhost:3000/api/leads
```

## 📊 Monitoring & Logs

### Health Checks:
- `/health` - Basic health check
- `/health/detailed` - Detailed system info

### Docker Health Check:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

### Logging Tenant Context:
```typescript
// Logs will include tenant info automatically
this.logger.log('Processing request', { 
  tenantId: request.tenant?.center.id,
  subdomain: request.tenant?.subdomain 
});
```

## 🚨 Troubleshooting

### Common Issues:

1. **Subdomain Not Working:**
   - Check DNS configuration
   - Verify center has subdomain in database
   - Check TenantMiddleware logs

2. **403 Tenant Access Denied:**
   - User's `center_id` doesn't match subdomain
   - JWT token invalid or expired
   - Center is inactive

3. **Docker Networking:**
   - Ensure containers are on same network
   - Check port mappings
   - Verify environment variables

### Debug Mode:
```bash
# Enable debug logging
NODE_ENV=development DEBUG=tenant:* npm run start:dev
```

## 🔄 Migration from Single Tenant

### 1. Database Migration:
```sql
-- Add subdomain column
ALTER TABLE centers ADD COLUMN subdomain VARCHAR(50) UNIQUE;

-- Generate subdomains for existing centers  
UPDATE centers SET subdomain = LOWER(REPLACE(name, ' ', '-')) WHERE subdomain IS NULL;
```

### 2. Update Existing Code:
- Add `@RequiresTenant()` to controllers that need tenant context
- Update services to filter by `center_id`
- Test subdomain routing

This implementation provides a robust, scalable multi-tenant architecture with full subdomain support for Coolify deployment! 🎉