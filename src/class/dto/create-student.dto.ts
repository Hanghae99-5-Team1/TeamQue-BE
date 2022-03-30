import { IsUUID } from 'class-validator';

export class CreateStudentDto {
  @IsUUID('4', { message: '클래스 고유번호를 확인해주세요' })
  uuid: number;
}
