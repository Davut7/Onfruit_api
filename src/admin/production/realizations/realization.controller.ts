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
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { RealizationEntity } from './entities/realizations.entity';

@ApiTags('realizations')
@ApiBearerAuth()
@Controller('/production/realization')
export class RealizationController {
  constructor(private readonly realizationService: RealizationService) {}

  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @ApiBadRequestResponse({
    type: BadRequestException,
    description: 'Article is not equal with product article',
  })
  @ApiParam({ name: 'id', description: 'Product id' })
  @ApiOkResponse({
    type: RealizationEntity,
    description: 'Realization created successfully',
  })
  @Post(':id')
  createRealization(
    @Body() dto: CreateRealizationDto,
    @Param('id', ParseUUIDPipe) productId: string,
  ) {
    return this.realizationService.createRealization(dto, productId);
  }

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

  @ApiParam({ name: 'id', description: 'Product id' })
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
  @Get(':id')
  getRealizationByProductId(
    @Query() query: GetOneRealizationDto,
    @Param('id', ParseUUIDPipe) productId: string,
  ) {
    return this.realizationService.getRealizationByProductId(productId, query);
  }

  @ApiParam({ name: 'id', description: 'Realization id' })
  @ApiOkResponse({
    description: 'Realization updated successfully',
    type: RealizationEntity,
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Realization not found',
  })
  @Patch(':id')
  updateRealization(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRealizationDto,
  ) {
    return this.realizationService.updateRealization(id, dto);
  }

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
  @Delete(':id')
  deleteRealization(@Param('id', ParseUUIDPipe) id: string) {
    return this.realizationService.deleteRealization(id);
  }
}
