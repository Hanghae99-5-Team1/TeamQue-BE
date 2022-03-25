import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { DateDto } from './date.dto';

export class CreateClassDto {
  @IsNotEmpty({ message: '강의명을 입력해주세요' })
  @IsString({ message: '문자열을 입력해주세요' })
  title: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsNotEmpty()
  @IsString()
  startDate: string;

  @IsNotEmpty()
  @IsString()
  endDate: string;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DateDto)
  times: DateDto[];
}
