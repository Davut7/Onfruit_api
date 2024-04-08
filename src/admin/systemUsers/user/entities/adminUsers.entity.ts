import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { AdminRoleEnum } from 'src/helpers/constants';
import { AdminTokenEntity } from '../../token/entities/adminToken.entity';
import { SubjectEntity } from './adminSubjects.Entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'admin_users' })
export class AdminsEntity extends BaseEntity {
  @ApiProperty({
    title: 'Name',
    name: 'name',
    description: 'The name of the admin user',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  name: string;

  @ApiProperty({
    title: 'Password',
    name: 'password',
    description: 'The password of the admin user',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
  })
  @Column({ type: 'varchar', nullable: false, select: false })
  password: string;

  @ApiProperty({
    title: 'Confirm Password',
    name: 'confirmPassword',
    description: 'The confirmed password of the admin user',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/, {
    message:
      'Password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, one number, and one special character.',
  })
  @Column({ type: 'varchar', nullable: false, select: false })
  confirmPassword: string;

  @ApiProperty({
    title: 'Role',
    name: 'role',
    description: 'The role of the admin user',
    enum: AdminRoleEnum,
  })
  @IsEnum(AdminRoleEnum)
  @IsNotEmpty()
  @Column({ type: 'varchar', nullable: false })
  role: AdminRoleEnum;

  @ApiProperty({
    title: 'Is Active',
    name: 'isActive',
    description: 'Indicates whether the admin user is active or not',
    type: Boolean,
  })
  @IsNotEmpty()
  @IsBoolean()
  @Column({ type: 'boolean', nullable: false, default: false })
  isActive: boolean;

  @ApiProperty({ type: () => AdminTokenEntity })
  @OneToOne(() => AdminTokenEntity, (token) => token.user)
  token: AdminTokenEntity;

  @ApiProperty({ type: () => [SubjectEntity] })
  @OneToMany(() => SubjectEntity, (subjects) => subjects.admin)
  subjects: SubjectEntity[];
}
