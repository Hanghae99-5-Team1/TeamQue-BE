import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class authSignInDto {
  @IsEmail({ message: '이메일형식을 지켜주세요' })
  @IsNotEmpty({ message: '이메일을 입력해주세요' })
  email: string;

  @MinLength(4, { message: '비밀번호를 4자이상을 입력해주세요' })
  @MaxLength(20, { message: '비밀번호를 20자 이하를 입력해주세요' })
  @Matches(/^[a-zA-Z0-9]*$/, {
    message: '비밀번호를 영어와 숫자로만 만들어주세요 ',
  })
  @IsString({ message: '비밀번호를 입력해주세요' })
  password;
}
