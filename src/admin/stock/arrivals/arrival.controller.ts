import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseUUIDPipe,
  Delete,
  Query,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ArrivalService } from './arrival.service';
import { AbilitiesGuard } from 'src/helpers/guards/abilities.guard';
import { CheckAbilities } from 'src/helpers/common/decorators/abilityDecorator.decorator';
import { ActionEnum, SubjectEnum } from 'src/helpers/constants';
import { CreateArrivalDto } from './dto/createArrival.dto';
import { GetArrivalsDto } from './dto/getArrivals.dto';
import { GetOneArrivalDto } from './dto/getOneArrival.dto';
import { UpdateArrivalDto } from './dto/updateArrival.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
  ApiOperation,
} from '@nestjs/swagger';
import { ArrivalEntity } from './entities/arrival.entity';

@ApiBearerAuth()
@ApiTags('arrivals')
@UseGuards(AbilitiesGuard)
@Controller('stock/arrival')
export class ArrivalController {
  constructor(private readonly arrivalService: ArrivalService) {}

  @ApiOperation({ summary: 'Create arrival for a product' })
  @ApiOkResponse({
    description: 'Arrival created successfully',
    schema: {
      type: 'object',
      properties: {
        arrival: { $ref: getSchemaPath(ArrivalEntity) },
        message: { type: 'string', example: 'Arrival created successfully!' },
      },
    },
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
    description: 'Provided article not capable with product',
  })
  @Post(':productId')
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.Warehouse,
  })
  async createArrival(
    @Body() dto: CreateArrivalDto,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    dto.productId = productId;
    return this.arrivalService.createArrival(dto);
  }

  @ApiOperation({ summary: 'Get all arrivals' })
  @ApiOkResponse({
    description: 'Arrival retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        arrivals: { $ref: getSchemaPath(ArrivalEntity) },
        arrivalsCount: { type: 'number' },
      },
    },
  })
  @Get()
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Warehouse,
  })
  async getArrivals(@Query() query: GetArrivalsDto) {
    return this.arrivalService.getArrivals(query);
  }

  @ApiOperation({ summary: 'Get arrival by ID' })
  @ApiOkResponse({
    description: 'Arrival by id retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        arrivals: { $ref: getSchemaPath(ArrivalEntity) },
        totalQuantities: { $ref: getSchemaPath(ArrivalEntity) },
        arrivalsCount: { type: 'number' },
      },
    },
  })
  @Get(':arrivalId')
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Warehouse,
  })
  async getByProductId(
    @Query() query: GetOneArrivalDto,
    @Param('arrivalId', ParseUUIDPipe) arrivalId: string,
  ) {
    return this.arrivalService.getByProductId(arrivalId, query);
  }

  @ApiOperation({ summary: 'Update an arrival' })
  @ApiOkResponse({
    description: 'Arrival updated successfully',
    type: ArrivalEntity,
  })
  @Patch(':arrivalId')
  @CheckAbilities({
    action: ActionEnum.Update,
    subject: SubjectEnum.Warehouse,
  })
  async updateArrival(
    @Param('arrivalId', ParseUUIDPipe) arrivalId: string,
    @Body() updateArrivalDto: UpdateArrivalDto,
  ) {
    return this.arrivalService.updateArrival(arrivalId, updateArrivalDto);
  }

  @ApiOperation({ summary: 'Delete an arrival' })
  @ApiOkResponse({
    description: 'Arrival deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Arrival deleted successfully!' },
      },
    },
  })
  @Delete(':arrivalId')
  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: SubjectEnum.Warehouse,
  })
  async deleteArrival(@Param('arrivalId') arrivalId: string) {
    return this.arrivalService.deleteArrival(arrivalId);
  }
}
