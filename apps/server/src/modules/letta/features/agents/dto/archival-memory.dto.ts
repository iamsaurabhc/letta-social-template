import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateArchivalMemoryDto {
  @IsString()
  text: string;

  @IsArray()
  @IsOptional()
  collections?: string[];
} 