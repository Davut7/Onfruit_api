import { IsEnum, IsNotEmpty } from 'class-validator';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { SubjectEnum } from 'src/helpers/constants';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AdminsEntity } from './adminUsers.entity';
import { ActionEntity } from './adminActions.Entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'admin_subjects' })
export class SubjectEntity extends BaseEntity {
  @ApiProperty({
    title: 'Subject',
    name: 'subject',
    description: 'The subject of the admin action',
    enum: SubjectEnum,
  })
  @IsEnum(SubjectEnum)
  @IsNotEmpty()
  @Column({ type: 'enum', enum: SubjectEnum })
  subject: SubjectEnum;

  @ApiProperty({
    title: 'Admin ID',
    name: 'adminId',
    description: 'The ID of the admin related to the subject',
    type: String,
  })
  @Column({ type: 'uuid', nullable: false })
  adminId: string;

  @ApiProperty({ type: () => AdminsEntity })
  @ManyToOne(() => AdminsEntity, (admin) => admin.subjects, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  admin: AdminsEntity;

  @ApiProperty({ type: () => [ActionEntity] })
  @OneToMany(() => ActionEntity, (action) => action.subject)
  action: ActionEntity[];
}
