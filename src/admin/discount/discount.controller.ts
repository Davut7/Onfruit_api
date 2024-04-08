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
  ApiTags,
  getSchemaPath,
  ApiOperation,
} from '@nestjs/swagger';
import { DiscountEntity } from './entities/discount.entity';

@ApiTags('discounts')
@ApiBearerAuth()
@Controller('/admin/discounts')
export class DiscountController {
  constructor(private discountService: DiscountService) {}

  @ApiOperation({ summary: 'Create a new discount for a product' })
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
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Product not found',
  })
  @Post(':productId')
  async createDiscount(
    @Body() dto: CreateDiscountDto,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.discountService.createDiscount(productId, dto);
  }

  @ApiOperation({ summary: 'Get all available discounts' })
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

  @ApiOperation({ summary: 'Get a specific discount by ID' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        discounts: { $ref: getSchemaPath(DiscountEntity) },
      },
    },
    description: 'Discount returned successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Discount not found',
  })
  @Get(':discountId')
  async getOneDiscount(@Param('discountId', ParseUUIDPipe) discountId: string) {
    return this.discountService.getOneDiscount(discountId);
  }

  @ApiOperation({ summary: 'Update a discount' })
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
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Discount not found',
  })
  @Patch(':discountId')
  async updateDiscount(
    @Param('discountId', ParseUUIDPipe) discountId: string,
    @Body() dto: UpdateDiscountDto,
  ) {
    return this.discountService.updateDiscount(discountId, dto);
  }

  @ApiOperation({ summary: 'Delete a discount' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Discount deleted' },
      },
    },
    description: 'Discount deleted successfully',
  })
  @ApiNotFoundResponse({
    type: NotFoundException,
    description: 'Discount not found',
  })
  @Delete(':discountId')
  async deleteDiscount(@Param('discountId', ParseUUIDPipe) discountId: string) {
    return this.discountService.deleteDiscount(discountId);
  }
}
