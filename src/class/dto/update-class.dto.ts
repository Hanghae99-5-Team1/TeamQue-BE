import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateClassDto {
  @IsString({ message: '제목을 입력해주세요' })
  title: string;

  @IsOptional()
  @IsUrl({ message: 'url을 입력해주세요' })
  imageUrl?: string;
}
