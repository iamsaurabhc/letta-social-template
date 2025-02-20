import { IsString, IsOptional, IsObject, IsArray } from 'class-validator';

export class CreateToolDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  type: string;

  @IsString()
  sourceCode: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @IsArray()
  @IsOptional()
  parameters?: Array<{
    name: string;
    type: string;
    description?: string;
    required?: boolean;
  }>;
}

export class UpdateToolDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  sourceCode?: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @IsArray()
  @IsOptional()
  parameters?: Array<{
    name: string;
    type: string;
    description?: string;
    required?: boolean;
  }>;
}

export class RunToolDto {
  @IsString()
  sourceCode: string;

  @IsObject()
  args: Record<string, any>;
} 