import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePageDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsString()
  themeId?: string;

  @IsOptional()
  @IsArray()
  blocks?: unknown[];
}