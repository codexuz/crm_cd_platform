import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Role, RoleName, Center, User } from '../entities';
import * as bcrypt from 'bcryptjs';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const roleRepository = app.get<Repository<Role>>(getRepositoryToken(Role));
  const centerRepository = app.get<Repository<Center>>(getRepositoryToken(Center));
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  try {
    // Create roles if they don't exist
    const roles = [
      { role_name: RoleName.ADMIN, description: 'System Administrator' },
      { role_name: RoleName.MANAGER, description: 'Center Manager' },
      { role_name: RoleName.TEACHER, description: 'IELTS Teacher' },
      { role_name: RoleName.STUDENT, description: 'IELTS Student' },
    ];

    for (const roleData of roles) {
      const existingRole = await roleRepository.findOne({
        where: { role_name: roleData.role_name },
      });

      if (!existingRole) {
        await roleRepository.save(roleData);
        console.log(`✅ Created role: ${roleData.role_name}`);
      } else {
        console.log(`⏭️  Role already exists: ${roleData.role_name}`);
      }
    }

    // Create a sample center
    const existingCenter = await centerRepository.findOne({ where: { name: 'Demo IELTS Center' } });
    let centerId: number;

    if (!existingCenter) {
      const center = await centerRepository.save({
        name: 'Demo IELTS Center',
        address: '123 Learning Street, Education City',
        owner_id: 1, // Will be updated after creating admin user
        phone: '+1234567890',
        email: 'info@demo-ielts.com',
        description: 'A demo IELTS learning center for testing purposes',
      });
      centerId = center.id;
      console.log('✅ Created demo center');
    } else {
      centerId = existingCenter.id;
      console.log('⏭️  Demo center already exists');
    }

    // Create admin user
    const adminRole = await roleRepository.findOne({ where: { role_name: RoleName.ADMIN } });
    const existingAdmin = await userRepository.findOne({ where: { email: 'admin@demo-ielts.com' } });

    if (!existingAdmin && adminRole) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = userRepository.create({
        name: 'System Administrator',
        email: 'admin@demo-ielts.com',
        phone: '+1234567891',
        password: hashedPassword,
        center_id: centerId,
        roles: [adminRole],
      });

      const savedAdmin = await userRepository.save(adminUser);
      
      // Update center owner_id
      await centerRepository.update(centerId, { owner_id: savedAdmin.id });
      
      console.log('✅ Created admin user: admin@demo-ielts.com / admin123');
    } else {
      console.log('⏭️  Admin user already exists');
    }

    console.log('🎉 Database seeding completed!');
    console.log('\n📋 Default Credentials:');
    console.log('Email: admin@demo-ielts.com');
    console.log('Password: admin123');
    console.log('\n🚀 You can now start the application!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await app.close();
  }
}

seed();