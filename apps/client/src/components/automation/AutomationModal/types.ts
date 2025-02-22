export interface AgentData {
  name: string;
  description?: string;
  systemPrompt?: string;
  websiteUrl?: string;
  industry?: string;
  targetAudience?: string;
  brandPersonality: string[];
  contentPreferences: Record<string, any>;
}

export interface SocialConnection {
  platform: 'twitter' | 'linkedin' | 'instagram' | 'facebook' | 'threads' | 'youtube' | 'gbp';
  username?: string;
  settings: Record<string, any>;
}

export interface TriggerData {
  postingMode: 'automatic' | 'manual_approval';
  schedules: {
    platform: string;
    interval: string;
    preferredTimes?: string[];
  }[];
}

export interface AutomationStepData {
  agent: AgentData | null;
  socialConnections: SocialConnection[];
  inspirationUrls: string[];
  triggers: TriggerData | null;
} 