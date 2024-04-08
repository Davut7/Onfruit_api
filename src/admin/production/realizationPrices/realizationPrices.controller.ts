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
} from '@nestjs/common';
import { RealizationPricesService } from './realizationPrices.service';
import { CreateRealizationPriceDto } from './dto/createRealization.dto';
import { GetPricesDto } from './dto/getPrices.dto';
import { UpdateRealizationPriceDto } from './dto/updateRealization.dto';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RealizationPriceEntity } from './entities/realizationPrices.entity';

@ApiTags('realization-prices')
@ApiBearerAuth()
@Controller('/production/realization/price')
export class RealizationPricesController {
  constructor(
    private readonly realizationPricesService: RealizationPricesService,
  ) {}

  @ApiParam({ name: 'id', type: 'string', description: 'Product id' })
  @ApiOkResponse({
    type: RealizationPriceEntity,
    description: 'Realization price created successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @Post(':id')
  createPrice(
    @Body() dto: CreateRealizationPriceDto,
    @Param('id', ParseUUIDPipe) productId: string,
  ) {
    return this.realizationPricesService.createRealizationPrice(dto, productId);
  }

  @ApiOkResponse({
    type: [RealizationPriceEntity],
    description: 'Product prices retrieved successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @Get(':id')
  getPrices(
    @Param('id', ParseUUIDPipe) productId: string,
    @Query() query: GetPricesDto,
  ) {
    return this.realizationPricesService.getPrices(productId, query);
  }

  @ApiOkResponse({
    type: RealizationPriceEntity,
    description: 'Product price updated successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Price not found',
  })
  @Patch(':id')
  updatePrice(
    @Param('id', ParseUUIDPipe) priceId: string,
    @Body() dto: UpdateRealizationPriceDto,
  ) {
    return this.realizationPricesService.updateRealizationPrice(priceId, dto);
  }

  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Price not found',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Price deleted successfully!' },
      },
    },
  })
  @Delete(':id')
  deletePrice(@Param('id', ParseUUIDPipe) priceId: string) {
    return this.realizationPricesService.deleteRealizationPrice(priceId);
  }
}
