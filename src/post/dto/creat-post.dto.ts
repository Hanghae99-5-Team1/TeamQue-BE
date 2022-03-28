import { IsNotEmpty, IsString } from 'class-validator';
import { PostTypes } from '../model/postType.model';

export class CreatePostDto {
  @IsNotEmpty({ message: '제목을 입력해주세요' })
  @IsString({ message: '문자열을 입력해주세요' })
  title: string;

  @IsNotEmpty({ message: '내용을 입력해주세요' })
  @IsString({ message: '문자열을 입력해주세요' })
  content: string;

  @IsNotEmpty()
  postType: PostTypes;
}
