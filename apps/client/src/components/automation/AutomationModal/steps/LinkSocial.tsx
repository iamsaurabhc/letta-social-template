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
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [inspirationUrls, setInspirationUrls] = useState<string[]>([]);

  useEffect(() => {
    // Check for auth callback status and twitterData
    const status = searchParams.get('status');
    const step = searchParams.get('step');
    const twitterData = searchParams.get('twitterData');

    if (twitterData) {
      try {
        const parsedData = JSON.parse(twitterData);
        // Remove the twitterData from the URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('twitterData');
        router.replace(newUrl.toString());
        
        // Fetch updated connections after successful auth
        fetchConnections();
      } catch (error) {
        console.error('Failed to parse Twitter data:', error);
      }
    } else if (step === 'social' && status === 'success') {
      fetchConnections();
    }
  }, [searchParams]);

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
      const response = await api.get('/social/twitter/auth/url');
      if (response.data?.url) {
        // Store current state before redirecting
        localStorage.setItem('twitter_auth_pending', 'true');
        
        // Redirect to Twitter auth page
        window.location.href = response.data.url;
      } else {
        console.error('No URL returned from auth endpoint');
      }
    } catch (error) {
      console.error('Failed to get auth URL:', error);
    }
  };

  const isConnected = (platform: string) => {
    return connections.some(conn => conn.platform === platform);
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
                  ? "Connected" 
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

      <div className="flex justify-end">
        <Button 
          onClick={() => onNext({ connections, inspirationUrls })}
          disabled={connections.length === 0}
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
} 