import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class ModifyBlockDto {
  @IsString()
  @IsOptional()
  value?: string;

  @IsNumber()
  @IsOptional()
  limit?: number;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
} 