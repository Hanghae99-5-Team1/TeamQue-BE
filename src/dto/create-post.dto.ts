import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { PostTypes } from 'src/post/post.interface';

export class CreatePostDto {
  @IsString({ message: '제목을 입력해주세요' })
  @ApiProperty({
    type: String,
    description: '게시글 제목',
    example: '제목이오~!',
  })
  title: string;

  @IsString({ message: '내용을 입력해주세요' })
  @ApiProperty({
    type: String,
    description: '게시글 내용',
    example: '내용이오~!',
  })
  content: string;

  @IsNotEmpty({ message: 'postType을 지정해주세요' })
  @ApiProperty({
    enum: PostTypes,
    description: '게시글 타입',
    example: 'Question',
  })
  postType: PostTypes;
}
