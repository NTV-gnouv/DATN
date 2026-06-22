import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class StartAiChatDto {
  @ApiProperty({ example: 'p-demo' })
  @IsString()
  @IsNotEmpty()
  pageId!: string;
}

export class SendAiChatMessageDto {
  @ApiProperty({ example: 'ai-chat-abc123' })
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @ApiProperty({ example: 'Tôi là Thanh Vương' })
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class ApplyAiChatDto {
  @ApiProperty({ example: 'ai-chat-abc123' })
  @IsString()
  @IsNotEmpty()
  sessionId!: string;
}
