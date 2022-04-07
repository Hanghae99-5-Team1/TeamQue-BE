import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class UpdateDateDto {
  @IsInt({ message: '년도를 입력해주세요' })
  @ApiProperty({ type: Number, description: '연도', example: 2022 })
  year: number;

  @IsInt({ message: '달을 입력해주세요' })
  @ApiProperty({ type: Number, description: '월', example: 3 })
  month: number;

  @IsInt({ message: '날짜를 입력해주세요' })
  @ApiProperty({ type: Number, description: '일', example: 15 })
  day: number;

  @IsString({ message: '시작시간을 입력해주세요' })
  @ApiProperty({ type: String, description: '시작시간', example: '12:00' })
  startTime: string;

  @IsString({ message: '종료시간을 입력해주세요' })
  @ApiProperty({ type: String, description: '종료시간', example: '15:00' })
  endTime: string;
}
