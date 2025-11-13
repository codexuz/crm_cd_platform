import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { LeadsService } from './leads.service';
import { CreateLeadDto, UpdateLeadDto } from './dto/lead.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { SubscriptionGuard } from '../../common/guards/subscription.guard';
import { ModuleAccessGuard } from '../../common/guards/module-access.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequiresModules } from '../../common/decorators/subscription.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoleName, LeadStatus } from '../../entities';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard, ModuleAccessGuard)
@RequiresModules('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Create a new lead' })
  @ApiResponse({ status: 201, description: 'Lead created successfully' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Get all leads' })
  @ApiQuery({ name: 'centerId', required: false, type: 'string' })
  @ApiQuery({ name: 'status', required: false, enum: LeadStatus })
  @ApiResponse({ status: 200, description: 'Leads retrieved successfully' })
  findAll(
    @Query('centerId') centerId?: string,
    @Query('status') status?: LeadStatus,
  ) {
    return this.leadsService.findAll(centerId, status);
  }

  @Get('assigned-to-me')
  @Roles(RoleName.OWNER, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Get leads assigned to current user' })
  @ApiQuery({ name: 'centerId', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Assigned leads retrieved successfully',
  })
  findAssignedToMe(
    @GetUser('userId') userId: string,
    @Query('centerId') centerId?: string,
  ) {
    return this.leadsService.findByAssignedUser(userId, centerId);
  }

  @Get('stats')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get lead statistics' })
  @ApiQuery({ name: 'centerId', required: false, type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Lead statistics retrieved successfully',
  })
  getStats(@Query('centerId') centerId?: string) {
    return this.leadsService.getLeadStats(centerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update lead' })
  @ApiResponse({ status: 200, description: 'Lead updated successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Patch(':id/convert-to-student')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Convert lead to student' })
  @ApiResponse({
    status: 200,
    description: 'Lead converted to student successfully',
  })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  convertToStudent(@Param('id') id: string) {
    return this.leadsService.convertToStudent(id);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Delete lead' })
  @ApiResponse({ status: 200, description: 'Lead deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
