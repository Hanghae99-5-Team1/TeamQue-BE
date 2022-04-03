import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { DateDto } from './date.dto';

export class CreateClassDto {
  @IsString({ message: '제목을 입력해주세요' })
  @ApiProperty({
    type: String,
    description: '강의이름',
    example: '강의이름이오~!',
  })
  title: string;

  @IsOptional()
  @IsUrl({ message: 'url을 입력해주세요' })
  @ApiProperty({
    type: String,
    description: '강의이미지 url',
    example: 'https://i.ibb.co/Rj2jn0X/image.png',
  })
  imageUrl?: string;

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
