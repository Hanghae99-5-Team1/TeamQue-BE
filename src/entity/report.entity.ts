import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'report', schema: 'public' })
export class Report {
  @ApiProperty({ type: Number, description: 'report_id' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ type: Number, description: 'userId' })
  @Column()
  userId: number;

  @ApiProperty({ type: Number, description: 'reported' })
  @Column()
  reported: number;

  @ApiProperty({ type: Number, description: 'reported' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'updatedAt' })
  @UpdateDateColumn()
  updatedAt: Date;
}
