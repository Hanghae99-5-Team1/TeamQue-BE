import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateStudentDto {
  @IsString({ message: '문자열을 입력해주세요' })
  @ApiProperty({
    type: String,
    description: '클레스 고유번호',
    example: 'KK5iRq+z+4On/+y6SYT5btjz+rKeETgyE2NhiORGH4545aILRPA==',
  })
  inviteCode: string;
}
