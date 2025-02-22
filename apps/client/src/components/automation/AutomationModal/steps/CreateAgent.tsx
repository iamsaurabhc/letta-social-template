'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AgentData } from '../types';
import { TagInput } from "@/components/ui/tag-input";
import api from '@/utils/api';
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional(),
  industry: z.array(z.string()).min(1, "Add at least one industry"),
  targetAudience: z.array(z.string()).min(1, "Add at least one target audience"),
  brandPersonality: z.array(z.string()).min(1, "Select at least one personality trait"),
  contentPreferences: z.object({
    includeNewsUpdates: z.boolean().default(false),
    includeIndustryTrends: z.boolean().default(false),
    repurposeWebContent: z.boolean().default(false),
    engagementMonitoring: z.boolean().default(false),
  })
});

interface Props {
  onNext: (data: AgentData) => void;
}

export default function CreateAgent({ onNext }: Props) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            description: "",
            websiteUrl: "",
            industry: [],
            targetAudience: [],
            brandPersonality: [],
            contentPreferences: {
            includeNewsUpdates: false,
            includeIndustryTrends: false,
            repurposeWebContent: false,
            engagementMonitoring: false
            }
    },
    });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await api.post('/social/agents', {
        ...values,
        contentPreferences: {}
      });
      
      onNext({
        id: response.data.id,
        name: values.name,
        description: values.description,
        websiteUrl: values.websiteUrl,
        industry: values.industry,
        targetAudience: values.targetAudience,
        brandPersonality: values.brandPersonality,
        contentPreferences: {}
      });
    } catch (error) {
      console.error('Error creating agent:', error);
      // Add error handling here - you might want to show a toast notification
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Agent Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter agent name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="websiteUrl"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Website URL (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://your-website.com (optional)"
                    type="url"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground">
                  If provided, we'll analyze your website to better understand your brand voice
                </p>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your agent's purpose"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="font-medium">Agent Preferences</h3>
            <p className="text-xs text-muted-foreground">
              For the following fields, type your input and press Enter or comma (,) to add tags
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industries</FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Tech, Finance, Healthcare..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetAudience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Audience</FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Millennials, Business owners..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brandPersonality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Personality</FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Professional, Friendly, Bold..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div className="border-b pb-2">
            <h3 className="font-medium">Content Strategy</h3>
            <p className="text-xs text-muted-foreground">
              Select additional content sources and strategies for your agent
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contentPreferences.includeNewsUpdates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Link latest keyword related news</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Include relevant industry news before creating new posts
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contentPreferences.includeIndustryTrends"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Monitor industry trends</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Analyze trending topics in your industry for content ideas
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contentPreferences.repurposeWebContent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Repurpose website content</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Transform your website content into social media posts
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contentPreferences.engagementMonitoring"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Monitor engagement patterns</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Analyze post performance to optimize content strategy
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save & Continue</Button>
        </div>
      </form>
    </Form>
  );
} 