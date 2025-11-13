# Subscription-Based Access Control

## Overview

The CRM platform now includes subscription-based access control to restrict features based on a center's subscription plan (Basic, Pro, Enterprise).

## Components

### 1. Guards

#### SubscriptionGuard
Checks if a center has an active subscription before allowing access.

**Location:** `src/common/guards/subscription.guard.ts`

**Features:**
- Verifies center has an active subscription
- Checks subscription hasn't expired
- Attaches subscription to request for further validation

#### ModuleAccessGuard
Validates that the center's subscription plan includes the required modules.

**Location:** `src/common/guards/module-access.guard.ts`

**Features:**
- Checks if subscription includes required modules
- Returns detailed error messages about missing modules
- Works in conjunction with SubscriptionGuard

### 2. Decorators

#### @RequiresModules(...modules)
Marks routes that require specific modules to be enabled in the subscription.

**Example:**
\`\`\`typescript
@RequiresModules('leads', 'payments')
\`\`\`

#### @NoSubscriptionRequired()
Marks routes that don't require subscription validation (e.g., public endpoints).

**Example:**
\`\`\`typescript
@NoSubscriptionRequired()
@Get('public-info')
\`\`\`

## Usage Examples

### Controller-Level Protection

Apply to entire controller to protect all routes:

\`\`\`typescript
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
import { RequiresModules } from '../../common/decorators/subscription.decorator';

@ApiTags('Leads')
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard, ModuleAccessGuard)
@RequiresModules('leads')
@Controller('leads')
export class LeadsController {
  // All routes now require:
  // 1. Authentication (JwtAuthGuard)
  // 2. Proper role (RolesGuard)
  // 3. Active subscription (SubscriptionGuard)
  // 4. 'leads' module enabled (ModuleAccessGuard)
}
\`\`\`

### Route-Level Protection

Apply to specific routes:

\`\`\`typescript
@Controller('reports')
export class ReportsController {
  @Get('basic')
  @NoSubscriptionRequired()
  getBasicReport() {
    // Accessible without subscription
  }

  @Get('advanced')
  @UseGuards(SubscriptionGuard, ModuleAccessGuard)
  @RequiresModules('advanced_reporting')
  getAdvancedReport() {
    // Requires subscription with advanced_reporting
  }
}
\`\`\`

### Multiple Module Requirements

\`\`\`typescript
@Post('bulk-import')
@UseGuards(SubscriptionGuard, ModuleAccessGuard)
@RequiresModules('leads', 'api_access')
bulkImportLeads() {
  // Requires both 'leads' and 'api_access' modules
}
\`\`\`

## Subscription Plans & Features

### Basic Plan
- **Modules:** groups, attendance
- **Limits:** 10 users, 100 students, 5 groups
- **Storage:** 5 GB

### Pro Plan
- **Modules:** leads, groups, attendance, payments, salary
- **Limits:** 50 users, 500 students, 25 groups
- **Storage:** 50 GB
- **Features:** Custom branding, Priority support, Advanced reporting

### Enterprise Plan
- **Modules:** All modules (leads, groups, attendance, payments, salary, ielts)
- **Limits:** Unlimited users, students, groups
- **Storage:** 500 GB
- **Features:** All Pro features + API access

## Error Responses

### No Active Subscription
\`\`\`json
{
  "statusCode": 403,
  "message": "No active subscription found. Please subscribe to access this feature."
}
\`\`\`

### Subscription Expired
\`\`\`json
{
  "statusCode": 403,
  "message": "Your subscription has expired. Please renew to continue."
}
\`\`\`

### Missing Module Access
\`\`\`json
{
  "statusCode": 403,
  "message": "Your subscription plan does not include access to: leads, payments. Please upgrade your plan."
}
\`\`\`

## Implementation Checklist

When adding subscription protection to a controller:

1. ✅ Import guards:
   \`\`\`typescript
   import { SubscriptionGuard } from '../../common/guards/subscription.guard';
   import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
   \`\`\`

2. ✅ Import decorator:
   \`\`\`typescript
   import { RequiresModules } from '../../common/decorators/subscription.decorator';
   \`\`\`

3. ✅ Add guards to @UseGuards:
   \`\`\`typescript
   @UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard, ModuleAccessGuard)
   \`\`\`

4. ✅ Add @RequiresModules decorator:
   \`\`\`typescript
   @RequiresModules('module_name')
   \`\`\`

5. ✅ Add Subscription entity to module imports:
   \`\`\`typescript
   imports: [TypeOrmModule.forFeature([YourEntity, Subscription])]
   \`\`\`

## Current Protected Controllers

- ✅ **LeadsController** - Requires 'leads' module
- ✅ **PaymentsController** - Requires 'payments' module
- ✅ **SalaryController** - Requires 'salary' module

## Testing

### Test with cURL

\`\`\`bash
# Without active subscription (should fail)
curl -X GET http://localhost:3000/leads \\
  -H "Authorization: Bearer YOUR_TOKEN"

# With active subscription (should succeed)
curl -X POST http://localhost:3000/subscriptions \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "center_id": "CENTER_UUID",
    "plan_type": "pro",
    "start_date": "2025-11-13",
    "end_date": "2026-11-13"
  }'
\`\`\`

### Verify Module Access

\`\`\`typescript
// Check what modules are enabled
GET /subscriptions/center/:centerId/active

// Response includes features
{
  "id": "...",
  "plan_type": "pro",
  "features": {
    "enabled_modules": ["leads", "groups", "attendance", "payments", "salary"]
  }
}
\`\`\`

## Advanced Usage

### Access Subscription in Controllers

The subscription is attached to the request after passing through SubscriptionGuard:

\`\`\`typescript
@Get('check-limits')
async checkLimits(@Req() req: any) {
  const subscription = req.subscription;
  const maxStudents = subscription.features.max_students;
  
  // Use subscription limits in your logic
  return { maxStudents };
}
\`\`\`

### Custom Validation

Combine with custom logic:

\`\`\`typescript
@Post('add-student')
async addStudent(@Req() req: any, @Body() dto: AddStudentDto) {
  const subscription = req.subscription;
  const currentStudentCount = await this.getStudentCount(dto.center_id);
  
  if (subscription.features.max_students !== -1 && 
      currentStudentCount >= subscription.features.max_students) {
    throw new ForbiddenException('Student limit reached for your plan');
  }
  
  // Proceed with adding student
}
\`\`\`
