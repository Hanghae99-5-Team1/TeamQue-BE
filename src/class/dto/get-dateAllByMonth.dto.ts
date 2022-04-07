import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class GetAllDateByMonthDto {
  @IsInt({ message: '연도를 입력해주세요' })
  @ApiProperty({ type: Number, description: '년', example: 2022 })
  year: number;

  @IsInt({ message: '월을 입력해주세요' })
  @ApiProperty({ type: Number, description: '월', example: 3 })
  month: number;
}
