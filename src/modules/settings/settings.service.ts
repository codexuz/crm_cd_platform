import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CenterSettings,
  ModuleName,
} from '../../entities/center-settings.entity';
import { Center } from '../../entities';
import {
  CreateCenterSettingsDto,
  UpdateCenterSettingsDto,
  BulkUpdateSettingsDto,
  InitializeCenterSettingsDto,
} from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(CenterSettings)
    private settingsRepository: Repository<CenterSettings>,
    @InjectRepository(Center)
    private centerRepository: Repository<Center>,
  ) {}

  async create(
    createSettingsDto: CreateCenterSettingsDto,
  ): Promise<CenterSettings> {
    // Verify center exists
    const center = await this.centerRepository.findOne({
      where: { id: createSettingsDto.center_id, is_active: true },
    });

    if (!center) {
      throw new NotFoundException(
        `Center with ID ${createSettingsDto.center_id} not found`,
      );
    }

    // Check if setting already exists
    const existing = await this.settingsRepository.findOne({
      where: {
        center_id: createSettingsDto.center_id,
        module_name: createSettingsDto.module_name,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Settings for module ${createSettingsDto.module_name} already exist for this center`,
      );
    }

    const settings = this.settingsRepository.create(createSettingsDto);
    return this.settingsRepository.save(settings);
  }

  async initializeCenterSettings(
    initDto: InitializeCenterSettingsDto,
  ): Promise<CenterSettings[]> {
    // Verify center exists
    const center = await this.centerRepository.findOne({
      where: { id: initDto.center_id, is_active: true },
    });

    if (!center) {
      throw new NotFoundException(
        `Center with ID ${initDto.center_id} not found`,
      );
    }

    // Check if settings already exist
    const existingSettings = await this.settingsRepository.find({
      where: { center_id: initDto.center_id },
    });

    if (existingSettings.length > 0) {
      throw new ConflictException(
        'Settings already initialized for this center',
      );
    }

    // Default modules configuration
    const defaultModules = {
      [ModuleName.LEADS]: true,
      [ModuleName.PAYMENTS]: true,
      [ModuleName.SALARY]: true,
      [ModuleName.GROUPS]: true,
      [ModuleName.ATTENDANCE]: true,
      [ModuleName.IELTS]: false,
    };

    // Override with provided values
    const modulesConfig = initDto.modules
      ? { ...defaultModules, ...initDto.modules }
      : defaultModules;

    // Create settings for all modules
    const settingsToCreate = Object.entries(ModuleName).map(([, value]) => {
      return this.settingsRepository.create({
        center_id: initDto.center_id,
        module_name: value,
        is_enabled:
          modulesConfig[value] !== undefined ? modulesConfig[value] : true,
      });
    });

    return this.settingsRepository.save(settingsToCreate);
  }

  async findByCenterId(centerId: string): Promise<CenterSettings[]> {
    const settings = await this.settingsRepository.find({
      where: { center_id: centerId },
      relations: ['center'],
      order: { module_name: 'ASC' },
    });

    return settings;
  }

  async findByModule(
    centerId: string,
    moduleName: ModuleName,
  ): Promise<CenterSettings> {
    const setting = await this.settingsRepository.findOne({
      where: { center_id: centerId, module_name: moduleName },
      relations: ['center'],
    });

    if (!setting) {
      throw new NotFoundException(
        `Settings for module ${moduleName} not found for this center`,
      );
    }

    return setting;
  }

  async isModuleEnabled(
    centerId: string,
    moduleName: ModuleName,
  ): Promise<boolean> {
    const setting = await this.settingsRepository.findOne({
      where: { center_id: centerId, module_name: moduleName },
    });

    // If no setting exists, default to enabled
    return setting ? setting.is_enabled : true;
  }

  async update(
    centerId: string,
    moduleName: ModuleName,
    updateSettingsDto: UpdateCenterSettingsDto,
  ): Promise<CenterSettings> {
    const setting = await this.findByModule(centerId, moduleName);

    await this.settingsRepository.update(setting.id, updateSettingsDto);

    return this.findByModule(centerId, moduleName);
  }

  async bulkUpdate(
    centerId: string,
    bulkUpdateDto: BulkUpdateSettingsDto,
  ): Promise<CenterSettings[]> {
    // Verify center exists
    const center = await this.centerRepository.findOne({
      where: { id: centerId, is_active: true },
    });

    if (!center) {
      throw new NotFoundException(`Center with ID ${centerId} not found`);
    }

    const updatedSettings: CenterSettings[] = [];

    for (const settingUpdate of bulkUpdateDto.settings) {
      const existing = await this.settingsRepository.findOne({
        where: {
          center_id: centerId,
          module_name: settingUpdate.module_name,
        },
      });

      if (existing) {
        await this.settingsRepository.update(existing.id, {
          is_enabled: settingUpdate.is_enabled,
          module_config: settingUpdate.module_config,
        });
        const updated = await this.settingsRepository.findOne({
          where: { id: existing.id },
          relations: ['center'],
        });
        if (updated) {
          updatedSettings.push(updated);
        }
      } else {
        // Create if doesn't exist
        const newSetting = this.settingsRepository.create({
          center_id: centerId,
          module_name: settingUpdate.module_name,
          is_enabled: settingUpdate.is_enabled,
          module_config: settingUpdate.module_config,
        });
        const saved = await this.settingsRepository.save(newSetting);
        updatedSettings.push(saved);
      }
    }

    return updatedSettings;
  }

  async toggleModule(
    centerId: string,
    moduleName: ModuleName,
  ): Promise<CenterSettings> {
    const setting = await this.findByModule(centerId, moduleName);

    await this.settingsRepository.update(setting.id, {
      is_enabled: !setting.is_enabled,
    });

    return this.findByModule(centerId, moduleName);
  }

  async remove(centerId: string, moduleName: ModuleName): Promise<void> {
    const setting = await this.findByModule(centerId, moduleName);
    await this.settingsRepository.remove(setting);
  }

  async getEnabledModules(centerId: string): Promise<ModuleName[]> {
    const settings = await this.settingsRepository.find({
      where: { center_id: centerId, is_enabled: true },
    });

    return settings.map((s) => s.module_name);
  }

  async getDisabledModules(centerId: string): Promise<ModuleName[]> {
    const settings = await this.settingsRepository.find({
      where: { center_id: centerId, is_enabled: false },
    });

    return settings.map((s) => s.module_name);
  }
}
