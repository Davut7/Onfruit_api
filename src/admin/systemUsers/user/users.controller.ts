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
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { SubjectEntity } from './entities/adminSubjects.entity';
import { ActionEntity } from './entities/adminActions.entity';

@ApiTags('admin-users')
@ApiBearerAuth()
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

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

  @ApiParam({ name: 'id', type: 'string', description: 'System user id' })
  @ApiOkResponse({
    type: AdminsEntity,
    description: 'System user returned by id',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'System user not found',
  })
  @Get(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.AdminUsers,
  })
  getOneUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminUsersService.getOneUser(id);
  }

  @ApiParam({ name: 'id', type: 'string', description: 'System user id' })
  @ApiOkResponse({
    type: AdminsEntity,
    description: 'System user updated by id',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'System user not found',
  })
  @Patch(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.AdminUsers,
  })
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AdminUsersUpdateDto,
  ) {
    return this.adminUsersService.updateUser(id, dto);
  }

  @ApiParam({ name: 'id', type: 'string', description: 'System user id' })
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
  @Delete(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.AdminUsers,
  })
  deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminUsersService.deleteUser(id);
  }

  @ApiParam({ type: 'string', name: 'id', description: 'System user id' })
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
  @Post('/subject/:id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.AdminUsers,
  })
  createSubject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSubjectDto,
  ) {
    dto.adminId = id;
    return this.adminUsersService.createSubject(dto);
  }

  @ApiParam({
    type: 'string',
    name: 'id',
    description: 'System users subject id',
  })
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
  @Delete('/subject/:id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.AdminUsers,
  })
  deleteSubject(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminUsersService.deleteSubject(id);
  }

  @ApiParam({
    name: 'id',
    type: 'string',
    description: 'System users subject id',
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'System users already has subject with this action ',
  })
  @ApiOkResponse({
    type: ActionEntity,
    description: 'Subject action created successfully',
  })
  @Post('/action/:id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.AdminUsers,
  })
  createAction(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateActionDto,
  ) {
    dto.subjectId = id;
    return this.adminUsersService.createAction(dto);
  }

  @ApiParam({
    type: 'string',
    name: 'id',
    description: 'System users subjects action id',
  })
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
  @Delete('/action/:id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.AdminUsers,
  })
  deleteAction(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminUsersService.deleteAction(id);
  }
}
