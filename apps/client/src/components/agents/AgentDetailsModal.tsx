'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AgentData } from "../automation/AutomationModal/types";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { ChevronRight, Calendar, MessageCircle, Globe, Users, Zap, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface AgentDetailsModalProps {
  agent: AgentData;
  isOpen: boolean;
  onClose: () => void;
  triggerDetails?: any;
  postingMode?: 'automatic' | 'manual_approval';
}

export function AgentDetailsModal({ 
  agent, 
  isOpen, 
  onClose, 
  triggerDetails, 
  postingMode = 'manual_approval' 
}: AgentDetailsModalProps) {
  const router = useRouter();

  const parseArrayField = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(',').map(item => item.trim());
  };

  const formatTriggerDetails = () => {
    if (!triggerDetails) return null;
    
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Active</span>
          <Badge 
            variant={postingMode === 'automatic' ? 'destructive' : 'outline'} 
            className={cn(
              "ml-auto px-2.5 py-1 text-xs font-medium",
              postingMode === 'automatic' 
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
            )}
          >
            {postingMode === 'automatic' ? 'Fully Automatic' : 'Manual Approval'}
          </Badge>
        </div>
        
        {triggerDetails.newPosts?.enabled && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-medium">Content Creation Automation</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 ml-7">
              <div className="text-xs text-muted-foreground">Format:</div>
              <div className="text-xs font-medium">
                {triggerDetails.newPosts.format === 'both' 
                  ? 'Normal & long-form content' 
                  : triggerDetails.newPosts.format === 'long_form' 
                    ? 'Long-form content' 
                    : 'Normal content'}
              </div>
              
              <div className="text-xs text-muted-foreground">Frequency:</div>
              <div className="text-xs font-medium capitalize">{triggerDetails.newPosts.frequency || 'daily'}</div>
              
              <div className="text-xs text-muted-foreground">Posts per period:</div>
              <div className="text-xs font-medium">{triggerDetails.newPosts.postsPerPeriod || 5}</div>
              
              {triggerDetails.newPosts.topicsOfInterest?.length > 0 && (
                <>
                  <div className="text-xs text-muted-foreground">Topics:</div>
                  <div className="text-xs font-medium">
                    {triggerDetails.newPosts.topicsOfInterest.join(', ')}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        
        {triggerDetails.engagement?.enabled && (
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="h-5 w-5 text-purple-500" />
              <h3 className="text-sm font-medium">Engagement Automation</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 ml-7">
              <div className="text-xs text-muted-foreground">Reply to comments:</div>
              <div className="text-xs font-medium">{triggerDetails.engagement.replyToComments ? 'Yes' : 'No'}</div>
              
              <div className="text-xs text-muted-foreground">Reply to mentions:</div>
              <div className="text-xs font-medium">{triggerDetails.engagement.replyToMentions ? 'Yes' : 'No'}</div>
              
              <div className="text-xs text-muted-foreground">Reply to DMs:</div>
              <div className="text-xs font-medium">{triggerDetails.engagement.replyToDMs ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-950 dark:to-slate-900/80">
        <DialogHeader>
          <DialogTitle className="text-xl">{agent.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">Description</h3>
                <p className="text-sm text-muted-foreground">{agent.description || "No description provided"}</p>
              </div>
            </div>
            
            {agent.website_url && (
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Website</h3>
                  <a 
                    href={agent.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-primary hover:underline"
                  >
                    {agent.website_url}
                  </a>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-indigo-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Industry</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {parseArrayField(agent.industry).map((ind, i) => (
                      <Badge key={i} variant="secondary" className="bg-primary/10 text-primary">
                        {ind}
                      </Badge>
                    ))}
                    {parseArrayField(agent.industry).length === 0 && (
                      <span className="text-sm text-muted-foreground">Not specified</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium">Target Audience</h3>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {parseArrayField(agent.target_audience).map((audience, i) => (
                      <Badge key={i} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        {audience}
                      </Badge>
                    ))}
                    {parseArrayField(agent.target_audience).length === 0 && (
                      <span className="text-sm text-muted-foreground">Not specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium">Brand Personality</h3>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {parseArrayField(agent.brand_personality).map((trait, i) => (
                    <Badge key={i} variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                      {trait}
                    </Badge>
                  ))}
                  {parseArrayField(agent.brand_personality).length === 0 && (
                    <span className="text-sm text-muted-foreground">Not specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {triggerDetails && (
            <>
              <Separator className="my-4" />
              <div>
                <h2 className="text-lg font-medium mb-4">Automation Settings</h2>
                {formatTriggerDetails()}
              </div>
            </>
          )}
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-opacity-60 hover:border-opacity-100"
            >
              Close
            </Button>
            <Button
              onClick={() => router.push(`/dashboard/automation?step=social&agentId=${agent.id}`)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90 transition-opacity"
            >
              Edit Settings
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 