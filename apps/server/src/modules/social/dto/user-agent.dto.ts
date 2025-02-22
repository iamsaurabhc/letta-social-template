import { IsString, IsArray, IsObject, IsOptional, IsUrl } from 'class-validator';

export class CreateUserAgentDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl()
  @IsOptional()
  websiteUrl?: string;

  @IsArray()
  industry: string[];

  @IsArray()
  targetAudience: string[];

  @IsArray()
  brandPersonality: string[];

  @IsObject()
  contentPreferences: Record<string, any>;
} 