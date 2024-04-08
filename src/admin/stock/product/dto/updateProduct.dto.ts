import { PickType } from '@nestjs/swagger';
import { ProductEntity } from '../entities/product.entity';

export class UpdateProductDto extends PickType(ProductEntity, ['barcode'] as const) {}
