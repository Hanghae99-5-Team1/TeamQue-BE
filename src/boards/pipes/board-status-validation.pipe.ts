// import { BadRequestException, PipeTransform } from '@nestjs/common';
// import { BoardTypes } from '../model/boardType.model';

// export class BoardStatusValidationPipe implements PipeTransform {
//   readonly StatusOptions = [BoardTypes.Notice, BoardTypes.Question];
//   transform(value: any) {
//     value = value.toUpperCase();
//     if (!this.isStatusValid(value)) {
//       throw new BadRequestException(`${value} isn't in the status options`);
//     }

//     return value;
//   }
//   private isStatusValid(status: any) {
//     const index = this.StatusOptions.indexOf(status);
//     return index !== -1;
//   }
// }
