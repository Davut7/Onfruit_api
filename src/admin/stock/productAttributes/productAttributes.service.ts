import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductService } from '../product/product.service';
import { ProductAttributesEntity } from './entities/productAttributes.entity';
import { CreateProductAttrDto } from './dto/createAttribute.dto';
import { UpdateProductAttrDto } from './dto/updateAttribute.dto';
import { LngEnum } from 'src/helpers/constants';

@Injectable()
export class ProductAttributesService {
  private readonly logger = new Logger(ProductAttributesService.name);
  constructor(
    @InjectRepository(ProductAttributesEntity)
    private attributeRepository: Repository<ProductAttributesEntity>,
    @Inject(forwardRef(() => ProductService))
    private productService: ProductService,
  ) { }
  
  async createProductAttributes(
    dto: CreateProductAttrDto,
    productId: string,
  ) {
    this.logger.log(
      `Creating one  product attribute \n ${JSON.stringify(dto, null, 2)}`,
    );
    await this.productService.getProductById(productId);
    await this.isLangAdded(productId, dto.language);
    const attribute = this.attributeRepository.create({
      title: dto.title,
      language: dto.language,
      description: dto.description,
      manufacturerCountry: dto.manufacturerCountry,
      productId: productId,
    });
    await this.attributeRepository.save(attribute);
    this.logger.log(
      `Product attribute created successfully! \n ${JSON.stringify(
        attribute,
        null,
        2,
      )}`,
    );
    return attribute;
  }

  async getOneAttribute(attributeId: string) {
    this.logger.log(`Getting one attribute with id ${attributeId}`);
    const attribute = await this.attributeRepository.findOne({
      where: { id: attributeId },
    });
    if (!attribute) {
      this.logger.error(`Getting one attribute with id ${attributeId}`);
      throw new NotFoundException(
        `Attribute with id ${attributeId} not found!`,
      );
    }
    this.logger.log(`Attribute with id ${attributeId} returned successfully!`);
    return attribute;
  }

  async deleteAttribute(attributeId: string) {
    this.logger.log(`Deleting one attribute with id ${attributeId}`);
    await this.getOneAttribute(attributeId);
    await this.attributeRepository.delete({
      id: attributeId,
    });
    this.logger.log(
      `Product attribute with id ${attributeId} deleted successfully!`,
    );
    return {
      message: 'Product attribute deleted successfully!',
    };
  }

  async updateAttribute(attributeId: string, dto: UpdateProductAttrDto) {
    this.logger.log(`Updating one attribute with id ${attributeId}`);
    const attribute = await this.getOneAttribute(attributeId);

    const { language, ...updateData } = dto;

    Object.assign(attribute, updateData);

    await this.attributeRepository.save(attribute);
    this.logger.log(
      `Product attribute with id ${attributeId} updated successfully!`,
    );
    return attribute;
  }

  private async isLangAdded(productId: string, language: LngEnum) {
    this.logger.log(
      `Checking product with id ${productId} to existing attribute with language ${language}`,
    );
    const candidate = await this.attributeRepository.findOne({
      where: { productId: productId, language: language },
    });
    if (candidate)
      throw new BadRequestException(
        `Product already have attribute in this language ${language}`,
      );
  }
}
