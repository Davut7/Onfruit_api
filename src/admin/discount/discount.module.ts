import { Module } from "@nestjs/common";
import { DiscountService } from "./discount.service";
import { DiscountController } from "./discount.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DiscountEntity } from "./entities/discount.entity";
import { ProductEntity } from "../stock/product/entities/product.entity";



@Module({
    imports: [TypeOrmModule.forFeature([DiscountEntity, ProductEntity])],
    providers: [DiscountService],
    controllers:[DiscountController]
})
export class DiscountModule {}