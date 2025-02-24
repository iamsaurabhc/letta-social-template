export interface AgentData {
    id?: string;
    name: string;
    description?: string;
    systemPrompt?: string;
    website_url?: string;
    industry?: string[] | string;
    target_audience?: string[];
    brand_personality?: string[];
    content_preferences?: Record<string, any>;
    created_at?: string;
    lettaAgentId?: string;
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