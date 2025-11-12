import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { GroupsService } from './groups.service';
import { CreateGroupDto, UpdateGroupDto, AddStudentToGroupDto, RemoveStudentFromGroupDto } from './dto/group.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoleName, GroupLevel } from '../../entities';

@ApiTags('Groups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Create a new group' })
  @ApiResponse({ status: 201, description: 'Group created successfully' })
  create(@Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Get all groups' })
  @ApiQuery({ name: 'centerId', required: false, type: 'string' })
  @ApiQuery({ name: 'teacherId', required: false, type: 'string' })
  @ApiQuery({ name: 'level', required: false, enum: GroupLevel })
  @ApiResponse({ status: 200, description: 'Groups retrieved successfully' })
  findAll(
    @Query('centerId') centerId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('level') level?: GroupLevel,
  ) {
    return this.groupsService.findAll(centerId, teacherId, level);
  }

  @Get('my-groups')
  @Roles(RoleName.TEACHER)
  @ApiOperation({ summary: 'Get groups taught by current user' })
  @ApiQuery({ name: 'centerId', required: false, type: 'string' })
  @ApiResponse({ status: 200, description: 'Teacher groups retrieved successfully' })
  findMyGroups(
    @GetUser('userId') userId: string,
    @Query('centerId') centerId?: string,
  ) {
    return this.groupsService.findByTeacher(userId, centerId);
  }

  @Get('stats')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get group statistics' })
  @ApiQuery({ name: 'centerId', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Group statistics retrieved successfully' })
  getStats(@Query('centerId') centerId?: number) {
    return this.groupsService.getGroupStats(centerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID' })
  @ApiResponse({ status: 200, description: 'Group retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update group' })
  @ApiResponse({ status: 200, description: 'Group updated successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return this.groupsService.update(id, updateGroupDto);
  }

  @Patch(':id/add-students')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Add students to group' })
  @ApiResponse({ status: 200, description: 'Students added to group successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  @ApiResponse({ status: 400, description: 'Invalid student IDs or capacity exceeded' })
  addStudents(
    @Param('id') id: string,
    @Body() addStudentDto: AddStudentToGroupDto,
  ) {
    return this.groupsService.addStudentsToGroup(id, addStudentDto.student_ids);
  }

  @Patch(':id/remove-students')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Remove students from group' })
  @ApiResponse({ status: 200, description: 'Students removed from group successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  removeStudents(
    @Param('id') id: string,
    @Body() removeStudentDto: RemoveStudentFromGroupDto,
  ) {
    return this.groupsService.removeStudentsFromGroup(id, removeStudentDto.student_ids);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Delete group' })
  @ApiResponse({ status: 200, description: 'Group deleted successfully' })
  @ApiResponse({ status: 404, description: 'Group not found' })
  remove(@Param('id') id: string) {
    return this.groupsService.remove(id);
  }
}