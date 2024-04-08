import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'logs' })
export class LogsEntity {
  @ApiProperty({
    title: 'ID',
    name: 'id',
    description: 'The ID of the log entry',
    type: Number,
  })
  @PrimaryGeneratedColumn()
  public id: number;

  @ApiProperty({
    title: 'Host',
    name: 'host',
    description: 'The host of the request',
    type: String,
    required: false,
  })
  @IsOptional()
  @Column({ nullable: true })
  public host: string;

  @ApiProperty({
    title: 'URL',
    name: 'url',
    description: 'The URL of the request',
    type: String,
    required: false,
  })
  @IsOptional()
  @Column({ nullable: true })
  public url: string;

  @ApiProperty({
    title: 'Status Code',
    name: 'statusCode',
    description: 'The status code of the response',
    type: Number,
    required: false,
  })
  @IsOptional()
  @Column({ nullable: true })
  public statusCode: number;

  @ApiProperty({
    title: 'Method',
    name: 'method',
    description: 'The HTTP method of the request',
    type: String,
    required: false,
  })
  @IsOptional()
  @Column({ nullable: true })
  public method: string;

  @ApiProperty({
    title: 'User',
    name: 'user',
    description: 'The user associated with the log entry',
    type: String,
    required: false,
  })
  @IsOptional()
  @Column({ nullable: true })
  public user: string;

  @ApiProperty({
    title: 'Context',
    name: 'context',
    description: 'The context of the log entry',
    type: String,
  })
  @IsOptional()
  @Column()
  public context: string;

  @ApiProperty({
    title: 'Message',
    name: 'message',
    description: 'The message of the log entry',
    type: String,
  })
  @IsOptional()
  @Column()
  public message: string;

  @ApiProperty({
    title: 'Level',
    name: 'level',
    description: 'The level of the log entry',
    type: String,
  })
  @IsOptional()
  @Column()
  public level: string;

  @ApiProperty({
    title: 'Created At',
    name: 'createdAt',
    description: 'The timestamp when the log entry was created',
    type: String,
  })
  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt: string;
}
