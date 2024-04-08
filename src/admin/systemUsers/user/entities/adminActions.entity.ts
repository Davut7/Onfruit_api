import { IsEnum, IsNotEmpty } from 'class-validator';
import { BaseEntity } from 'src/helpers/baseEntity.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { SubjectEntity } from './adminSubjects.Entity';
import { ActionEnum } from 'src/helpers/constants';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'admin_actions' })
export class ActionEntity extends BaseEntity {
  @ApiProperty({
    title: 'Action',
    name: 'action',
    description: 'The action performed by the admin',
    enum: ActionEnum,
  })
  @IsEnum(ActionEnum)
  @IsNotEmpty()
  @Column({ type: 'enum', enum: ActionEnum })
  action: ActionEnum;

  @ApiProperty({
    title: 'Subject ID',
    name: 'subjectId',
    description: 'The ID of the subject related to the action',
    type: String,
  })
  @Column({ type: 'uuid', nullable: false })
  subjectId: string;

  @ApiProperty({ type: () => SubjectEntity })
  @ManyToOne(() => SubjectEntity, (subject) => subject.action, {
    onDelete: 'CASCADE',
  })
  subject: SubjectEntity;
}
