import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Post,
  UnauthorizedException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { AdminUsersService } from './users.service';
import { AbilitiesGuard } from 'src/helpers/guards/abilities.guard';
import { CheckAbilities } from 'src/helpers/common/decorators/abilityDecorator.decorator';
import { ActionEnum, SubjectEnum } from 'src/helpers/constants';
import { CurrentUser } from 'src/helpers/common/decorators/currentUser.decorator';
import { AdminsEntity } from './entities/adminUsers.entity';
import { AdminUsersUpdateDto } from './dto/updateUser.dto';
import { CreateSubjectDto } from './dto/createSubject.dto';
import { CreateActionDto } from './dto/createAction.dto';
import { AdminGuard } from 'src/helpers/guards/adminGuard.guard';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
  ApiOperation,
} from '@nestjs/swagger';
import { SubjectEntity } from './entities/adminSubjects.entity';
import { ActionEntity } from './entities/adminActions.entity';

@ApiTags('admin-users')
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @ApiOperation({ summary: 'Get all admin users' })
  @ApiOkResponse({
    type: [AdminsEntity],
    description: 'Return all admin users',
  })
  @Get()
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.AdminUsers,
  })
  getUsers() {
    return this.adminUsersService.getUsers();
  }

  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({ description: 'Return current user', type: AdminsEntity })
  @ApiUnauthorizedResponse({
    type: UnauthorizedException,
    description: 'User not found',
  })
  @Get('/get-me')
  @UseGuards(AdminGuard)
  getMe(@CurrentUser() currentUser: AdminsEntity) {
    return this.adminUsersService.getMe(currentUser.id);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiOkResponse({
    type: AdminsEntity,
    description: 'System user returned by id',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'System user not found',
  })
  @Get(':adminId')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.AdminUsers,
  })
  getOneUser(@Param('adminId', ParseUUIDPipe) adminId: string) {
    return this.adminUsersService.getOneUser(adminId);
  }

  @ApiOperation({ summary: 'Update user by ID' })
  @ApiOkResponse({
    type: AdminsEntity,
    description: 'System user updated by id',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'System user not found',
  })
  @Patch(':adminId')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.AdminUsers,
  })
  updateUser(
    @Param('adminId', ParseUUIDPipe) adminId: string,
    @Body() dto: AdminUsersUpdateDto,
  ) {
    return this.adminUsersService.updateUser(adminId, dto);
  }

  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiOkResponse({
    description: 'System user deleted by id',
    schema: {
      type: 'object',
      properties: {
        message: {
          example: 'System user deleted successfully!',
          type: 'string',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'System user not found',
  })
  @Delete(':adminId')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.AdminUsers,
  })
  deleteUser(@Param('adminId', ParseUUIDPipe) adminId: string) {
    return this.adminUsersService.deleteUser(adminId);
  }

  @ApiOperation({ summary: 'Create subject for user' })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'User with id already have subject ${dto.subject}',
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'You cannot create subject for root user!',
  })
  @ApiOkResponse({
    description: 'Subject for system user created successfully',
    schema: {
      type: 'object',
      properties: {
        subject: { $ref: getSchemaPath(SubjectEntity) },
        action: { $ref: getSchemaPath(ActionEntity) },
      },
    },
  })
  @Post('/subject/:adminId')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.AdminUsers,
  })
  createSubject(
    @Param('adminId', ParseUUIDPipe) adminId: string,
    @Body() dto: CreateSubjectDto,
  ) {
    return this.adminUsersService.createSubject(dto, adminId);
  }

  @ApiOperation({ summary: 'Delete subject by ID' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Subject deleted successfully!' },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Subject not found',
  })
  @Delete('/subject/:subjectId')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.AdminUsers,
  })
  deleteSubject(@Param('subjectId', ParseUUIDPipe) subjectId: string) {
    return this.adminUsersService.deleteSubject(subjectId);
  }

  @ApiOperation({ summary: 'Create action for subject' })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'System users already has subject with this action ',
  })
  @ApiOkResponse({
    type: ActionEntity,
    description: 'Subject action created successfully',
  })
  @Post('/action/:subjectId')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.AdminUsers,
  })
  createAction(
    @Param('subjectId', ParseUUIDPipe) subjectId: string,
    @Body() dto: CreateActionDto,
  ) {
    return this.adminUsersService.createAction(dto, subjectId);
  }

  @ApiOperation({ summary: 'Delete action by ID' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Action deleted successfully!' },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Action not found',
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'Read action cannot be deleted',
  })
  @Delete('/action/:actionId')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.AdminUsers,
  })
  deleteAction(@Param('actionId', ParseUUIDPipe) actionId: string) {
    return this.adminUsersService.deleteAction(actionId);
  }
}
