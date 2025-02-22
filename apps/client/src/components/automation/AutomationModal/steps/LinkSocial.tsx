import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SocialConnection } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [inspirationUrls, setInspirationUrls] = useState<string[]>([]);

  const handleTwitterAuth = async () => {
    // Store current URL to return to after auth
    sessionStorage.setItem('returnTo', window.location.href);
    
    // Redirect to Twitter auth endpoint
    window.location.href = '/api/auth/twitter';
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