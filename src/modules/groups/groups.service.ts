import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group, User, GroupLevel } from '../../entities';
import { CreateGroupDto, UpdateGroupDto, AddStudentToGroupDto, RemoveStudentFromGroupDto } from './dto/group.dto';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const { student_ids, ...groupData } = createGroupDto;

    // Verify teacher exists
    const teacher = await this.userRepository.findOne({ 
      where: { id: createGroupDto.teacher_id, is_active: true },
      relations: ['roles']
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${createGroupDto.teacher_id} not found`);
    }

    // Create group
    const group = this.groupRepository.create(groupData);
    const savedGroup = await this.groupRepository.save(group);

    // Add students if provided
    if (student_ids && student_ids.length > 0) {
      await this.addStudentsToGroup(savedGroup.id, student_ids);
    }

    return this.findOne(savedGroup.id);
  }

  async findAll(centerId?: number, teacherId?: number, level?: GroupLevel): Promise<Group[]> {
    const queryBuilder = this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.center', 'center')
      .leftJoinAndSelect('group.teacher', 'teacher')
      .leftJoinAndSelect('group.students', 'students')
      .where('group.is_active = :isActive', { isActive: true })
      .orderBy('group.created_at', 'DESC');

    if (centerId) {
      queryBuilder.andWhere('group.center_id = :centerId', { centerId });
    }

    if (teacherId) {
      queryBuilder.andWhere('group.teacher_id = :teacherId', { teacherId });
    }

    if (level) {
      queryBuilder.andWhere('group.level = :level', { level });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id, is_active: true },
      relations: ['center', 'teacher', 'students', 'students.roles'],
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    return group;
  }

  async findByTeacher(teacherId: number, centerId?: number): Promise<Group[]> {
    const queryBuilder = this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.center', 'center')
      .leftJoinAndSelect('group.students', 'students')
      .where('group.teacher_id = :teacherId', { teacherId })
      .andWhere('group.is_active = :isActive', { isActive: true })
      .orderBy('group.created_at', 'DESC');

    if (centerId) {
      queryBuilder.andWhere('group.center_id = :centerId', { centerId });
    }

    return queryBuilder.getMany();
  }

  async update(id: number, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const group = await this.findOne(id);

    // If teacher is being changed, verify new teacher exists
    if (updateGroupDto.teacher_id) {
      const teacher = await this.userRepository.findOne({ 
        where: { id: updateGroupDto.teacher_id, is_active: true },
        relations: ['roles']
      });

      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${updateGroupDto.teacher_id} not found`);
      }
    }

    await this.groupRepository.update(id, updateGroupDto);
    return this.findOne(id);
  }

  async addStudentsToGroup(groupId: number, studentIds: number[]): Promise<Group> {
    const group = await this.findOne(groupId);

    // Verify students exist and are active
    const students = await this.userRepository.find({
      where: studentIds.map(id => ({ id, is_active: true })),
      relations: ['roles']
    });

    if (students.length !== studentIds.length) {
      throw new BadRequestException('Some students not found or inactive');
    }

    // Check max students limit
    if (group.max_students && (group.students.length + students.length) > group.max_students) {
      throw new BadRequestException(`Adding these students would exceed the maximum limit of ${group.max_students}`);
    }

    // Add students to group (avoid duplicates)
    const existingStudentIds = group.students.map(s => s.id);
    const newStudents = students.filter(s => !existingStudentIds.includes(s.id));
    
    if (newStudents.length === 0) {
      throw new BadRequestException('All specified students are already in the group');
    }

    group.students.push(...newStudents);
    await this.groupRepository.save(group);

    return this.findOne(groupId);
  }

  async removeStudentsFromGroup(groupId: number, studentIds: number[]): Promise<Group> {
    const group = await this.findOne(groupId);

    // Filter out students to remove
    group.students = group.students.filter(student => !studentIds.includes(student.id));
    await this.groupRepository.save(group);

    return this.findOne(groupId);
  }

  async remove(id: number): Promise<void> {
    await this.groupRepository.update(id, { is_active: false });
  }

  async getGroupStats(centerId?: number) {
    const queryBuilder = this.groupRepository
      .createQueryBuilder('group')
      .leftJoin('group.students', 'students')
      .where('group.is_active = :isActive', { isActive: true });

    if (centerId) {
      queryBuilder.andWhere('group.center_id = :centerId', { centerId });
    }

    const totalGroups = await queryBuilder.getCount();

    const levelStats = await queryBuilder
      .select('group.level', 'level')
      .addSelect('COUNT(DISTINCT group.id)', 'groupCount')
      .addSelect('COUNT(students.id)', 'totalStudents')
      .groupBy('group.level')
      .getRawMany();

    const averageStudentsPerGroup = await queryBuilder
      .select('AVG(student_count.count)', 'average')
      .from(subQuery => {
        return subQuery
          .select('group.id', 'id')
          .addSelect('COUNT(students.id)', 'count')
          .from(Group, 'group')
          .leftJoin('group.students', 'students')
          .where('group.is_active = true')
          .groupBy('group.id');
      }, 'student_count')
      .getRawOne();

    return {
      totalGroups,
      levelBreakdown: levelStats.reduce((acc, curr) => {
        acc[curr.level] = {
          groups: parseInt(curr.groupCount),
          students: parseInt(curr.totalStudents)
        };
        return acc;
      }, {}),
      averageStudentsPerGroup: parseFloat(averageStudentsPerGroup?.average || '0'),
    };
  }
}