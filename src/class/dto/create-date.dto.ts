import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { DateDto } from './date.dto';

export class CreateDateDto {
  @IsString({ message: '시작일을 입력해주세요' })
  @ApiProperty({
    type: String,
    description: '강의시작일',
    example: '2022-04-01',
  })
  startDate: string;

  @IsString({ message: '종료일을 입력해주세요' })
  @ApiProperty({
    type: String,
    description: '강의종료일',
    example: '2022-04-30',
  })
  endDate: string;

  @IsArray({ message: '강의날짜를 배열로 입력해주세요' })
  @ValidateNested({ each: true })
  @Type(() => DateDto)
  @ApiProperty({
    type: () => DateDto,
    description: '강의요일 및 시간',
    example: [{ day: 1, startTime: '12:30', endTime: '15:30' }],
  })
  times: DateDto[];
}
