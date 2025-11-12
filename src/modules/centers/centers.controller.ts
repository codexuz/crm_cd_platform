import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CentersService } from './centers.service';
import { CreateCenterDto, UpdateCenterDto } from './dto/center.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoleName } from '../../entities';

@ApiTags('Centers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('centers')
export class CentersController {
  constructor(private readonly centersService: CentersService) {}

  @Post()
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Create a new center' })
  @ApiResponse({ status: 201, description: 'Center created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin role required' })
  create(@Body() createCenterDto: CreateCenterDto) {
    return this.centersService.create(createCenterDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all centers' })
  @ApiResponse({ status: 200, description: 'Centers retrieved successfully' })
  findAll() {
    return this.centersService.findAll();
  }

  @Get('my-centers')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get centers owned by current user' })
  @ApiResponse({ status: 200, description: 'Centers retrieved successfully' })
  findMyOwned(@GetUser('userId') userId: string) {
    return this.centersService.findByOwner(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get center by ID' })
  @ApiResponse({ status: 200, description: 'Center retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Center not found' })
  findOne(@Param('id') id: string) {
    return this.centersService.findOne(id);
  }

  @Get(':id/stats')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get center statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@Param('id') id: string) {
    return this.centersService.getCenterStats(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update center' })
  @ApiResponse({ status: 200, description: 'Center updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only owner can update' })
  @ApiResponse({ status: 404, description: 'Center not found' })
  update(
    @Param('id') id: string,
    @Body() updateCenterDto: UpdateCenterDto,
    @GetUser('userId') userId: string,
  ) {
    return this.centersService.update(id, updateCenterDto, userId);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Delete center' })
  @ApiResponse({ status: 200, description: 'Center deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only owner can delete' })
  @ApiResponse({ status: 404, description: 'Center not found' })
  remove(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return this.centersService.remove(id, userId);
  }
}