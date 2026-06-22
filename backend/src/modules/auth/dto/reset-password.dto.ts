import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @MinLength(12)
  token!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}