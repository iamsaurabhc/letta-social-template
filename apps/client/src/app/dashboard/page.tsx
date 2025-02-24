'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Share2, Zap } from "lucide-react";
import { useState, useEffect } from 'react';
import { AutomationStatus } from "@/components/automation/AutomationStatus";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import api from '@/utils/api';

export default function DashboardPage() {
  const [incompleteAutomations, setIncompleteAutomations] = useState<{
    id: string;
    agentName: string;
    hasSocialConnections: boolean;
    hasTriggers: boolean;
  } | null>(null);

  const [agentStats, setAgentStats] = useState<{
    total: number;
    newThisMonth: number;
  }>({
    total: 0,
    newThisMonth: 0
  });

  const [connectionStats, setConnectionStats] = useState<{
    total: number;
    platformCount: number;
  }>({
    total: 0,
    platformCount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [automationResponse, statsResponse, connectionsResponse] = await Promise.all([
          api.get('/social/agents/status'),
          api.get('/social/agents/stats'),
          api.get('/social/agents/connections/stats')
        ]);
        
        if (automationResponse.data?.incompleteAgent) {
          setIncompleteAutomations({
            id: automationResponse.data.incompleteAgent.id,
            agentName: automationResponse.data.incompleteAgent.name,
            hasSocialConnections: automationResponse.data.incompleteAgent.hasSocialConnections,
            hasTriggers: automationResponse.data.incompleteAgent.hasTriggers
          });
        } else {
          setIncompleteAutomations(null);
        }

        setAgentStats(statsResponse.data || { total: 0, newThisMonth: 0 });
        setConnectionStats(connectionsResponse.data || { total: 0, platformCount: 0 });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Set default values on error
        setIncompleteAutomations(null);
        setAgentStats({ total: 0, newThisMonth: 0 });
        setConnectionStats({ total: 0, platformCount: 0 });
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader />
      
      {incompleteAutomations && (
        <div className="my-6">
          <AutomationStatus
            agentId={incompleteAutomations.id}
            agentName={incompleteAutomations.agentName}
            hasSocialConnections={incompleteAutomations.hasSocialConnections}
            hasTriggers={incompleteAutomations.hasTriggers}
          />
        </div>
      )}
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              +{agentStats.newThisMonth} from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectionStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across {connectionStats.platformCount} platform{connectionStats.platformCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8k</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automated Posts</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add more dashboard sections here */}
    </div>
  );
} 