import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import {
  CreateCenterSettingsDto,
  UpdateCenterSettingsDto,
  BulkUpdateSettingsDto,
  InitializeCenterSettingsDto,
} from './dto/settings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from '../../entities';
import { ModuleName } from '../../entities/center-settings.entity';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Create a new module setting for a center' })
  @ApiResponse({
    status: 201,
    description: 'Module setting created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Setting already exists for this module',
  })
  create(@Body() createSettingsDto: CreateCenterSettingsDto) {
    return this.settingsService.create(createSettingsDto);
  }

  @Post('initialize')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Initialize all module settings for a center' })
  @ApiResponse({
    status: 201,
    description: 'Module settings initialized successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Settings already initialized for this center',
  })
  initialize(@Body() initDto: InitializeCenterSettingsDto) {
    return this.settingsService.initializeCenterSettings(initDto);
  }

  @Get('center/:centerId')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all module settings for a center' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Settings retrieved successfully',
  })
  findByCenterId(@Param('centerId') centerId: string) {
    return this.settingsService.findByCenterId(centerId);
  }

  @Get('center/:centerId/enabled')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Get enabled modules for a center' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Enabled modules retrieved successfully',
  })
  getEnabledModules(@Param('centerId') centerId: string) {
    return this.settingsService.getEnabledModules(centerId);
  }

  @Get('center/:centerId/disabled')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get disabled modules for a center' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Disabled modules retrieved successfully',
  })
  getDisabledModules(@Param('centerId') centerId: string) {
    return this.settingsService.getDisabledModules(centerId);
  }

  @Get('center/:centerId/module/:moduleName')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get settings for a specific module' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiParam({ name: 'moduleName', enum: ModuleName })
  @ApiResponse({
    status: 200,
    description: 'Module settings retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  findByModule(
    @Param('centerId') centerId: string,
    @Param('moduleName') moduleName: ModuleName,
  ) {
    return this.settingsService.findByModule(centerId, moduleName);
  }

  @Get('center/:centerId/module/:moduleName/enabled')
  @Roles(RoleName.ADMIN, RoleName.OWNER, RoleName.MANAGER, RoleName.TEACHER)
  @ApiOperation({ summary: 'Check if a module is enabled' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiParam({ name: 'moduleName', enum: ModuleName })
  @ApiResponse({
    status: 200,
    description: 'Module status retrieved successfully',
  })
  async isModuleEnabled(
    @Param('centerId') centerId: string,
    @Param('moduleName') moduleName: ModuleName,
  ) {
    const isEnabled = await this.settingsService.isModuleEnabled(
      centerId,
      moduleName,
    );
    return { module: moduleName, enabled: isEnabled };
  }

  @Patch('center/:centerId/module/:moduleName')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Update settings for a specific module' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiParam({ name: 'moduleName', enum: ModuleName })
  @ApiResponse({
    status: 200,
    description: 'Module settings updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  update(
    @Param('centerId') centerId: string,
    @Param('moduleName') moduleName: ModuleName,
    @Body() updateSettingsDto: UpdateCenterSettingsDto,
  ) {
    return this.settingsService.update(centerId, moduleName, updateSettingsDto);
  }

  @Patch('center/:centerId/bulk')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Bulk update multiple module settings' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Settings updated successfully',
  })
  bulkUpdate(
    @Param('centerId') centerId: string,
    @Body() bulkUpdateDto: BulkUpdateSettingsDto,
  ) {
    return this.settingsService.bulkUpdate(centerId, bulkUpdateDto);
  }

  @Patch('center/:centerId/module/:moduleName/toggle')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Toggle module enabled/disabled status' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiParam({ name: 'moduleName', enum: ModuleName })
  @ApiResponse({
    status: 200,
    description: 'Module status toggled successfully',
  })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  toggleModule(
    @Param('centerId') centerId: string,
    @Param('moduleName') moduleName: ModuleName,
  ) {
    return this.settingsService.toggleModule(centerId, moduleName);
  }

  @Delete('center/:centerId/module/:moduleName')
  @Roles(RoleName.ADMIN, RoleName.OWNER)
  @ApiOperation({ summary: 'Delete settings for a specific module' })
  @ApiParam({ name: 'centerId', type: 'string' })
  @ApiParam({ name: 'moduleName', enum: ModuleName })
  @ApiResponse({
    status: 200,
    description: 'Module settings deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  remove(
    @Param('centerId') centerId: string,
    @Param('moduleName') moduleName: ModuleName,
  ) {
    return this.settingsService.remove(centerId, moduleName);
  }
}
