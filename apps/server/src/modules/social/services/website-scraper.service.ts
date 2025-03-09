import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { SupabaseService } from '../../../supabase/supabase.service';

@Injectable()
export class WebsiteScraperService {
  private readonly logger = new Logger(WebsiteScraperService.name);

  constructor(
    private readonly supabaseService: SupabaseService
  ) {}

  async scrapeWebsite(websiteUrl: string) {
    try {
      const { data } = await axios.get(websiteUrl);
      const $ = cheerio.load(data);

      return {
        title: $('title').text(),
        description: $('meta[name="description"]').attr('content'),
        keywords: $('meta[name="keywords"]').attr('content'),
        mainContent: $('main, article, #content, .content').text().trim(),
      };
    } catch (error) {
      this.logger.error(`Error scraping website: ${error.message}`);
      throw error;
    }
  }

  async getStoredWebsiteContent(agentId: string) {
    try {
      // First get the agent's website sources
      const { data: sources, error: sourcesError } = await this.supabaseService.client
        .from('agent_website_sources')
        .select('website_id')
        .eq('agent_id', agentId);

      if (sourcesError) throw sourcesError;

      if (!sources?.length) {
        return { content: [] };
      }

      // Get content for all website sources
      const websiteIds = sources.map(s => s.website_id);
      const { data: content, error: contentError } = await this.supabaseService.client
        .from('website_content')
        .select('*')
        .in('website_id', websiteIds)
        .order('created_at', { ascending: false });

      if (contentError) throw contentError;

      return {
        content: content || []
      };
    } catch (error) {
      this.logger.error('Error fetching stored website content:', error);
      throw error;
    }
  }
} 