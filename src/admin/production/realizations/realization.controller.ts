import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RealizationService } from './realization.service';
import { CreateRealizationDto } from './dto/createRealization.dto';
import { GetRealizationsDto } from './dto/getRealizations.dto';
import { GetOneRealizationDto } from './dto/getOneRealization.dto';
import { UpdateRealizationDto } from './dto/updateRealization.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
  ApiOperation,
} from '@nestjs/swagger';
import { RealizationEntity } from './entities/realizations.entity';

@ApiTags('realizations')
@ApiBearerAuth()
@Controller('/production/realization')
export class RealizationController {
  constructor(private readonly realizationService: RealizationService) {}

  @ApiOperation({ summary: 'Create a new realization' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
    description: 'Article is not equal with product article',
  })
  @ApiOkResponse({
    type: RealizationEntity,
    description: 'Realization created successfully',
  })
  @Post(':productId')
  createRealization(
    @Body() dto: CreateRealizationDto,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.realizationService.createRealization(dto, productId);
  }

  @ApiOperation({ summary: 'Get all realizations' })
  @ApiOkResponse({
    description: 'Realizations retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        realizationsCount: { type: 'number' },
        realizations: { items: { $ref: getSchemaPath(RealizationEntity) } },
      },
    },
  })
  @Get()
  getRealizations(@Query() query: GetRealizationsDto) {
    return this.realizationService.getRealizations(query);
  }

  @ApiOperation({ summary: 'Get realization by product ID' })
  @ApiOkResponse({
    description: 'Realizations by product id retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        realizationsCount: { type: 'number' },
        realizations: { items: { $ref: getSchemaPath(RealizationEntity) } },
        totalQuantities: { items: { $ref: getSchemaPath(RealizationEntity) } },
      },
    },
  })
  @Get(':productId')
  getRealizationByProductId(
    @Query() query: GetOneRealizationDto,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.realizationService.getRealizationByProductId(productId, query);
  }

  @ApiOperation({ summary: 'Update a realization' })
  @ApiOkResponse({
    description: 'Realization updated successfully',
    type: RealizationEntity,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Realization not found',
  })
  @Patch(':realizationId')
  updateRealization(
    @Param('realizationId', ParseUUIDPipe) realizationId: string,
    @Body() dto: UpdateRealizationDto,
  ) {
    return this.realizationService.updateRealization(realizationId, dto);
  }

  @ApiOperation({ summary: 'Delete a realization' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Realization not found',
  })
  @ApiOkResponse({
    description: 'Realization deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Realization deleted successfully',
        },
      },
    },
  })
  @Delete(':realizationId')
  deleteRealization(
    @Param('realizationId', ParseUUIDPipe) realizationId: string,
  ) {
    return this.realizationService.deleteRealization(realizationId);
  }
}
