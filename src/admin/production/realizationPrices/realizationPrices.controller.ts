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
  ApiTags,
  ApiOperation,
} from '@nestjs/swagger';
import { RealizationPriceEntity } from './entities/realizationPrices.entity';

@ApiTags('realization-prices')
@ApiBearerAuth()
@Controller('/production/realization/price')
export class RealizationPricesController {
  constructor(
    private readonly realizationPricesService: RealizationPricesService,
  ) {}

  @ApiOperation({ summary: 'Create a new realization price' })
  @ApiOkResponse({
    type: RealizationPriceEntity,
    description: 'Realization price created successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @Post(':productId')
  createPrice(
    @Body() dto: CreateRealizationPriceDto,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.realizationPricesService.createRealizationPrice(dto, productId);
  }

  @ApiOperation({ summary: 'Get prices of a product' })
  @ApiOkResponse({
    type: [RealizationPriceEntity],
    description: 'Product prices retrieved successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @Get(':productId')
  getPrices(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() query: GetPricesDto,
  ) {
    return this.realizationPricesService.getPrices(productId, query);
  }

  @ApiOperation({ summary: 'Update a product price' })
  @ApiOkResponse({
    type: RealizationPriceEntity,
    description: 'Product price updated successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Price not found',
  })
  @Patch(':priceId')
  updatePrice(
    @Param('priceId', ParseUUIDPipe) priceId: string,
    @Body() dto: UpdateRealizationPriceDto,
  ) {
    return this.realizationPricesService.updateRealizationPrice(priceId, dto);
  }

  @ApiOperation({ summary: 'Delete a product price' })
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
  @Delete(':priceId')
  deletePrice(@Param('priceId', ParseUUIDPipe) priceId: string) {
    return this.realizationPricesService.deleteRealizationPrice(priceId);
  }
}
