import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/createDiscount.dto';
import { UpdateDiscountDto } from './dto/updateDiscount.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { DiscountEntity } from './entities/discount.entity';

@ApiTags('discounts')
@ApiBearerAuth()
@Controller('/admin/discounts')
export class DiscountController {
  constructor(private discountService: DiscountService) {}

  @ApiCreatedResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Product discount created successfully',
        },
        discount: {
          $ref: getSchemaPath(DiscountEntity),
          description: 'Discount',
        },
      },
    },
    description: 'Discount for product created successfully',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Product id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @Post(':id')
  async createDiscount(
    @Body() dto: CreateDiscountDto,
    @Param('id', ParseUUIDPipe) productId: string,
  ) {
    return this.discountService.createDiscount(productId, dto);
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Products with discount returned successfully',
        },
        discountsCount: {
          type: 'number',
          description: 'Product with discounts count',
        },
        discounts: {
          type: 'array',
          items: { $ref: getSchemaPath(DiscountEntity) },
        },
      },
    },
    description: 'All available discount returned successfully',
  })
  @Get()
  async getDiscounts() {
    return this.discountService.getDiscounts();
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        discounts: { $ref: getSchemaPath(DiscountEntity) },
      },
    },
    description: 'Discount returned successfully',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Discount id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Discount not found',
  })
  @Get(':id')
  async getOneDiscount(@Param('id', ParseUUIDPipe) discountId: string) {
    return this.discountService.getOneDiscount(discountId);
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        discounts: { $ref: getSchemaPath(DiscountEntity) },
        message: { type: 'string', example: 'Discount updated successfully' },
      },
    },
    description: 'Discount returned successfully',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Discount id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Discount not found',
  })
  @Patch(':id')
  async updateDiscount(
    @Param('id', ParseUUIDPipe) discountId: string,
    @Body() dto: UpdateDiscountDto,
  ) {
    return this.discountService.updateDiscount(discountId, dto);
  }

  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Discount deleted' },
      },
    },
    description: 'Discount deleted successfully',
  })
  @ApiParam({ name: 'id', type: 'string', description: 'Discount id' })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Discount not found',
  })
  @Delete(':id')
  async deleteDiscount(@Param('id', ParseUUIDPipe) discountId: string) {
    return this.discountService.deleteDiscount(discountId);
  }
}
