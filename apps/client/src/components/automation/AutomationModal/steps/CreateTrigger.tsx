'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TagInput } from "@/components/ui/tag-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import api from "@/utils/api";
import { ChevronRight, AlertCircle } from "lucide-react";
import { useAgentStore } from "@/stores/agentStore";

const triggerFormSchema = z.object({
  postingMode: z.enum(['automatic', 'manual_approval']),
  triggers: z.object({
    newPosts: z.object({
      enabled: z.boolean(),
      format: z.enum(['normal', 'long_form', 'both']).optional(),
      frequency: z.enum(['daily', 'weekly', 'custom']).optional(),
      postsPerPeriod: z.number().min(1).max(20).default(5),
      customSchedule: z.object({
        days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
        time: z.string().optional(),
      }).optional(),
      topicsOfInterest: z.array(z.string()).optional(),
    }),
    engagement: z.object({
      enabled: z.boolean(),
      replyToComments: z.boolean().optional(),
      replyToMentions: z.boolean().optional(),
      replyToDMs: z.boolean().optional(),
    }),
    leadsGeneration: z.object({
      enabled: z.boolean(),
    }),
    leadsNurturing: z.object({
      enabled: z.boolean(),
    }),
  }),
});

type TriggerFormValues = z.infer<typeof triggerFormSchema>;

interface Props {
  onFinish: (data: any) => void;
}

export default function CreateTrigger({ onFinish }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TriggerFormValues>({
    resolver: zodResolver(triggerFormSchema),
    defaultValues: {
      postingMode: 'manual_approval',
      triggers: {
        newPosts: {
          enabled: false,
          format: 'normal',
          frequency: 'daily',
          postsPerPeriod: 5,
          customSchedule: {
            days: ['monday', 'wednesday', 'friday'],
            time: '09:00',
          },
          topicsOfInterest: [],
        },
        engagement: {
          enabled: false,
          replyToComments: false,
          replyToMentions: false,
          replyToDMs: false,
        },
        leadsGeneration: {
          enabled: false,
        },
        leadsNurturing: {
          enabled: false,
        },
      },
    },
  });

  const watchNewPostsEnabled = form.watch("triggers.newPosts.enabled");
  const watchEngagementEnabled = form.watch("triggers.engagement.enabled");
  const watchFrequency = form.watch("triggers.newPosts.frequency");

  const handleSubmit = async (values: TriggerFormValues) => {
    try {
      setIsSubmitting(true);
      const agentId = searchParams.get('agentId');
      
      if (!agentId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No agent selected. Please create an agent first.",
        });
        return;
      }

      await api.post(`/social/agents/${agentId}/triggers`, values);
      
      // Update store with completion status
      useAgentStore.getState().updateStepCompletion('trigger', true);
      
      toast({
        title: "Automation Setup Complete",
        description: "Your agent is now ready to automate your social media presence.",
      });
      
      // Call the onFinish callback with the form values
      onFinish(values);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving triggers:', error);
      toast({
        variant: "destructive",
        title: "Failed to Save Triggers",
        description: "Please try again. If the problem persists, contact support.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Setup Automation Triggers</h3>
        <p className="text-sm text-muted-foreground">
          Configure how your agent will automate your social media presence
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Content Approval</CardTitle>
              <CardDescription>
                Choose how you want to handle content before it's posted
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="postingMode"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="manual_approval" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Manual Approval (Recommended)
                          </FormLabel>
                        </FormItem>
                        <FormDescription className="pl-7">
                          Review and approve all content before it's posted
                        </FormDescription>
                        
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="automatic" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Fully Automatic
                          </FormLabel>
                        </FormItem>
                        <FormDescription className="pl-7">
                          Content is posted automatically without review
                        </FormDescription>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New Posts Automation</CardTitle>
              <CardDescription>
                Automatically generate new content for your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="triggers.newPosts.enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable New Posts Automation
                      </FormLabel>
                      <FormDescription>
                        Automatically generate and schedule new posts
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {watchNewPostsEnabled && (
                <div className="space-y-6 pt-2">
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="triggers.newPosts.format"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Post Format</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select post format" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="normal">Normal Posts</SelectItem>
                            <SelectItem value="long_form">Long-form Content</SelectItem>
                            <SelectItem value="both">Both Formats</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Normal posts are shorter, while long-form content is adapted for threads on Twitter and longer posts on LinkedIn
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="triggers.newPosts.frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posting Frequency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="custom">Custom Schedule</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="triggers.newPosts.postsPerPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Posts Per {watchFrequency === 'daily' ? 'Day' : watchFrequency === 'weekly' ? 'Week' : 'Period'}</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                if (field.value > 1) {
                                  field.onChange(field.value - 1);
                                }
                              }}
                            >
                              -
                            </Button>
                            <input
                              type="number"
                              className="flex h-10 w-16 rounded-md border border-input bg-background px-3 py-2 text-sm text-center ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              min={1}
                              max={20}
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (value >= 1 && value <= 20) {
                                  field.onChange(value);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                if (field.value < 20) {
                                  field.onChange(field.value + 1);
                                }
                              }}
                            >
                              +
                            </Button>
                          </div>
                        </FormControl>
                        <FormDescription>
                          Number of posts to generate per {watchFrequency === 'daily' ? 'day' : watchFrequency === 'weekly' ? 'week' : 'period'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchFrequency === 'custom' && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="triggers.newPosts.customSchedule.days"
                        render={({ field }) => (
                          <FormItem>
                            <div className="mb-4">
                              <FormLabel>Days of the Week</FormLabel>
                              <FormDescription>
                                Select days when posts should be created
                              </FormDescription>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                <FormItem
                                  key={day}
                                  className="flex flex-row items-start space-x-2 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(day as any)}
                                      onCheckedChange={(checked) => {
                                        const currentValue = field.value || [];
                                        if (checked) {
                                          field.onChange([...currentValue, day]);
                                        } else {
                                          field.onChange(
                                            currentValue.filter((value) => value !== day)
                                          );
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="capitalize">
                                    {day}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="triggers.newPosts.customSchedule.time"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Preferred Time</FormLabel>
                            <FormControl>
                              <input
                                type="time"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Posts will be scheduled for this time on selected days
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="triggers.newPosts.topicsOfInterest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Topics of Interest (Optional)</FormLabel>
                        <FormControl>
                          <TagInput
                            placeholder="Add topics and press Enter"
                            value={field.value || []}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Add specific topics you want your content to focus on
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Engagement Automation</CardTitle>
              <CardDescription>
                Automatically respond to interactions on your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="triggers.engagement.enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Enable Engagement Automation
                      </FormLabel>
                      <FormDescription>
                        Automatically respond to comments, mentions, and messages
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {watchEngagementEnabled && (
                <div className="space-y-4 pt-2">
                  <Separator />
                  
                  <FormField
                    control={form.control}
                    name="triggers.engagement.replyToComments"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Reply to Comments</FormLabel>
                          <FormDescription>
                            Automatically respond to comments on your posts
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="triggers.engagement.replyToMentions"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Reply to Mentions</FormLabel>
                          <FormDescription>
                            Automatically respond when someone mentions you
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="triggers.engagement.replyToDMs"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Reply to Direct Messages</FormLabel>
                          <FormDescription>
                            Automatically respond to private messages
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Leads Generation</CardTitle>
                <CardDescription>
                  Automatically find potential clients based on your criteria
                </CardDescription>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">This feature will be available in a future update</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Leads Nurturing & Warming</CardTitle>
                <CardDescription>
                  Automatically engage with potential leads and schedule meetings
                </CardDescription>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">This feature will be available in a future update</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => {
                const agentId = searchParams.get('agentId');
                router.push(`/dashboard/automation?step=social&agentId=${agentId}`);
              }}
              type="button"
            >
              Back
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>Save & Deploy</span>
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 