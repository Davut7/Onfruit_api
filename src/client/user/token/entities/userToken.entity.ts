import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'user_tokens' })
export class UserTokenEntity extends BaseEntity {
  @ApiProperty({ description: 'The refresh token associated with the user' })
  @Column({ type: 'text', nullable: false })
  refreshToken: string;

  @ApiProperty({ description: 'The unique identifier of the user' })
  @Column({ type: 'uuid', nullable: false, unique: true })
  userId: string;

  @ApiProperty({ type: () => UserEntity })
  @OneToOne(() => UserEntity, (user) => user.token, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
