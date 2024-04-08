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
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { EmployeeEntity } from './entities/employee.entity';
import { MediaEntity } from 'src/media/entities/media.entity';
import { PenaltyEntity } from './entities/penalty.entity';
import { PrePaymentEntity } from './entities/prepayment.entity';

@ApiTags('employees')
@ApiBearerAuth()
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

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
  async createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(dto);
  }

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
  getEmployees(@Query() query: GetEmployeesQuery) {
    return this.employeeService.getEmployees(query);
  }

  @ApiOkResponse({
    description: 'Get one employee',
    schema: {
      type: 'object',
      properties: {
        employee: { $ref: getSchemaPath(EmployeeEntity) },
      },
    },
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Id of the employee' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Employee not found',
  })
  @Get(':id')
  getOneEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.getOneEmployee(id);
  }

  @ApiOkResponse({
    description: 'Update one employee',
    schema: {
      type: 'object',
      properties: {
        employee: { $ref: getSchemaPath(EmployeeEntity) },
      },
    },
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Id of the employee' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Employee not found',
  })
  @Patch(':id')
  updateEmployee(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeeService.updateEmployee(id, updateEmployeeDto);
  }

  @ApiOkResponse({
    description: 'Get one employee',
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
  @ApiParam({ name: 'id', type: 'string', description: 'Id of the employee' })
  @Delete(':id')
  deleteEmployee(@Param('id', ParseUUIDPipe) id: string) {
    return this.employeeService.deleteEmployee(id);
  }

  @ApiCreatedResponse({
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
  @ApiParam({ name: 'id', type: 'string', description: 'Employee id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Employee not found',
  })
  @Post(':id/image')
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
    @Param('id', ParseUUIDPipe) employeeId: string,
  ) {
    if (!image) throw new BadRequestException('Please provide an image');
    return await this.employeeService.createEmployeeImage(employeeId, image);
  }

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
  @ApiParam({ name: 'id', type: 'string', description: 'Employee id' })
  @Delete(':id/image')
  async deleteEmployeeImage(@Param('id', ParseUUIDPipe) mediaId: string) {
    return await this.employeeService.deleteEmployeeImage(mediaId);
  }

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
  @ApiParam({ name: 'id', type: 'string', description: 'Employee id' })
  @Post('/penalty/:id')
  async createPenalty(
    @Body() dto: CreatePenaltyDto,
    @Param('id', ParseUUIDPipe) employeeId: string,
  ) {
    return await this.employeeService.createPenalty(employeeId, dto);
  }

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
  @ApiParam({ name: 'id', type: 'string', description: 'Penalty id' })
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
  @Delete('/penalty/:id')
  async deletePenalty(@Param('id', ParseUUIDPipe) penaltyId: string) {
    return await this.employeeService.deletePenalty(penaltyId);
  }

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
  @ApiParam({ name: 'id', type: 'string', description: 'Employee id' })
  @ApiConflictResponse({
    type: ConflictException,
    description: 'Monthly salary is not enough to pay penalty',
  })
  @Post('/prepayment/:id')
  async createPrepayment(
    @Body() dto: CreatePrepaymentDto,
    @Param('id', ParseUUIDPipe) employeeId: string,
  ) {
    return await this.employeeService.createPrepayment(employeeId, dto);
  }

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
  @ApiParam({ name: 'id', type: 'string', description: 'Prepayment id' })
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
  @Delete('/prepayment/:id')
  async deletePrepayment(@Param('id', ParseUUIDPipe) prepaymentId: string) {
    return await this.employeeService.deletePrepayment(prepaymentId);
  }
}
