import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminTokenEntity } from './entities/adminToken.entity';
import { AdminTokenService } from './token.service';

@Module({
  imports: [TypeOrmModule.forFeature([AdminTokenEntity])],
  providers: [AdminTokenService],
  exports: [AdminTokenService],
})
export class AdminTokenModule {}
