export const QUEUE_NAMES = {
  WEBSITE_SCRAPING: 'website-scraping',
  CONTENT_GENERATION: 'content-generation',
  ENGAGEMENT_MONITORING: 'engagement-monitoring',
  POST_PUBLISHER: 'post-publisher',
  TWITTER_TIMELINE: 'twitter-timeline'
} as const;

export const queueConfig = [
  {
    name: QUEUE_NAMES.WEBSITE_SCRAPING,
    options: {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    }
  },
  {
    name: QUEUE_NAMES.CONTENT_GENERATION,
    options: {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    }
  },
  {
    name: QUEUE_NAMES.ENGAGEMENT_MONITORING,
    options: {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3
      }
    }
  },
  {
    name: QUEUE_NAMES.POST_PUBLISHER,
    options: {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3
      }
    }
  },
  {
    name: QUEUE_NAMES.TWITTER_TIMELINE,
    options: {
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 3
      }
    }
  }
]; 