import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateStudentDto {
  @IsUUID('4', { message: '클래스 고유번호를 확인해주세요' })
  @ApiProperty({
    type: String,
    description: '클레스 고유번호',
    example: 'c3b905e0-466c-4d0d-a994-ec5df9b9f79b',
  })
  uuid: string;
}
