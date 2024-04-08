import { Test, TestingModule } from '@nestjs/testing';
import { CategoryService } from '../category.service';

describe('TweetsService', () => {
  let service: CategoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryService],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

});
