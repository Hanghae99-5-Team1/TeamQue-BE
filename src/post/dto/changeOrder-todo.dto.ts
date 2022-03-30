import { IsInt } from 'class-validator';

export class changeOrderTodoDto {
  @IsInt({ message: '순서를 바꾸고 싶은 할일을 선택해주세요' })
  from: number;

  @IsInt({ message: '순서를 바꾸고 싶은 할일을 선택해주세요' })
  to: number;
}
