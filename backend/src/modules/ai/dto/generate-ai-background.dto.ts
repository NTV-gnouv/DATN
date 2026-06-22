import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GenerateAiBackgroundDto {
  @ApiProperty({
    example: 'hãy tạo cho tôi backgroud là một hình ảnh thiên nhiên núi tuyết',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  prompt!: string;

  @ApiProperty({ example: 'user-123' })
  @IsString()
  @IsNotEmpty()
  ownerId!: string;
}
