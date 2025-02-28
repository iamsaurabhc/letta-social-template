'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, MessageCircle, Calendar, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { AgentDetailsModal } from "./AgentDetailsModal";
import { AgentData } from "@/types/agent";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import api from "@/utils/api";
import { GeneratedContentModal } from "./GeneratedContentModal";
import { GenerationResponse } from "@/types/api";

interface AgentDetailCardProps {
  agent: AgentData;
  triggerDetails?: any;
  postingMode?: 'automatic' | 'manual_approval';
}

export function AgentDetailCard({ agent, triggerDetails, postingMode }: AgentDetailCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<{
    normal: string;
    longForm: string;
  } | null>(null);
  const [showGeneratedContent, setShowGeneratedContent] = useState(false);

  // Fetch connection ID when component mounts
  useEffect(() => {
    const fetchConnectionId = async () => {
      try {
        const response = await api.get(`/social/agents/${agent.id}/connections`);
        if (response.data?.[0]?.id) {
          setConnectionId(response.data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch connection ID:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch social connection. Some features may be limited.",
        });
      }
    };

    fetchConnectionId();
  }, [agent.id]);

  const formatTriggerSummary = () => {
    if (!triggerDetails) return "No automation configured";
    
    const parts = [];
    
    if (triggerDetails.newPosts?.enabled) {
      const frequency = triggerDetails.newPosts.frequency || 'daily';
      const format = triggerDetails.newPosts.format || 'normal';
      const postsCount = triggerDetails.newPosts.postsPerPeriod || 5;
      parts.push(`${frequency} posts (${postsCount} ${format} format posts)`);
    }
    
    if (triggerDetails.engagement?.enabled) {
      const engagementTypes = [];
      if (triggerDetails.engagement.replyToComments) engagementTypes.push('comments');
      if (triggerDetails.engagement.replyToMentions) engagementTypes.push('mentions');
      if (triggerDetails.engagement.replyToDMs) engagementTypes.push('DMs');
      
      if (engagementTypes.length > 0) {
        parts.push(`replies to ${engagementTypes.join(', ')}`);
      } else {
        parts.push('engagement monitoring');
      }
    }
    
    return parts.length > 0 ? parts.join(', ') : "Basic automation";
  };

  const renderTriggerCategories = () => {
    if (!triggerDetails) return null;
    
    return (
      <div className="grid grid-cols-1 gap-3 mt-4">
        {triggerDetails.newPosts?.enabled && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Content Creation</h4>
              <p className="text-xs text-muted-foreground">
                {triggerDetails.newPosts.frequency || 'Daily'} • 
                 {triggerDetails.newPosts.postsPerPeriod || 5} posts per period • 
                {triggerDetails.newPosts.format === 'both' 
                  ? 'Normal & long-form content' 
                  : triggerDetails.newPosts.format === 'long_form' 
                    ? 'Long-form content' 
                    : 'Normal content'}
              </p>
            </div>
          </div>
        )}
        
        {triggerDetails.engagement?.enabled && (
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
            <MessageCircle className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Engagement</h4>
              <p className="text-xs text-muted-foreground">
                Replies to: {[
                  triggerDetails.engagement.replyToComments && 'comments',
                  triggerDetails.engagement.replyToMentions && 'mentions',
                  triggerDetails.engagement.replyToDMs && 'DMs'
                ].filter(Boolean).join(', ') || 'None'}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleGeneratePost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsGeneratingPost(true);
      
      // Determine format based on trigger details or default to 'both'
      const format = triggerDetails?.newPosts?.format || 'both';
      
      const response = await api.post<GenerationResponse>(`/workflow/agents/generate-content`, {
        agentId: agent.id,
        settings: {
          format
        },
        scheduledFor: new Date().toISOString()
      });

      if (!response.data?.success) {
        throw new Error(response.data?.error?.message || 'Failed to generate content');
      }

      // Update state with both normal and long-form content
      if (typeof response.data.content === 'object' && 
          response.data.content.normal && 
          response.data.content.longForm) {
        setGeneratedContent(response.data.content);
      } else if (typeof response.data.content === 'string') {
        // Handle single format response
        setGeneratedContent({
          normal: response.data.content,
          longForm: response.data.content
        });
      } else {
        throw new Error('Invalid content format received from server');
      }
      
      setShowGeneratedContent(true);
    } catch (error) {
      console.error('Failed to generate post:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message.includes('timeout')
          ? "Generation is taking longer than expected. Please try again."
          : error.message
        : "Failed to generate post. Please try again.";

      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsGeneratingPost(false);
    }
  };

  const handleCloseGeneratedContent = () => {
    setShowGeneratedContent(false);
    setGeneratedContent(null);
  };

  return (
    <>
      <Card 
        className={cn(
          "hover:shadow-md transition-all cursor-pointer relative overflow-hidden",
          "border-opacity-60 hover:border-opacity-100",
          "bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-950 dark:to-slate-900/80"
        )}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Status indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
        </div>

        <CardHeader>
          <div className="flex justify-between items-start pr-20">
            <div>
              <CardTitle>{agent.name}</CardTitle>
              {/* <CardDescription className="line-clamp-2">{agent.description || "No description"}</CardDescription> */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="mb-4">
              <Button 
                onClick={handleGeneratePost}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                disabled={isGeneratingPost}
              >
                {isGeneratingPost ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {isGeneratingPost ? "Generating..." : "Generate New Post"}
              </Button>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-amber-500" />
                <h4 className="text-sm font-medium">Automation Summary</h4>
              </div>
              <p className="text-sm text-muted-foreground">{formatTriggerSummary()}</p>
              
              {renderTriggerCategories()}
            </div>
            
            <div className="flex justify-between items-center">
              <Badge 
                variant={postingMode === 'automatic' ? 'destructive' : 'outline'} 
                className={cn(
                  "px-2.5 py-1 text-xs font-medium",
                  postingMode === 'automatic' 
                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" 
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                )}
              >
                {postingMode === 'automatic' ? 'Fully Automatic' : 'Manual Approval'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AgentDetailsModal 
        agent={agent} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        triggerDetails={triggerDetails}
        postingMode={postingMode}
      />
      
      {showGeneratedContent && generatedContent && connectionId && (
        <GeneratedContentModal
          isOpen={showGeneratedContent}
          onClose={handleCloseGeneratedContent}
          content={generatedContent}
          agentId={agent.id}
          connectionId={connectionId}
        />
      )}
    </>
  );
} 