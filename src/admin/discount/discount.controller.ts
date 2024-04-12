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
  UseGuards,
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
import { AbilitiesGuard } from 'src/helpers/guards/abilities.guard';
import { CheckAbilities } from 'src/helpers/common/decorators/abilityDecorator.decorator';
import { ActionEnum, SubjectEnum } from 'src/helpers/constants';

@ApiTags('discounts')
@ApiBearerAuth()
@UseGuards(AbilitiesGuard)
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
  @CheckAbilities({
    action: ActionEnum.Create,
    subject: SubjectEnum.Discounts,
  })
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
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Discounts,
  })
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
  @CheckAbilities({
    action: ActionEnum.Read,
    subject: SubjectEnum.Discounts,
  })
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
  @CheckAbilities({
    action: ActionEnum.Update,
    subject: SubjectEnum.Discounts,
  })
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
  @CheckAbilities({
    action: ActionEnum.Delete,
    subject: SubjectEnum.Discounts,
  })
  async deleteDiscount(@Param('discountId', ParseUUIDPipe) discountId: string) {
    return this.discountService.deleteDiscount(discountId);
  }
}
