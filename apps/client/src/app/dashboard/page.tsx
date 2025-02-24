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

  useEffect(() => {
    const fetchAutomationStatus = async () => {
      try {
        const response = await api.get('/social/agents/status');
        const { data } = response;
        
        if (data.incompleteAgent) {
          setIncompleteAutomations({
            id: data.incompleteAgent.id,
            agentName: data.incompleteAgent.name,
            hasSocialConnections: data.incompleteAgent.hasSocialConnections,
            hasTriggers: data.incompleteAgent.hasTriggers
          });
        }
      } catch (error) {
        console.error('Failed to fetch automation status:', error);
      }
    };

    fetchAutomationStatus();
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
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Across 4 platforms
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