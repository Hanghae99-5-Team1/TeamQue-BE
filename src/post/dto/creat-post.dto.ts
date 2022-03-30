import { IsNotEmpty, IsString } from 'class-validator';
import { PostTypes } from '../model/postType.model';

export class CreatePostDto {
  @IsString({ message: '제목을 입력해주세요' })
  title: string;

  @IsString({ message: '내용을 입력해주세요' })
  content: string;

  @IsNotEmpty({ message: 'postType을 지정해주세요' })
  postType: PostTypes;
}
