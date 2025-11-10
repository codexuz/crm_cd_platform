import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoleName, LeadStatus } from '../../entities';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Get all leads' })
  @ApiQuery({ name: 'centerId', required: false, type: 'number' })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  findAll(
    @Query('centerId') centerId?: number,
    @Query('status') status?: LeadStatus,
  ) {
    return this.leadsService.findAll(centerId, status);
  }

  @Get('assigned-to-me')
  @Roles(RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Get leads assigned to current user' })
  @ApiQuery({ name: 'centerId', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Assigned leads retrieved successfully' })
  findAssignedToMe(
    @GetUser('userId') userId: number,
    @Query('centerId') centerId?: number,
  ) {
    return this.leadsService.findByAssignedUser(userId, centerId);
  }

  @Get('stats')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get lead statistics' })
  @ApiQuery({ name: 'centerId', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Lead statistics retrieved successfully' })
  getStats(@Query('centerId') centerId?: number) {
    return this.leadsService.getLeadStats(centerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update lead' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeadDto: UpdateLeadDto,
    @GetUser('userId') userId: number,
  ) {
    return this.leadsService.update(id, updateLeadDto, userId);
  }

  @Patch(':id/convert-to-student')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Convert lead to student' })
  @ApiResponse({ status: 200, description: 'Lead converted to student successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  convertToStudent(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.convertToStudent(id);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Delete lead' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @GetUser('userId') userId: number,
  ) {
    return this.leadsService.remove(id, userId);
  }
}