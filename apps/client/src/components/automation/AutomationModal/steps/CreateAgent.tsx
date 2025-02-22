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

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  websiteUrl: z.string().url().optional().or(z.literal("")),
  industry: z.array(z.string()).min(1, "Add at least one industry"),
  targetAudience: z.array(z.string()).min(1, "Add at least one target audience"),
  brandPersonality: z.array(z.string()).min(1, "Select at least one personality trait"),
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
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://your-website.com"
                    type="url"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
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
            <p className="text-sm text-muted-foreground">
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

        <div className="flex justify-end">
          <Button type="submit">Save & Continue</Button>
        </div>
      </form>
    </Form>
  );
} 