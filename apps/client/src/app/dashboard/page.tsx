'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Share2, Zap } from "lucide-react";
import { useState, useEffect } from 'react';
import { AutomationStatus } from "@/components/automation/AutomationStatus";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { AgentDetailCard } from "@/components/agents/AgentDetailCard";
import api from '@/utils/api';
import { useAgentStore } from '@/stores/agentStore';
import { ScheduledPosts } from "@/components/dashboard/ScheduledPosts";
import { AgentScheduledPosts } from "./AgentScheduledPosts";
import { AgentData } from "@/types/agent";

export default function DashboardPage() {
  const { 
    incompleteAgent, 
    setIncompleteAgent, 
    setLoading, 
    isLoading 
  } = useAgentStore();
  
  const [completedAgent, setCompletedAgent] = useState<AgentData | null>(null);
  const [triggerDetails, setTriggerDetails] = useState(null);
  const [postingMode, setPostingMode] = useState<'automatic' | 'manual_approval'>('manual_approval');

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
        setLoading(true);
        const [automationResponse, statsResponse, connectionsResponse] = await Promise.all([
          api.get('/social/agents/status'),
          api.get('/social/agents/stats'),
          api.get('/social/agents/connections/stats')
        ]);
        
        if (automationResponse.data?.incompleteAgent) {
          const agentId = automationResponse.data.incompleteAgent.id;
          
          // Check if the agent has both social connections and triggers
          if (automationResponse.data.incompleteAgent.hasSocialConnections && 
              automationResponse.data.incompleteAgent.hasTriggers) {
            // This is a completed agent, fetch full details
            try {
              const agentDetailsResponse = await api.get(`/social/agents/${agentId}`);
              setCompletedAgent(agentDetailsResponse.data);
              
              // Fetch trigger details
              const socialConnectionsResponse = await api.get(`/social/agents/${agentId}/connections`);
              console.log(socialConnectionsResponse.data);
              if (socialConnectionsResponse.data && socialConnectionsResponse.data.length > 0) {
                const connection = socialConnectionsResponse.data[0];
                setTriggerDetails(connection.platform_settings);
                setPostingMode(connection.posting_mode);
              }
              
              // Clear incomplete agent since it's now complete
              setIncompleteAgent(null);
            } catch (error) {
              console.error('Failed to fetch agent details:', error);
              // Fall back to showing incomplete agent
              setIncompleteAgent({
                id: automationResponse.data.incompleteAgent.id,
                agentName: automationResponse.data.incompleteAgent.name,
                hasSocialConnections: automationResponse.data.incompleteAgent.hasSocialConnections,
                hasTriggers: automationResponse.data.incompleteAgent.hasTriggers
              });
            }
          } else {
            // This is truly an incomplete agent
            setIncompleteAgent({
              id: automationResponse.data.incompleteAgent.id,
              agentName: automationResponse.data.incompleteAgent.name,
              hasSocialConnections: automationResponse.data.incompleteAgent.hasSocialConnections,
              hasTriggers: automationResponse.data.incompleteAgent.hasTriggers
            });
          }
        } else {
          setIncompleteAgent(null);
        }

        setAgentStats(statsResponse.data || { total: 0, newThisMonth: 0 });
        setConnectionStats(connectionsResponse.data || { total: 0, platformCount: 0 });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setIncompleteAgent(null);
        setCompletedAgent(null);
        setAgentStats({ total: 0, newThisMonth: 0 });
        setConnectionStats({ total: 0, platformCount: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader />
      
      {incompleteAgent && (
        <div className="my-6">
          <AutomationStatus
            agentId={incompleteAgent.id}
            agentName={incompleteAgent.agentName}
            hasSocialConnections={incompleteAgent.hasSocialConnections}
            hasTriggers={incompleteAgent.hasTriggers}
          />
        </div>
      )}
      
      {/* Agent Detail and Stats Section */}
      <div className="grid grid-cols-1 gap-4">
        {/* Agent Detail Card Row */}
        {completedAgent && completedAgent.id && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Agent Detail Card - Full Width */}
            <div className="lg:col-span-3">
              <AgentDetailCard 
                agent={completedAgent} 
                triggerDetails={triggerDetails}
                postingMode={postingMode}
              />
            </div>
            
            {/* Agent Specific Scheduled Posts - Right Side */}
            <div className="lg:col-span-1">
              <AgentScheduledPosts agentId={completedAgent.id} />
            </div>
          </div>
        )}
      </div>

      {/* Global Scheduled Posts Section */}
      <div className="mt-6 grid grid-cols-1 gap-4">
        {/* Stats Cards Column */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>
      </div>
    </div>
  );
} 