import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateClassDto {
  @IsString({ message: '제목을 입력해주세요' })
  @ApiProperty({
    type: String,
    description: '클래스 이름',
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
}
