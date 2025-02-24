import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { SocialConnection } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/utils/api";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight } from "lucide-react";

interface Props {
  onNext: (data: { connections: SocialConnection[], inspirationUrls: string[] }) => void;
}

const PLATFORMS = [
  { id: 'twitter', name: 'Twitter/X', enabled: true },
  { id: 'linkedin', name: 'LinkedIn', enabled: true },
  { id: 'instagram', name: 'Instagram', enabled: false },
  { id: 'facebook', name: 'Facebook', enabled: false },
  { id: 'threads', name: 'Threads', enabled: false },
  { id: 'youtube', name: 'YouTube', enabled: false },
  { id: 'gbp', name: 'Google Business', enabled: false },
] as const;

export default function LinkSocial({ onNext }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [inspirationUrls, setInspirationUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    const status = searchParams.get('status');
    const step = searchParams.get('step');
    const twitterData = searchParams.get('twitterData');
    const errorMessage = searchParams.get('message');
    const agentId = searchParams.get('agentId');

    if (errorMessage) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: decodeURIComponent(errorMessage)
      });
      
      // Clean up URL params while preserving agentId
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('status');
      newUrl.searchParams.delete('message');
      router.replace(newUrl.toString());
    } else if (twitterData) {
      try {
        const parsedData = JSON.parse(decodeURIComponent(twitterData));
        // Update connections with username
        setConnections(prev => [...prev, {
          platform: 'twitter',
          username: parsedData.username,
          settings: {}
        }]);
        
        // Remove the twitterData from the URL while preserving agentId
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('twitterData');
        newUrl.searchParams.delete('status');
        if (agentId) {
          newUrl.searchParams.set('agentId', agentId);
        }
        router.replace(newUrl.toString());
      } catch (error) {
        console.error('Failed to parse Twitter data:', error);
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Failed to process Twitter connection data"
        });
      }
    } else if (step === 'social' && status === 'success') {
      fetchConnections();
    }
  }, [searchParams, router]);

  const fetchConnections = async () => {
    try {
      const response = await api.get('/social/connections');
      setConnections(response.data);
    } catch (error) {
      console.error('Failed to fetch connections:', error);
    }
  };

  const handleTwitterAuth = async () => {
    try {
      // Get the agent ID from URL params
      const agentId = searchParams.get('agentId');
      if (!agentId) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No agent selected. Please create an agent first."
        });
        return;
      }
  
      const response = await api.get(`/social/twitter/auth/url?agentId=${agentId}`);
      
      if (response.data?.url) {
        // Store current state before redirecting
        localStorage.setItem('twitter_auth_pending', 'true');
        localStorage.setItem('twitter_auth_agent_id', agentId);
        
        window.location.href = response.data.url;
      } else {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Failed to get Twitter authorization URL"
        });
      }
    } catch (error: any) {
      console.error('Failed to get auth URL:', error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.response?.data?.message || "Failed to connect to Twitter"
      });
    }
  };

  const isConnected = (platform: string) => {
    return connections.some(conn => conn.platform === platform);
  };

  const handleComplete = () => {
    onNext({
      connections: connections,
      inspirationUrls: inspirationUrls
    });
    
    const agentId = searchParams.get('agentId');
    if (agentId) {
      router.push(`/dashboard/automation?step=trigger&agentId=${agentId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Link Social Accounts</h3>
        <p className="text-sm text-muted-foreground">
          Connect your social media accounts to enable automated posting
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PLATFORMS.map((platform) => (
          <Card key={platform.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {platform.name}
                {!platform.enabled && (
                  <Badge variant="secondary">Coming Soon</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isConnected(platform.id) 
                ? `Connected as @${connections.find(c => c.platform === platform.id)?.username || ''}` 
                : "Not connected"}
            </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={platform.id === 'twitter' ? handleTwitterAuth : undefined}
                disabled={!platform.enabled || isConnected(platform.id)}
                variant={isConnected(platform.id) ? "secondary" : "default"}
              >
                {isConnected(platform.id) ? "Connected" : "Connect"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => {
            const agentId = searchParams.get('agentId');
            router.push(`/dashboard/automation?step=agent&agentId=${agentId}`);
          }}
        >
          Back
        </Button>
        <Button 
          onClick={handleComplete}
          disabled={connections.length === 0}
        >
          Save & Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 