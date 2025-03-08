export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TwitterAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
}

export interface TweetResponse {
  id: string;
  text: string;
  url?: string;
}

export interface TwitterResponse<T> {
  data: T;
  meta?: {
    result_count: number;
    next_token?: string;
  };
  errors?: Array<{
    code: string;
    message: string;
  }>;
}

export interface Tweet extends BaseEntity {
  id: string;
  text: string;
  imagePrompt?: string;
  imageUrl?: string;
  state?: 'posted' | 'failed';
  error?: string;
}

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
  created_at: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  description?: string;
  location?: string;
  profile_image_url?: string;
  verified?: boolean;
}

export interface TwitterMediaUploadResponse {
  media_id: number;
  media_id_string: string;
  media_key?: string;
  size: number;
  expires_after_secs: number;
  image?: {
    image_type: string;
    w: number;
    h: number;
  };
}

export interface TwitterTimelineTweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics: Record<string, number>;
  entities?: Record<string, any>;
  context_annotations?: Array<Record<string, any>>;
} 