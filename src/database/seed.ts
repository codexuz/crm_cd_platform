import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository, IsNull } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Role,
  RoleName,
  Center,
  User,
  Privilege,
  PrivilegeName,
  SubscriptionPlan,
} from '../entities';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
  const centerRepository = app.get<Repository<Center>>(
    getRepositoryToken(Center),
  );
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  const privilegeRepository = app.get<Repository<Privilege>>(
    getRepositoryToken(Privilege),
  );

  try {
    console.log('🌱 Starting database seeding...\n');

    // ========== STEP 1: Create Privileges ==========
    console.log('📋 Creating privileges...');
    const privilegeData = [
      // User Management
      {
        privilege_name: PrivilegeName.USER_CREATE,
        display_name: 'Create Users',
        description: 'Can create new users',
        category: 'user_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.USER_READ,
        display_name: 'View Users',
        description: 'Can view user information',
        category: 'user_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.USER_UPDATE,
        display_name: 'Update Users',
        description: 'Can update user information',
        category: 'user_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.USER_DELETE,
        display_name: 'Delete Users',
        description: 'Can delete users',
        category: 'user_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.USER_ASSIGN_ROLES,
        display_name: 'Assign Roles',
        description: 'Can assign roles to users',
        category: 'user_management',
        is_super_admin_only: false,
      },

      // Role Management
      {
        privilege_name: PrivilegeName.ROLE_CREATE,
        display_name: 'Create Roles',
        description: 'Can create custom roles',
        category: 'role_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.ROLE_READ,
        display_name: 'View Roles',
        description: 'Can view roles',
        category: 'role_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.ROLE_UPDATE,
        display_name: 'Update Roles',
        description: 'Can update roles',
        category: 'role_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.ROLE_DELETE,
        display_name: 'Delete Roles',
        description: 'Can delete custom roles',
        category: 'role_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.ROLE_ASSIGN_PRIVILEGES,
        display_name: 'Assign Privileges',
        description: 'Can assign privileges to roles',
        category: 'role_management',
        is_super_admin_only: false,
      },

      // Center/Tenant Management
      {
        privilege_name: PrivilegeName.CENTER_CREATE,
        display_name: 'Create Centers',
        description: 'Can create new centers',
        category: 'center_management',
        is_super_admin_only: true,
      },
      {
        privilege_name: PrivilegeName.CENTER_READ,
        display_name: 'View Centers',
        description: 'Can view center information',
        category: 'center_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.CENTER_UPDATE,
        display_name: 'Update Centers',
        description: 'Can update center information',
        category: 'center_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.CENTER_DELETE,
        display_name: 'Delete Centers',
        description: 'Can delete centers',
        category: 'center_management',
        is_super_admin_only: true,
      },
      {
        privilege_name: PrivilegeName.CENTER_MANAGE_SUBSCRIPTION,
        display_name: 'Manage Subscriptions',
        description: 'Can manage center subscriptions',
        category: 'center_management',
        is_super_admin_only: true,
      },

      // Lead Management
      {
        privilege_name: PrivilegeName.LEAD_CREATE,
        display_name: 'Create Leads',
        description: 'Can create new leads',
        category: 'lead_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.LEAD_READ,
        display_name: 'View Leads',
        description: 'Can view leads',
        category: 'lead_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.LEAD_UPDATE,
        display_name: 'Update Leads',
        description: 'Can update leads',
        category: 'lead_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.LEAD_DELETE,
        display_name: 'Delete Leads',
        description: 'Can delete leads',
        category: 'lead_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.LEAD_ASSIGN,
        display_name: 'Assign Leads',
        description: 'Can assign leads to users',
        category: 'lead_management',
        is_super_admin_only: false,
      },

      // Group Management
      {
        privilege_name: PrivilegeName.GROUP_CREATE,
        display_name: 'Create Groups',
        description: 'Can create new groups',
        category: 'group_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.GROUP_READ,
        display_name: 'View Groups',
        description: 'Can view groups',
        category: 'group_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.GROUP_UPDATE,
        display_name: 'Update Groups',
        description: 'Can update groups',
        category: 'group_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.GROUP_DELETE,
        display_name: 'Delete Groups',
        description: 'Can delete groups',
        category: 'group_management',
        is_super_admin_only: false,
      },

      // Payment Management
      {
        privilege_name: PrivilegeName.PAYMENT_CREATE,
        display_name: 'Create Payments',
        description: 'Can create payment records',
        category: 'payment_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.PAYMENT_READ,
        display_name: 'View Payments',
        description: 'Can view payments',
        category: 'payment_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.PAYMENT_UPDATE,
        display_name: 'Update Payments',
        description: 'Can update payments',
        category: 'payment_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.PAYMENT_DELETE,
        display_name: 'Delete Payments',
        description: 'Can delete payments',
        category: 'payment_management',
        is_super_admin_only: false,
      },

      // Salary Management
      {
        privilege_name: PrivilegeName.SALARY_CREATE,
        display_name: 'Create Salaries',
        description: 'Can create salary records',
        category: 'salary_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.SALARY_READ,
        display_name: 'View Salaries',
        description: 'Can view salaries',
        category: 'salary_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.SALARY_UPDATE,
        display_name: 'Update Salaries',
        description: 'Can update salaries',
        category: 'salary_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.SALARY_DELETE,
        display_name: 'Delete Salaries',
        description: 'Can delete salaries',
        category: 'salary_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.SALARY_APPROVE,
        display_name: 'Approve Salaries',
        description: 'Can approve salary payments',
        category: 'salary_management',
        is_super_admin_only: false,
      },

      // Test Management
      {
        privilege_name: PrivilegeName.TEST_CREATE,
        display_name: 'Create Tests',
        description: 'Can create tests',
        category: 'test_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.TEST_READ,
        display_name: 'View Tests',
        description: 'Can view tests',
        category: 'test_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.TEST_UPDATE,
        display_name: 'Update Tests',
        description: 'Can update tests',
        category: 'test_management',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.TEST_DELETE,
        display_name: 'Delete Tests',
        description: 'Can delete tests',
        category: 'test_management',
        is_super_admin_only: false,
      },

      // Reports
      {
        privilege_name: PrivilegeName.REPORT_VIEW_ALL,
        display_name: 'View All Reports',
        description: 'Can view all reports',
        category: 'reporting',
        is_super_admin_only: false,
      },
      {
        privilege_name: PrivilegeName.REPORT_EXPORT,
        display_name: 'Export Reports',
        description: 'Can export reports',
        category: 'reporting',
        is_super_admin_only: false,
      },

      // System Management
      {
        privilege_name: PrivilegeName.SYSTEM_SETTINGS,
        display_name: 'System Settings',
        description: 'Can manage system settings',
        category: 'system',
        is_super_admin_only: true,
      },
      {
        privilege_name: PrivilegeName.SYSTEM_MANAGE_ALL_TENANTS,
        display_name: 'Manage All Tenants',
        description: 'Can manage all tenant centers',
        category: 'system',
        is_super_admin_only: true,
      },
      {
        privilege_name: PrivilegeName.SYSTEM_VIEW_ALL_DATA,
        display_name: 'View All Data',
        description: 'Can view data across all tenants',
        category: 'system',
        is_super_admin_only: true,
      },
    ];

    const createdPrivileges: Privilege[] = [];
    for (const privData of privilegeData) {
      const existing = await privilegeRepository.findOne({
        where: { privilege_name: privData.privilege_name },
      });

      if (!existing) {
        const privilege = await privilegeRepository.save(privData);
        createdPrivileges.push(privilege);
        console.log(`  ✅ Created privilege: ${privData.display_name}`);
      } else {
        createdPrivileges.push(existing);
        console.log(`  ⏭️  Privilege exists: ${privData.display_name}`);
      }
    }

    // Get all privileges for super admin
    const allPrivileges = await privilegeRepository.find();

    // ========== STEP 2: Create System Roles ==========
    console.log('\n👥 Creating system roles...');

    // Super Admin Role (no center_id)
    let superAdminRole = await roleRepository.findOne({
      where: { role_name: RoleName.SUPER_ADMIN, center_id: IsNull() },
      relations: ['privileges'],
    });

    if (!superAdminRole) {
      superAdminRole = roleRepository.create({
        role_name: RoleName.SUPER_ADMIN,
        display_name: 'Super Administrator',
        description: 'Full system access across all tenants',
        center_id: null,
        is_system_role: true,
        privileges: allPrivileges,
      });
      await roleRepository.save(superAdminRole);
      console.log(
        '  ✅ Created role: Super Administrator (with all privileges)',
      );
    } else {
      console.log('  ⏭️  Role exists: Super Administrator');
    }

    // ========== STEP 3: Create Super Admin User ==========
    console.log('\n🦸 Creating super admin user...');
    const existingSuperAdmin = await userRepository.findOne({
      where: { email: 'superadmin@edumoacademy.uz' },
    });

    let superAdmin: User;
    if (!existingSuperAdmin) {
      const hashedPassword = await bcrypt.hash('SuperAdmin@2025', 10);

      superAdmin = userRepository.create({
        name: 'Super Administrator',
        email: 'superadmin@edumoacademy.uz',
        phone: '+998900000000',
        password: hashedPassword,
        center_id: null,
        is_super_admin: true,
        roles: [superAdminRole],
      });

      await userRepository.save(superAdmin);
      console.log('  ✅ Created super admin user');
      console.log('     Email: superadmin@edumoacademy.uz');
      console.log('     Password: SuperAdmin@2025');
    } else {
      superAdmin = existingSuperAdmin;
      console.log('  ⏭️  Super admin user already exists');
    }

    // ========== STEP 4: Create Demo Center ==========
    console.log('\n🏢 Creating demo center...');
    const existingCenter = await centerRepository.findOne({
      where: { subdomain: 'demo' },
    });

    let centerId: number;
    if (!existingCenter) {
      const center = await centerRepository.save({
        name: 'Demo IELTS Center',
        subdomain: 'demo',
        address: '123 Learning Street, Tashkent, Uzbekistan',
        owner_id: superAdmin.id,
        phone: '+998901234567',
        email: 'info@demo.edumoacademy.uz',
        description: 'Demo IELTS learning center for testing',
        subscription_plan: SubscriptionPlan.PROFESSIONAL,
        subscription_start_date: new Date(),
        subscription_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        max_users: 50,
        max_students: 500,
        features: ['all_features_enabled'],
      });
      centerId = center.id;
      console.log('  ✅ Created demo center with Professional plan');
    } else {
      centerId = existingCenter.id;
      console.log('  ⏭️  Demo center already exists');
    }

    // ========== STEP 5: Create Tenant-Specific Roles ==========
    console.log('\n🎭 Creating tenant-specific roles for demo center...');

    // Get privileges for each role type
    const adminPrivileges = allPrivileges.filter(
      (p) => !p.is_super_admin_only && !p.privilege_name.includes('system:'),
    );

    const managerPrivileges = allPrivileges.filter(
      (p) =>
        p.category !== 'system' &&
        p.category !== 'center_management' &&
        !p.privilege_name.includes('delete'),
    );

    const teacherPrivileges = allPrivileges.filter(
      (p) =>
        ['group_management', 'test_management', 'reporting'].includes(
          p.category,
        ) && !p.privilege_name.includes('delete'),
    );

    const tenantRoles = [
      {
        role_name: RoleName.ADMIN,
        display_name: 'Center Admin',
        description: 'Center administrator with full access',
        privileges: adminPrivileges,
      },
      {
        role_name: RoleName.MANAGER,
        display_name: 'Center Manager',
        description: 'Manages leads, students, and operations',
        privileges: managerPrivileges,
      },
      {
        role_name: RoleName.TEACHER,
        display_name: 'IELTS Teacher',
        description: 'Manages groups and student tests',
        privileges: teacherPrivileges,
      },
      {
        role_name: RoleName.STUDENT,
        display_name: 'Student',
        description: 'IELTS student with limited access',
        privileges: [],
      },
    ];

    for (const roleData of tenantRoles) {
      const existingRole = await roleRepository.findOne({
        where: { role_name: roleData.role_name, center_id: centerId },
      });

      if (!existingRole) {
        const role = roleRepository.create({
          ...roleData,
          center_id: centerId,
          is_system_role: true,
        });
        await roleRepository.save(role);
        console.log(
          `  ✅ Created role: ${roleData.display_name} (${roleData.privileges.length} privileges)`,
        );
      } else {
        console.log(`  ⏭️  Role exists: ${roleData.display_name}`);
      }
    }

    // ========== STEP 6: Create Demo Admin User ==========
    console.log('\n👤 Creating demo center admin...');
    const adminRole = await roleRepository.findOne({
      where: { role_name: RoleName.ADMIN, center_id: centerId },
    });

    const existingDemoAdmin = await userRepository.findOne({
      where: { email: 'admin@demo.edumoacademy.uz' },
    });

    if (!existingDemoAdmin && adminRole) {
      const hashedPassword = await bcrypt.hash('Admin@2025', 10);

      const demoAdmin = userRepository.create({
        name: 'Demo Center Admin',
        email: 'admin@demo.edumoacademy.uz',
        phone: '+998901234568',
        password: hashedPassword,
        center_id: centerId,
        is_super_admin: false,
        roles: [adminRole],
      });

      await userRepository.save(demoAdmin);
      console.log('  ✅ Created demo center admin user');
      console.log('     Email: admin@demo.edumoacademy.uz');
      console.log('     Password: Admin@2025');
    } else {
      console.log('  ⏭️  Demo admin user already exists');
    }

    // ========== SUMMARY ==========
    console.log('\n' + '='.repeat(60));
    console.log('🎉 Database seeding completed successfully!');
    console.log('='.repeat(60));
    console.log('\n📋 CREDENTIALS:');
    console.log('\n🦸 Super Admin (Access to all tenants):');
    console.log('   Email:    superadmin@edumoacademy.uz');
    console.log('   Password: SuperAdmin@2025');
    console.log('   Access:   All centers, all features');
    console.log('\n👤 Demo Center Admin:');
    console.log('   Email:    admin@demo.edumoacademy.uz');
    console.log('   Password: Admin@2025');
    console.log('   Subdomain: demo.edumoacademy.uz');
    console.log('   Access:   Demo center only');
    console.log('\n📊 Summary:');
    console.log(`   • Privileges created: ${allPrivileges.length}`);
    console.log(`   • Centers created: 1 (Demo)`);
    console.log(`   • Roles created: 5 (1 super admin + 4 tenant roles)`);
    console.log(`   • Users created: 2 (1 super admin + 1 center admin)`);
    console.log('\n🚀 You can now start the application!');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await app.close();
  }
}

seed();
