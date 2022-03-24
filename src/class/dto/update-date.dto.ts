import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class UpdateDateDto {
  @IsNotEmpty()
  @IsInt()
  year: number;

  @IsNotEmpty()
  @IsInt()
  month: number;

  @IsNotEmpty()
  @IsInt()
  day: number;

  @IsNotEmpty()
  @IsString()
  startTime: string;

  @IsNotEmpty()
  @IsString()
  endTime: string;
}
