import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import api from "@/utils/api";
import { toast } from "@/hooks/use-toast";

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
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Upcoming Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Upcoming Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming posts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Upcoming Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {posts.map((post, index) => (
            <div key={post.id}>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {format(new Date(post.scheduled_for), 'MMM d, yyyy')}
                  </span>
                  <Clock className="h-3 w-3 text-muted-foreground ml-1" />
                  <span className="text-muted-foreground">
                    {format(new Date(post.scheduled_for), 'h:mm a')}
                  </span>
                </div>
                <p className="text-sm line-clamp-2">{post.content}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    @{post.social_connections.username}
                  </span>
                </div>
              </div>
              {index < posts.length - 1 && (
                <Separator className="my-3" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}