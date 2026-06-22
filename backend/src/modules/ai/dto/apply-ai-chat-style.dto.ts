import { IsNotEmpty, IsString } from 'class-validator';

export class ApplyAiChatStyleDto {
  @IsString()
  @IsNotEmpty()
  styleOptionId!: string;
}
