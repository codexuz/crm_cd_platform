# SaaS Multi-Tenant Role & Privilege Management

## Overview

This CRM + IELTS Platform is now a **full SaaS multi-tenant application** with a comprehensive role-based access control (RBAC) system with granular privileges.

## Architecture

### Multi-Tenancy
- **Centers** act as tenants, each with their own isolated data and users
- Each center has a unique subdomain (e.g., `demo.edumoacademy.uz`)
- Super admins can manage all tenants from a single interface

### User Hierarchy

```
Super Admin (Platform Level)
    ↓
    └── Has access to ALL centers
    └── Can create/delete centers
    └── Can manage subscriptions
    
Center Admin (Tenant Level)
    ↓
    └── Has full access to their center only
    └── Can create users and assign roles
    └── Can create custom roles with specific privileges
    
Managers, Teachers, Students (Tenant Level)
    └── Have predefined or custom privileges within their center
```

## Entities

### 1. User Entity
- **is_super_admin**: Boolean flag for platform-level super admins
- **center_id**: Nullable - null for super admins, specific ID for tenant users
- **roles**: Many-to-many relationship with Role entity

### 2. Role Entity
- **role_name**: Enum (SUPER_ADMIN, ADMIN, MANAGER, TEACHER, STUDENT, CUSTOM)
- **center_id**: Nullable - null for system roles, specific ID for tenant-specific roles
- **is_system_role**: True for predefined roles
- **privileges**: Many-to-many relationship with Privilege entity

### 3. Privilege Entity
- **privilege_name**: Unique identifier (e.g., 'user:create', 'lead:update')
- **category**: Groups privileges (user_management, lead_management, etc.)
- **is_super_admin_only**: Some privileges reserved for super admin only

### 4. Center Entity (Tenant)
- **subdomain**: Unique subdomain for the tenant
- **subscription_plan**: FREE, BASIC, PROFESSIONAL, ENTERPRISE
- **max_users**: Limit based on subscription
- **max_students**: Limit based on subscription
- **features**: JSON array of enabled features

## Privilege Categories

### User Management
- `user:create` - Create new users
- `user:read` - View user information
- `user:update` - Update user data
- `user:delete` - Delete users
- `user:assign_roles` - Assign roles to users

### Role Management
- `role:create` - Create custom roles
- `role:read` - View roles
- `role:update` - Modify roles
- `role:delete` - Delete custom roles
- `role:assign_privileges` - Assign privileges to roles

### Center/Tenant Management (Super Admin Only)
- `center:create` - Create new centers/tenants
- `center:read` - View center information
- `center:update` - Update center details
- `center:delete` - Delete centers
- `center:manage_subscription` - Manage subscription plans

### Lead Management
- `lead:create`, `lead:read`, `lead:update`, `lead:delete`, `lead:assign`

### Group Management
- `group:create`, `group:read`, `group:update`, `group:delete`

### Payment Management
- `payment:create`, `payment:read`, `payment:update`, `payment:delete`

### Salary Management
- `salary:create`, `salary:read`, `salary:update`, `salary:delete`, `salary:approve`

### Test Management
- `test:create`, `test:read`, `test:update`, `test:delete`

### Reporting
- `report:view_all` - View all reports
- `report:export` - Export reports

### System Management (Super Admin Only)
- `system:settings` - Manage system settings
- `system:manage_all_tenants` - Manage all tenant centers
- `system:view_all_data` - View data across all tenants

## Default Credentials

After running the seed script:

### Super Admin (Platform Access)
```
Email:    superadmin@edumoacademy.uz
Password: SuperAdmin@2025
Access:   All centers, all features, all privileges
```

### Demo Center Admin (Tenant Access)
```
Email:    admin@demo.edumoacademy.uz
Password: Admin@2025
Subdomain: demo.edumoacademy.uz
Access:   Demo center only, admin privileges
```

## Usage

### 1. Run Database Migrations
```bash
npm run migration:run
```

### 2. Seed the Database
```bash
npm run seed
```

This will create:
- 46 privileges across all categories
- 1 super admin role with all privileges
- 4 tenant-specific roles (admin, manager, teacher, student)
- 1 demo center with Professional subscription
- 2 users (1 super admin, 1 center admin)

### 3. Protecting Routes with Privileges

```typescript
import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrivilegesGuard } from '../common/guards/privileges.guard';
import { RequirePrivileges } from '../common/decorators/privileges.decorator';
import { PrivilegeName } from '../entities';

@Controller('users')
@UseGuards(JwtAuthGuard, PrivilegesGuard)
export class UsersController {
  
  @Get()
  @RequirePrivileges(PrivilegeName.USER_READ)
  findAll() {
    // Only users with USER_READ privilege can access
  }

  @Post()
  @RequirePrivileges(PrivilegeName.USER_CREATE)
  create() {
    // Only users with USER_CREATE privilege can access
  }
  
  @Delete(':id')
  @RequirePrivileges(PrivilegeName.USER_DELETE)
  delete() {
    // Only users with USER_DELETE privilege can access
  }
}
```

### 4. Creating Custom Roles (Center Admin)

Center admins can create custom roles for their specific needs:

```typescript
POST /roles
{
  "role_name": "CUSTOM",
  "display_name": "Sales Manager",
  "description": "Manages leads and students",
  "center_id": 1,
  "privilege_names": [
    "lead:create",
    "lead:read",
    "lead:update",
    "lead:assign",
    "user:read"
  ]
}
```

### 5. Assigning Roles to Users

```typescript
POST /roles/assign
{
  "user_id": 5,
  "role_ids": [2, 3]
}
```

## Subscription Plans

### FREE
- Max 5 users
- Max 50 students
- Basic features only

### BASIC
- Max 10 users
- Max 100 students
- Standard features

### PROFESSIONAL
- Max 50 users
- Max 500 students
- All features except white-label

### ENTERPRISE
- Unlimited users
- Unlimited students
- All features including white-label
- Dedicated support

## Guards & Decorators

### JwtAuthGuard
Validates JWT token and loads user with roles and privileges

### TenantGuard
Ensures users can only access data from their own center (except super admin)

### PrivilegesGuard
Checks if user has required privileges to access a route

### Decorators
- `@RequirePrivileges(PrivilegeName.USER_CREATE)` - Require specific privilege
- `@GetUser()` - Get current user from request
- `@GetTenant()` - Get current center/tenant from request

## Super Admin Features

Super admins have special capabilities:
1. Access to all centers via platform dashboard
2. Create/delete centers
3. Manage subscriptions
4. View analytics across all tenants
5. Impersonate center admins for support
6. System-wide settings

## Security Considerations

1. **Tenant Isolation**: All queries should filter by center_id (except super admin)
2. **Privilege Validation**: Always use PrivilegesGuard for protected routes
3. **Password Hashing**: All passwords are hashed with bcryptjs
4. **JWT Tokens**: Include user, roles, and privileges in token payload
5. **Subdomain Validation**: Validate subdomain on login to ensure proper tenant

## Migration Path

If you have existing data:
1. Backup your database
2. Run migrations to add new columns
3. Update existing users to associate with centers
4. Assign appropriate roles and privileges
5. Test thoroughly before production deployment

## API Documentation

After starting the application, visit:
```
http://localhost:3000/api
```

For Swagger API documentation with all role and privilege endpoints.

## Support

For issues or questions:
- Super Admin Access Issues: Contact platform administrator
- Center-specific Issues: Contact your center admin
- Technical Issues: Create an issue in the repository
