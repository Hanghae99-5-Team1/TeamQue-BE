import { IsInt, IsNotEmpty } from 'class-validator';

export class GetAllDateByMonthDto {
  @IsNotEmpty()
  @IsInt()
  year: number;

  @IsNotEmpty()
  @IsInt()
  month: number;
}
