import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ConflictException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/createEmployee.dto';
import { UpdateEmployeeDto } from './dto/updateEmployee.dto';
import { GetEmployeesQuery } from './dto/getEmployees.dto';
import { CreatePenaltyDto } from './dto/createPenalty.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { imageFilter } from 'src/helpers/filters/imageFilter';
import { CreatePrepaymentDto } from './dto/createPrepayment.dto';
import { randomUUID } from 'crypto';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
  ApiOperation,
} from '@nestjs/swagger';
import { EmployeeEntity } from './entities/employee.entity';
import { MediaEntity } from 'src/media/entities/media.entity';
import { PenaltyEntity } from './entities/penalty.entity';
import { PrePaymentEntity } from './entities/prepayment.entity';
import { AbilitiesGuard } from 'src/helpers/guards/abilities.guard';
import { CheckAbilities } from 'src/helpers/common/decorators/abilityDecorator.decorator';
import { ActionEnum, SubjectEnum } from 'src/helpers/constants';

@ApiTags('employees')
@ApiBearerAuth()
@UseGuards(AbilitiesGuard)
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @ApiOperation({ summary: 'Create a new employee' })
  @ApiCreatedResponse({
    description: 'Create a new employee',
    schema: {
      type: 'object',
      properties: { employee: { $ref: getSchemaPath(EmployeeEntity) } },
    },
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'Employee with this passport already exists',
  })
  @Post()
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.Employee,
  })
  async createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(dto);
  }

  @ApiOperation({ summary: 'Get all employees' })
  @ApiOkResponse({
    description: 'Get all employees',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Employees returned successfully' },
        employees: { items: { $ref: getSchemaPath(EmployeeEntity) } },
      },
    },
  })
  @Get()
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Employee,
  })
  getEmployees(@Query() query: GetEmployeesQuery) {
    return this.employeeService.getEmployees(query);
  }

  @ApiOperation({ summary: 'Get one employee' })
  @ApiOkResponse({
    description: 'Get one employee',
    schema: {
      type: 'object',
      properties: {
        employee: { $ref: getSchemaPath(EmployeeEntity) },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Employee not found',
  })
  @Get(':employeeId')
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Employee,
  })
  getOneEmployee(@Param('employeeId', ParseUUIDPipe) employeeId: string) {
    return this.employeeService.getOneEmployee(employeeId);
  }

  @ApiOperation({ summary: 'Update one employee' })
  @ApiOkResponse({
    description: 'Update one employee',
    schema: {
      type: 'object',
      properties: {
        employee: { $ref: getSchemaPath(EmployeeEntity) },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Employee not found',
  })
  @Patch(':employeeId')
  @CheckAbilities({
    action: ActionEnum.Update,
    subject: SubjectEnum.Employee,
  })
  updateEmployee(
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.updateEmployee(employeeId, updateEmployeeDto);
  }

  @ApiOperation({ summary: 'Delete one employee' })
  @ApiOkResponse({
    description: 'Delete one employee',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Employee deleted successfully' },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Employee not found',
  })
  @Delete(':employeeId')
  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: SubjectEnum.Employee,
  })
  deleteEmployee(@Param('id', ParseUUIDPipe) employeeId: string) {
    return this.employeeService.deleteEmployee(employeeId);
  }

  @ApiOperation({ summary: 'Create employee image' })
  @ApiCreatedResponse({
    description: 'Employee image created successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Employee image created successfully!',
        },
        media: { $ref: getSchemaPath(MediaEntity) },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Employee not found',
  })
  @Post(':employeeId/image')
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.Employee,
  })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './temp',
        filename: (req, file, cb) => {
          const uniqueFileName =
            randomUUID() + `_uploaded_${file.originalname}`;
          cb(null, uniqueFileName);
        },
      }),
      fileFilter: imageFilter,
      limits: {
        fileSize: 25 * 1024 * 1024,
      },
    }),
  )
  async createSubcategoryImage(
    @UploadedFile() image: Express.Multer.File,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    if (!image) throw new BadRequestException('Please provide an image');
    return await this.employeeService.createEmployeeImage(employeeId, image);
  }

  @ApiOperation({ summary: 'Delete employee image' })
  @ApiOkResponse({
    description: 'Employee image deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Employee image deleted successfully!',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Media not found',
  })
  @Delete(':mediaId/image')
  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: SubjectEnum.Employee,
  })
  async deleteEmployeeImage(@Param('id', ParseUUIDPipe) mediaId: string) {
    return await this.employeeService.deleteEmployeeImage(mediaId);
  }

  @ApiOperation({ summary: 'Create penalty for employee' })
  @ApiOkResponse({
    description: 'Penalty employee',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Penalty created successfully',
        },
        penalty: { $ref: getSchemaPath(PenaltyEntity) },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Employee not found',
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'Monthly salary is not enough to pay penalty',
  })
  @Post('/penalty/:employeeId')
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.Penalty,
  })
  async createPenalty(
    @Body() dto: CreatePenaltyDto,
    @Param('employeeId', ParseUUIDPipe) employeeId: string,
  ) {
    return await this.employeeService.createPenalty(employeeId, dto);
  }

  @ApiOperation({ summary: 'Delete employee penalty' })
  @ApiOkResponse({
    description: 'Delete penalty',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Penalty deleted successfully.',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Penalty not found',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Monthly record not found for the penalty.',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Monthly record detail not found for the penalty',
  })
  @Delete('/penalty/:penaltyId')
  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: SubjectEnum.Penalty,
  })
  async deletePenalty(@Param('penaltyId', ParseUUIDPipe) penaltyId: string) {
    return await this.employeeService.deletePenalty(penaltyId);
  }

  @ApiOperation({ summary: 'Create prepayment for employee' })
  @ApiOkResponse({
    description: 'Create employee prepayment',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Prepayment created successfully',
        },
        prepayment: { $ref: getSchemaPath(PrePaymentEntity) },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Employee not found',
  })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'Monthly salary is not enough to pay penalty',
  })
  @Post('/prepayment/:employeeId')
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.Prepayment,
  })
  async createPrepayment(
    @Body() dto: CreatePrepaymentDto,
    @Param('id', ParseUUIDPipe) employeeId: string,
  ) {
    return await this.employeeService.createPrepayment(employeeId, dto);
  }

  @ApiOperation({ summary: 'Delete employee prepayment' })
  @ApiOkResponse({
    description: 'Delete prepayment',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Prepayment deleted successfully',
        },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Prepayment not found',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Monthly record not found for the penalty.',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Monthly record detail not found for the penalty',
  })
  @Delete('/prepayment/:prepaymentId')
  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: SubjectEnum.Prepayment,
  })
  async deletePrepayment(
    @Param('prepaymentId', ParseUUIDPipe) prepaymentId: string,
  ) {
    return await this.employeeService.deletePrepayment(prepaymentId);
  }
}
