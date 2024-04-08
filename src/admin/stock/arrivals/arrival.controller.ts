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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  getSchemaPath,
} from '@nestjs/swagger';
import { ArrivalEntity } from './entities/arrival.entity';

@Controller('stock/arrival')
export class ArrivalController {
  constructor(private readonly arrivalService: ArrivalService) {}

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
  @ApiParam({ name: 'id', description: 'Product id' })
  @Post(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.Warehouse,
  })
  async createArrival(
    @Body() dto: CreateArrivalDto,
    @Param('id', ParseUUIDPipe) productId: string,
  ) {
    dto.productId = productId;
    return this.arrivalService.createArrival(dto);
  }

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
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Warehouse,
  })
  async getArrivals(@Query() query: GetArrivalsDto) {
    return this.arrivalService.getArrivals(query);
  }

  @ApiParam({ name: 'id', description: 'Arrival id' })
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
  @Get(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Warehouse,
  })
  async getByProductId(
    @Query() query: GetOneArrivalDto,
    @Param('id', ParseUUIDPipe) arrivalId: string,
  ) {
    return this.arrivalService.getByProductId(arrivalId, query);
  }

  @ApiOkResponse({
    description: 'Arrival updated successfully',
    type: ArrivalEntity,
  })
  @ApiParam({ name: 'id', description: 'Arrival id' })
  @Patch(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Update,
    subject: SubjectEnum.Warehouse,
  })
  async updateArrival(
    @Param('id', ParseUUIDPipe) arrivalId: string,
    @Body() updateArrivalDto: UpdateArrivalDto,
  ) {
    return this.arrivalService.updateArrival(arrivalId, updateArrivalDto);
  }

  @ApiOkResponse({
    description: 'Arrival deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Arrival deleted successfully!' },
      },
    },
  })
  @ApiParam({ name: 'id', description: 'Arrival id' })
  @Delete(':id')
  @UseGuards(AbilitiesGuard)
  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: SubjectEnum.Warehouse,
  })
  async deleteArrival(@Param('id') arrivalId: string) {
    return this.arrivalService.deleteArrival(arrivalId);
  }
}
