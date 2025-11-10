import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { User } from './user.entity';

export enum RoleName {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TEACHER = 'teacher',
  STUDENT = 'student'
}

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    type: 'enum',
    enum: RoleName,
    unique: true
  })
  role_name: RoleName;

  @Column({ length: 200, nullable: true })
  description: string;

  // Relations
  @ManyToMany(() => User, user => user.roles)
  users: User[];
}