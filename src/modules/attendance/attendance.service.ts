import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../../entities/attendance.entity';
import { User, Group, Center } from '../../entities';
import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  BulkCreateAttendanceDto,
} from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    @InjectRepository(Center)
    private centerRepository: Repository<Center>,
  ) {}

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    // Verify student exists
    const student = await this.userRepository.findOne({
      where: { id: createAttendanceDto.student_id, is_active: true },
    });
    if (!student) {
      throw new NotFoundException(
        `Student with ID ${createAttendanceDto.student_id} not found`,
      );
    }

    // Verify teacher exists
    const teacher = await this.userRepository.findOne({
      where: { id: createAttendanceDto.teacher_id, is_active: true },
    });
    if (!teacher) {
      throw new NotFoundException(
        `Teacher with ID ${createAttendanceDto.teacher_id} not found`,
      );
    }

    // Verify group exists
    const group = await this.groupRepository.findOne({
      where: { id: createAttendanceDto.group_id, is_active: true },
    });
    if (!group) {
      throw new NotFoundException(
        `Group with ID ${createAttendanceDto.group_id} not found`,
      );
    }

    // Verify center exists
    const center = await this.centerRepository.findOne({
      where: { id: createAttendanceDto.center_id, is_active: true },
    });
    if (!center) {
      throw new NotFoundException(
        `Center with ID ${createAttendanceDto.center_id} not found`,
      );
    }

    // Check if attendance already exists for this student, group, and date
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        student_id: createAttendanceDto.student_id,
        group_id: createAttendanceDto.group_id,
        taken_date: new Date(createAttendanceDto.taken_date),
      },
    });

    if (existingAttendance) {
      throw new BadRequestException(
        'Attendance record already exists for this student, group, and date',
      );
    }

    const attendance = this.attendanceRepository.create(createAttendanceDto);
    return this.attendanceRepository.save(attendance);
  }

  async bulkCreate(
    bulkCreateDto: BulkCreateAttendanceDto,
  ): Promise<Attendance[]> {
    const { student_ids, teacher_id, group_id, center_id, status, taken_date } =
      bulkCreateDto;

    // Verify teacher exists
    const teacher = await this.userRepository.findOne({
      where: { id: teacher_id, is_active: true },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${teacher_id} not found`);
    }

    // Verify group exists
    const group = await this.groupRepository.findOne({
      where: { id: group_id, is_active: true },
      relations: ['students'],
    });
    if (!group) {
      throw new NotFoundException(`Group with ID ${group_id} not found`);
    }

    // Verify center exists
    const center = await this.centerRepository.findOne({
      where: { id: center_id, is_active: true },
    });
    if (!center) {
      throw new NotFoundException(`Center with ID ${center_id} not found`);
    }

    // Verify all students exist
    const students = await this.userRepository.find({
      where: student_ids.map((id) => ({ id, is_active: true })),
    });

    if (students.length !== student_ids.length) {
      throw new BadRequestException('Some students not found or inactive');
    }

    // Check for existing attendance records
    const existingAttendances = await this.attendanceRepository.find({
      where: {
        group_id,
        taken_date: new Date(taken_date),
      },
    });

    const existingStudentIds = existingAttendances.map((a) => a.student_id);
    const newStudentIds = student_ids.filter(
      (id) => !existingStudentIds.includes(id),
    );

    if (newStudentIds.length === 0) {
      throw new BadRequestException(
        'Attendance records already exist for all specified students on this date',
      );
    }

    // Create attendance records
    const attendances = newStudentIds.map((student_id) =>
      this.attendanceRepository.create({
        student_id,
        teacher_id,
        group_id,
        center_id,
        status,
        taken_date,
      }),
    );

    return this.attendanceRepository.save(attendances);
  }

  async findAll(
    centerId?: string,
    groupId?: string,
    studentId?: string,
    teacherId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Attendance[]> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .leftJoinAndSelect('attendance.teacher', 'teacher')
      .leftJoinAndSelect('attendance.group', 'group')
      .leftJoinAndSelect('attendance.center', 'center')
      .orderBy('attendance.taken_date', 'DESC')
      .addOrderBy('attendance.created_at', 'DESC');

    if (centerId) {
      queryBuilder.andWhere('attendance.center_id = :centerId', { centerId });
    }

    if (groupId) {
      queryBuilder.andWhere('attendance.group_id = :groupId', { groupId });
    }

    if (studentId) {
      queryBuilder.andWhere('attendance.student_id = :studentId', {
        studentId,
      });
    }

    if (teacherId) {
      queryBuilder.andWhere('attendance.teacher_id = :teacherId', {
        teacherId,
      });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'attendance.taken_date BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('attendance.taken_date >= :startDate', {
        startDate: new Date(startDate),
      });
    } else if (endDate) {
      queryBuilder.andWhere('attendance.taken_date <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id },
      relations: ['student', 'teacher', 'group', 'center'],
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    return attendance;
  }

  async update(
    id: string,
    updateAttendanceDto: UpdateAttendanceDto,
  ): Promise<Attendance> {
    await this.findOne(id);

    await this.attendanceRepository.update(id, updateAttendanceDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.attendanceRepository.delete(id);
  }

  async getAttendanceStats(
    groupId?: string,
    centerId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('1=1');

    if (groupId) {
      queryBuilder.andWhere('attendance.group_id = :groupId', { groupId });
    }

    if (centerId) {
      queryBuilder.andWhere('attendance.center_id = :centerId', { centerId });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'attendance.taken_date BETWEEN :startDate AND :endDate',
        {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
      );
    }

    const totalRecords = await queryBuilder.getCount();

    const statusStats = await queryBuilder
      .select('attendance.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('attendance.status')
      .getRawMany();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const presentCount =
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      statusStats.find((s: any) => s.status === 'present')?.count || 0;
    const attendanceRate = totalRecords > 0 ? presentCount / totalRecords : 0;

    return {
      totalRecords,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      statusBreakdown: statusStats.reduce(
        (acc: Record<string, number>, curr: any) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
          acc[curr.status] = parseInt(curr.count);
          return acc;
        },
        {} as Record<string, number>,
      ),
      attendanceRate: Math.round(attendanceRate * 100),
    };
  }
}
