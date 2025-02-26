import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import { useState, useEffect } from "react";
import api from "@/utils/api";

interface ScheduledPost {
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

export function ScheduledPosts() {
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await api.get('/social/posts/scheduled');
        setPosts(response.data.posts);
      } catch (error) {
        console.error('Failed to fetch scheduled posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Scheduled Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Scheduled Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No scheduled posts yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Scheduled Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(post.scheduled_for), 'MMM d, yyyy')}
                  </span>
                  <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(post.scheduled_for), 'h:mm a')}
                  </span>
                </div>
                <p className="text-sm line-clamp-2">{post.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    @{post.social_connections.username}
                  </span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {post.social_connections.platform}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 