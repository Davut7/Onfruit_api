import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { AdminsEntity } from '../../user/entities/adminUsers.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'admin_tokens' })
export class AdminTokenEntity extends BaseEntity {
  @ApiProperty({
    title: 'refresh token',
    name: 'refreshToken',
    description: 'System user refresh token',
    type: String,
  })
  @Column({ type: 'text', nullable: false })
  refreshToken: string;

  @ApiProperty({
    title: 'System user id',
    name: 'userId',
    description: 'System user id',
    type: String,
  })
  @Column({
    type: 'uuid',
    nullable: false,
  })
  userId: string;

  @ApiProperty({ type: () => AdminsEntity })
  @OneToOne(() => AdminsEntity, (user) => user.token, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: AdminsEntity;
}
