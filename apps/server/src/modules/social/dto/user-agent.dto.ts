import { IsString, IsArray, IsObject, IsOptional, IsUrl, IsBoolean } from 'class-validator';

export interface ContentPreferences {
  includeNewsUpdates: boolean;
  includeIndustryTrends: boolean;
  repurposeWebContent: boolean;
  engagementMonitoring: boolean;
  websiteData?: any;
}

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
  contentPreferences: ContentPreferences;
} 