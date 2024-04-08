import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from 'src/admin/stock/category/entities/category.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/client/user/users/entities/user.entity';
import { ClientSubcategoryService } from '../subcategory/clientSubcategory.service';
import { GetClientSubcategoryDto } from '../subcategory/dto/getSubcategory.dto';

@Injectable()
export class ClientCategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private categoryRepository: Repository<CategoryEntity>,
    private clientSubcategoryService: ClientSubcategoryService,
  ) {}

  async getCategories() {
    const [categories, count] = await this.categoryRepository.findAndCount();
    return {
      categories: categories,
      categoriesCount: count,
      message: 'Categories returned successfully!',
    };
  }

  async getOneCategory(
    categoryId: string,
    query: GetClientSubcategoryDto,
    currentUser?: UserEntity,
  ) {
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
      relations: { subcategories: true },
    });
    if (!category)
      throw new BadRequestException(
        `Category with id ${categoryId} not found!`,
      );
    const subcategoryProducts =
      await this.clientSubcategoryService.getSubcategoriesByCategory(
        categoryId,
        query,
        currentUser,
      );
    return {
      category: category,
      subcategoryProducts: subcategoryProducts.subcategoryProducts,
      productsCount: subcategoryProducts.productsCount,
    };
  }
}
