import { PostService } from '../../social/posts/services/post.service';
import { WebsiteScraperService } from '../../social/services/website-scraper.service';

export interface ToolDefinition {
  name: string;
  description: string;
  handler: Function;
  parameters: {
    name: string;
    type: string;
    description: string;
  }[];
}

export class ToolRegistry {
  private static tools: Map<string, ToolDefinition> = new Map();

  static registerTool(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  static getTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  static getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  static initializeTools(services: {
    postService: PostService;
    scraperService: WebsiteScraperService;
  }) {
    // Post Analysis Tools
    this.registerTool({
      name: 'getPastPosts',
      description: 'Retrieves past posts for analysis',
      handler: services.postService.getPastPosts.bind(services.postService),
      parameters: [
        {
          name: 'agentId',
          type: 'string',
          description: 'ID of the agent'
        },
        {
          name: 'platform',
          type: 'string',
          description: 'Social platform to analyze'
        },
        {
          name: 'limit',
          type: 'number',
          description: 'Number of posts to retrieve'
        }
      ]
    });

    this.registerTool({
      name: 'getPostEngagement',
      description: 'Gets engagement metrics for posts',
      handler: services.postService.getPostEngagement.bind(services.postService),
      parameters: [
        {
          name: 'postIds',
          type: 'array',
          description: 'Array of post IDs to analyze'
        }
      ]
    });

    this.registerTool({
      name: 'getWebsiteContent',
      description: 'Retrieves scraped website content for reference',
      handler: services.scraperService.getStoredWebsiteContent.bind(services.scraperService),
      parameters: [
        {
          name: 'agentId',
          type: 'string',
          description: 'ID of the agent'
        }
      ]
    });

    this.registerTool({
      name: 'schedulePost',
      description: 'Schedules a post for publishing',
      handler: services.postService.schedulePost.bind(services.postService),
      parameters: [
        {
          name: 'agentId',
          type: 'string',
          description: 'ID of the agent'
        },
        {
          name: 'content',
          type: 'string',
          description: 'Content of the post'
        },
        {
          name: 'scheduledFor',
          type: 'string',
          description: 'ISO timestamp for scheduling'
        },
        {
          name: 'platform',
          type: 'string',
          description: 'Target social platform'
        }
      ]
    });
  }
} 