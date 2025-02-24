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
import { useRouter } from "next/navigation";

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
  readOnly?: boolean;
  initialData?: AgentData;
}

const parseArrayField = (value: string | string[] | undefined): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(',').map(item => item.trim());
};

export default function CreateAgent({ onNext, readOnly = false, initialData }: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description || "",
      websiteUrl: initialData.websiteUrl || "",
      industry: parseArrayField(initialData.industry),
      targetAudience: parseArrayField(initialData.targetAudience),
      brandPersonality: parseArrayField(initialData.brandPersonality),
      contentPreferences: {
        includeNewsUpdates: initialData.contentPreferences?.includeNewsUpdates || false,
        includeIndustryTrends: initialData.contentPreferences?.includeIndustryTrends || false,
        repurposeWebContent: initialData.contentPreferences?.repurposeWebContent || false,
        engagementMonitoring: initialData.contentPreferences?.engagementMonitoring || false
      }
    } : {
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
    }
  });

  const router = useRouter();

  if (readOnly && initialData) {
    console.log('Initial Data from API:', initialData);
    
    // Parse industry string or array
    const industries = Array.isArray(initialData.industry) 
      ? initialData.industry 
      : typeof initialData.industry === 'string'
        ? initialData.industry.split(',').map((i: string) => i.trim())
        : [];
    console.log('Parsed Industries:', industries);
    
    // Parse target audience string or array
    const targetAudiences = Array.isArray(initialData.targetAudience) 
      ? initialData.targetAudience 
      : initialData.targetAudience 
        ? initialData.targetAudience.split(',').map((i: string) => i.trim())
        : typeof initialData.targetAudience === 'string'
          ? initialData.targetAudience.split(',').map((i: string) => i.trim())
          : [];
    console.log('Parsed Target Audiences:', targetAudiences);
    
    // Parse brand personality string or array
    const brandPersonalities = Array.isArray(initialData.brandPersonality)
      ? initialData.brandPersonality
      : initialData.brandPersonality
        ? Array.isArray(initialData.brandPersonality)
          ? initialData.brandPersonality
          : initialData.brandPersonality.split(',').map((i: string) => i.trim())
        : [];
    console.log('Parsed Brand Personalities:', brandPersonalities);

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="border-b pb-2 pt-2">
            <h3 className="font-medium">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Agent Name</Label>
              <p className="text-sm mt-1">{initialData.name}</p>
            </div>
            
            <div>
              <Label>Created</Label>
              <p className="text-sm mt-1">
                {initialData.createdAt ? new Date(initialData.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>

            {initialData.description && (
              <div className="col-span-2">
                <Label>Description</Label>
                <p className="text-sm mt-1">{initialData.description}</p>
              </div>
            )}

            {initialData.websiteUrl && (
              <div className="col-span-2">
                <Label>Website URL</Label>
                <a 
                  href={initialData.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm mt-1 text-primary hover:underline block"
                >
                  {initialData.websiteUrl}
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="font-medium">Agent Preferences</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label>Industry</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {industries.map((tag: string) => (
                  <div 
                    key={tag} 
                    className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Target Audience</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {targetAudiences.map((audience: string) => (
                  <div 
                    key={audience} 
                    className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {audience}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Brand Personality</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {brandPersonalities.map((trait: string) => (
                  <div 
                    key={trait} 
                    className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {trait}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content Strategy Section */}
        <div className="space-y-4">
          <div className="border-b pb-2">
            <h3 className="font-medium">Content Strategy</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className={`h-4 w-4 mt-1 rounded border ${initialData.contentPreferences?.includeNewsUpdates ? 'bg-primary border-primary' : 'bg-muted'}`} />
              <div>
                <Label>Link latest keyword related news</Label>
                <p className="text-sm text-muted-foreground">
                  Include relevant industry news before creating new posts
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className={`h-4 w-4 mt-1 rounded border ${initialData.contentPreferences?.includeIndustryTrends ? 'bg-primary border-primary' : 'bg-muted'}`} />
              <div>
                <Label>Monitor industry trends</Label>
                <p className="text-sm text-muted-foreground">
                  Analyze trending topics in your industry for content ideas
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className={`h-4 w-4 mt-1 rounded border ${initialData.contentPreferences?.repurposeWebContent ? 'bg-primary border-primary' : 'bg-muted'}`} />
              <div>
                <Label>Repurpose website content</Label>
                <p className="text-sm text-muted-foreground">
                  Transform your website content into social media posts
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className={`h-4 w-4 mt-1 rounded border ${initialData.contentPreferences?.engagementMonitoring ? 'bg-primary border-primary' : 'bg-muted'}`} />
              <div>
                <Label>Monitor engagement</Label>
                <p className="text-sm text-muted-foreground">
                  Track and analyze post performance
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Back to Dashboard
          </Button>
          <Button 
            onClick={() => {
              router.push(`/dashboard/automation?step=social&agentId=${initialData.id}`);
            }}
          >
            Continue Setup
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log('Form Values being submitted:', values);
      
      const response = await api.post('/social/agents', {
        ...values,
        contentPreferences: values.contentPreferences
      });
      
      console.log('API Response:', response.data);
      
      onNext({
        id: response.data.id,
        name: values.name,
        description: values.description,
        websiteUrl: values.websiteUrl,
        industry: values.industry,
        targetAudience: values.targetAudience,
        brandPersonality: values.brandPersonality,
        contentPreferences: values.contentPreferences
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