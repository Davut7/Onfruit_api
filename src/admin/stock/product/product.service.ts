import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { ProductEntity } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { SubcategoryService } from '../subcategory/subcategory.service';
import { ManufacturerCountriesEntity } from './entities/countries.entity';
import { GetManufacturerCountries } from './dto/getManufacturerCountries';
import { GetProductsDto } from './dto/getProducts.dto';
import {
  GetProductsOrderEnum,
  OrderType,
  SubcategoryOrderEnum,
} from 'src/helpers/constants';
import { CreateRealizationDto } from 'src/admin/production/realizations/dto/createRealization.dto';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { MediaService } from 'src/media/media.service';
import { GetOneSubcategory } from '../subcategory/dto/getOneSubcategory';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @Inject(forwardRef(() => SubcategoryService))
    private subcategoryService: SubcategoryService,
    @InjectRepository(ManufacturerCountriesEntity)
    private manufacturerCountriesRepository: Repository<ManufacturerCountriesEntity>,
    private mediaService: MediaService,
    private dataSource: DataSource,
  ) {}

  async createProduct(dto: CreateProductDto) {
    await this.isProductUnique(dto.article, dto.barcode);
    await this.subcategoryService.getSubcategoryById(dto.subcategoryId);
    const product = this.productRepository.create(dto);
    await this.productRepository.save(product);
    return {
      id: product.id,
      article: product.article,
      commodity: product.commodity,
      barcode: product.barcode,
      message: 'Product created successfully!',
    };
  }

  async getProducts(query?: GetProductsDto) {
    const {
      page = 1,
      take = 10,
      search = '',
      orderBy = GetProductsOrderEnum.createdAt,
      order = OrderType.ASC,
    } = query;

    const productsQuery = this.productRepository
      .createQueryBuilder('products')
      .leftJoin('products.arrivals', 'arrivals')
      .leftJoin('products.subcategory', 'subcategory')
      .select([
        'products.id as id',
        'products.article as article',
        'products.commodity as commodity',
        'products.barcode as barcode',
        'products.currentSum as "currentSum"',
        'products.currentQuantity as "currentQuantity"',
        'products.currentSpoiledQuantity as "currentSpoiledQuantity"',
        'products."currentSaleQuantity" as "currentSaleQuantity"',
        'products.createdAt as "createdAt"',
        'COALESCE(ROUND(SUM(arrivals.sum) / NULLIF(SUM(arrivals.quantity),0), 3), 0.00) as "middlePrice"',
        'subcategory.ruTitle as "subcategoryTitle"',
      ])
      .andWhere('products.article ILIKE :search', { search: `%${search}%` })
      .groupBy(
        'products.id, products.article, products.barcode,  products.createdAt, subcategory.ruTitle',
      )
      .orderBy(`"${orderBy}"`, order)
      .take(take)
      .skip((page - 1) * take);
    if (query.commodity) {
      productsQuery.andWhere('products.commodity = :commodity', {
        commodity: query.commodity,
      });
    }

    const products = await productsQuery.getRawMany();

    const productsCount = await this.productRepository.count();

    return { products, productsCount };
  }

  async getOneProduct(productId: string) {
    const product = await this.productRepository
      .createQueryBuilder('products')
      .leftJoinAndSelect('products.productAttributes', 'productAttributes')
      .leftJoinAndSelect('products.realizations', 'realizations')
      .leftJoinAndSelect('products.prices', 'prices')
      .where('products.id = :productId', { productId: productId })
      .select([
        'products.id',
        'products.article',
        'products.commodity',
        'products.barcode',
        'productAttributes.id',
        'productAttributes.language',
        'productAttributes.title',
        'products.currentQuantity',
        'products.currentSum',
        'products.currentSpoiledQuantity',
        'products.currentSaleQuantity',
        'realizations.id',
        'realizations.productArticle',
        'realizations.quantity',
        'realizations.middlePrice',
        'realizations.sum',
        'realizations.isActive',
        'prices.id',
        'prices.price',
        'prices.quantity',
        'prices.userType',
      ])
      .getOne();
    if (!product)
      throw new NotFoundException(
        `Product with id ${productId} does not exist!`,
      );
    return {
      product,
      message: `Product with id ${productId} returned successfully!`,
    };
  }

  async updateProduct(productId: string, dto: UpdateProductDto) {
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    product.barcode = dto.barcode;
    await this.productRepository.save(product);
    return {
      product: product,
      message: `Product with id ${productId} was successfully updated`,
    };
  }

  async deleteProduct(productId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    let mediaIds = [];
    try {
      const product = await this.getProductById(productId);
      if (!product)
        throw new NotFoundException(`Product with id ${productId} not found!`);
      for (const media of product.medias) {
        mediaIds.push(media.id);
      }
      await this.mediaService.deleteMedias(mediaIds, queryRunner);
      await queryRunner.manager.delete(ProductEntity, { id: productId });
      return { message: 'Product deleted successfully!' };
    } catch (err) {
      this.logger.error('Category not deleted server error!');
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(err);
    } finally {
      await queryRunner.release();
      this.logger.log('Category deleted successfully!');
    }
  }

  async getProductByArticle(search: string) {
    const product = await this.productRepository
      .createQueryBuilder('products')
      .leftJoin('products.productAttributes', 'productAttributes')
      .leftJoin('products.arrivals', 'arrivals')
      .leftJoin('products.prices', 'prices')
      .where(
        'products.article ILIKE :search AND productAttributes.language = :language',
        { search: `%${search}%`, language: 'ru' },
      )
      .select([
        'products.id as id',
        'products.article as article',
        'productAttributes.title',
        'products.currentSaleQuantity as "currentSaleQuantity"',
        'Sum(arrivals.spoiledQuantity) as "totalSpoiledQuantity"',
        'Sum(arrivals.sum) as "totalSum"',
        'Sum(arrivals.quantity) as "totalQuantity"',
        'COALESCE(ROUND(Sum(arrivals.sum) / NULLIF(Sum(arrivals.quantity), 0), 3), 0.00) as "middlePrice"',
      ])
      .groupBy('products.id, products.article, title')
      .getRawMany();
    return {
      product,
      message: `Product with article ${search} returned successfully!`,
    };
  }

  async isProductUnique(article: string, barcode: string) {
    const productArticle = await this.productRepository.findOne({
      where: { article: article },
    });
    if (productArticle)
      throw new ConflictException(
        `Product with article ${productArticle.article} already exists!`,
      );
    const productBarcode = await this.productRepository.findOne({
      where: { barcode: barcode },
    });
    if (productBarcode)
      throw new ConflictException(
        `Product with barcode ${productBarcode.barcode} already exists!`,
      );
  }

  async getProductById(productId: string) {
    const product = await this.productRepository
      .createQueryBuilder('products')
      .leftJoinAndSelect('products.productAttributes', 'productAttributes')
      .leftJoinAndSelect('products.medias', 'medias')
      .where('products.id = :productId', { productId })
      .getOne();
    if (!product)
      throw new NotFoundException(`Product with id ${productId} not found!`);
    return product;
  }

  async getBySubcategoryId(subcategoryId: string, query: GetOneSubcategory) {
    const {
      page = 1,
      take = 10,
      orderBy = SubcategoryOrderEnum.createdAt,
      order = OrderType.ASC,
      search = '',
    } = query;

    const productQuery = this.productRepository
      .createQueryBuilder('products')
      .leftJoin('products.productAttributes', 'productAttributes')
      .leftJoin('products.arrivals', 'arrivals')
      .leftJoin('products.medias', 'medias')
      .select([
        'products.id as id',
        'productAttributes.title as title',
        'products.article as article',
        'products.barcode as barcode',
        'products.commodity as commodity',
        'products.createdAt as "createdAt"',
        'products."currentSum" as "currentSum"',
        'products."currentSpoiledQuantity" as "currentSpoiledQuantity"',
        'products."currentQuantity" as "currentQuantity"',
        'products."currentSaleQuantity" as "currentSaleQuantity"',
        'SUM(arrivals.quantity) as "totalQuantity"',
        'SUM(arrivals.sum) as "totalSum"',
        'SUM(arrivals.spoiledQuantity) as "totalSpoiledQuantity"',
        'COALESCE(ROUND(SUM(arrivals.sum) / NULLIF(SUM(arrivals.quantity), 0), 3), 0.00) as "middlePrice"',
      ])
      .where('products.subcategoryId = :subcategoryId', {
        subcategoryId: subcategoryId,
      })
      .andWhere(
        'productAttributes.language = :language AND (title ILIKE :search OR article ILIKE :search OR barcode ILIKE :search)',
        {
          language: 'ru',
          search: `%${search}%`,
        },
      )
      .groupBy(
        'products.createdAt, article, barcode, commodity, title, products.id',
      )
      .orderBy(`"${orderBy}"`, order)
      .take(take)
      .skip((page - 1) * take);

    if (query.commodity) {
      productQuery.andWhere('products.commodity = :commodity', {
        commodity: query.commodity,
      });
    }

    const products = await productQuery.getRawMany();

    return { products };
  }

  async checkStockToQuantity(
    product: ProductEntity,
    dto: CreateRealizationDto,
  ) {
    if (
      product.currentQuantity < dto.quantity ||
      product.currentSum < dto.sum
    ) {
      throw new BadRequestException(
        `Product have quantity ${product.currentQuantity} and sum ${product.currentSum}!. You provided more than in stock!`,
      );
    }
  }

  async getCountries(query: GetManufacturerCountries) {
    const { search = '', lng = 'ru' } = query;
    const countries = await this.manufacturerCountriesRepository
      .createQueryBuilder('countries')
      .select(['countries.id', `countries.${lng}Country`])
      .where(`countries.${lng}Country ILIKE :search`, { search: `%${search}%` })
      .getMany();

    return countries;
  }

  async createProductImage(productId: string, image: Express.Multer.File) {
    await this.getProductById(productId);
    const media = await this.mediaService.createMedia(
      image,
      productId,
      'productId',
    );
    return {
      message: 'Product image uploaded successfully',
      media: media,
    };
  }

  async deleteProductImage(mediaId: string) {
    await this.mediaService.deleteOneMedia(mediaId);
    return {
      message: 'Product image deleted successfully!',
    };
  }
}
