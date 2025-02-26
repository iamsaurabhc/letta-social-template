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

// In types.ts
export interface TriggerData {
  postingMode: 'automatic' | 'manual_approval';
  triggers: {
    newPosts: {
      enabled: boolean;
      format: 'normal' | 'long_form' | 'both';
      frequency: 'daily' | 'weekly' | 'custom';
      postsPerPeriod: number;
      customSchedule?: {
        days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
        time: string;
      };
      topicsOfInterest?: string[];
    };
    engagement: {
      enabled: boolean;
      replyToComments: boolean;
      replyToMentions: boolean;
      replyToDMs: boolean;
    };
    leadsGeneration: {
      enabled: boolean;
      // Future implementation
    };
    leadsNurturing: {
      enabled: boolean;
      // Future implementation
    };
  };
}

export interface AutomationStepData {
  agent: AgentData | null;
  socialConnections: SocialConnection[];
  inspirationUrls: string[];
  triggers: TriggerData | null;
} 