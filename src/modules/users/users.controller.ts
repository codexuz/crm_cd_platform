import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto/user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { RoleName } from '../../entities';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'centerId', required: false, type: 'number' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll(@Query('centerId') centerId?: number) {
    return this.usersService.findAll(centerId);
  }

  @Get('by-role/:role')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Get users by role' })
  @ApiQuery({ name: 'centerId', required: false, type: 'number' })
  findByRole(
    @Param('role') role: RoleName,
    @Query('centerId') centerId?: number,
  ) {
    return this.usersService.findByRole(role, centerId);
  }

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@GetUser('userId') userId: number) {
    return this.usersService.findOne(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN, RoleName.MANAGER)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  changePassword(
    @GetUser('userId') userId: number,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, changePasswordDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}