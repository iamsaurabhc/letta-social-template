import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import api from "@/utils/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AgentScheduledPost {
  id: string;
  content: string;
  scheduled_for: string;
  platform: string;
  status: string;
  social_connections: {
    platform: string;
    username: string;
  };
}

interface AgentScheduledPostsProps {
  agentId: string;
}

export function AgentScheduledPosts({ agentId }: AgentScheduledPostsProps) {
  const [posts, setPosts] = useState<AgentScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/social/posts/scheduled?agentId=${agentId}`);
        setPosts(response.data.posts);
      } catch (error) {
        console.error('Failed to fetch agent scheduled posts:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch scheduled posts.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [agentId]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center space-y-4 border-2 border-dashed rounded-xl">
        <Calendar className="h-12 w-12 text-muted-foreground/50" />
        <div>
          <p className="text-sm font-medium">No upcoming posts</p>
          <p className="text-sm text-muted-foreground mt-1">
            Generate new content to schedule posts
          </p>
        </div>
        <Button variant="outline" size="sm">
          Create Post
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className={cn(
            "group relative p-4 rounded-xl transition-all duration-200",
            "hover:bg-gray-50 dark:hover:bg-gray-800/50",
            "border border-gray-100 dark:border-gray-800"
          )}
        >
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{format(new Date(post.scheduled_for), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{format(new Date(post.scheduled_for), 'h:mm a')}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <p className="text-sm leading-relaxed line-clamp-2">{post.content}</p>
            
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                "border border-blue-100 dark:border-blue-800"
              )}>
                @{post.social_connections.username}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {post.social_connections.platform}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}