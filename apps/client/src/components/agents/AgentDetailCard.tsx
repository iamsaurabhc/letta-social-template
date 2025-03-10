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
      
      const response = await api.post<GenerationResponse>(`/social/posts/generate`, {
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
          "relative overflow-hidden transition-all duration-200",
          "hover:shadow-lg hover:border-primary/20",
          "bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-950 dark:to-gray-900/50"
        )}
        onClick={() => setIsModalOpen(true)}
      >
        {/* Status indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Active</span>
          </div>
        </div>

        <CardHeader className="pb-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-semibold">{agent.name}</CardTitle>
            <CardDescription className="line-clamp-2 text-sm">
              {agent.description || "AI-powered social media management"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleGeneratePost}
              className={cn(
                "w-full relative overflow-hidden",
                "bg-gradient-to-r from-blue-500 to-indigo-500",
                "text-white hover:opacity-90 transition-opacity"
              )}
              disabled={isGeneratingPost}
            >
              {isGeneratingPost ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                  <span>Generating...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Generate New Post</span>
                </div>
              )}
            </Button>

            <div className="space-y-4 pt-2">
              {renderTriggerCategories()}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Posting Mode</span>
              </div>
              <Badge 
                variant={postingMode === 'automatic' ? 'destructive' : 'outline'} 
                className={cn(
                  "px-2.5 py-1 text-xs font-medium",
                  postingMode === 'automatic' 
                    ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" 
                    : "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                )}
              >
                {postingMode === 'automatic' ? 'Automatic' : 'Manual Approval'}
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