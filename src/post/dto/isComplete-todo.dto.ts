import { IsInt } from 'class-validator';

export class isCompleteTodoDto {
  @IsInt({ message: '끝낸 할일을 선택해주세요' })
  id: number;
}
