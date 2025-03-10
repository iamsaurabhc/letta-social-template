'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Users, Share2, Zap, TrendingUp, Calendar, Bot, AlertCircle } from "lucide-react";
import { useState, useEffect } from 'react';
import { AutomationStatus } from "@/components/automation/AutomationStatus";
import { AgentDetailCard } from "@/components/agents/AgentDetailCard";
import { Progress } from "@/components/ui/progress";
import api from '@/utils/api';
import { useAgentStore } from '@/stores/agentStore';
import { AgentScheduledPosts } from "./AgentScheduledPosts";
import { AgentData } from "@/types/agent";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

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

  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);

  const router = useRouter();

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
    <div className="flex-1 space-y-6 p-2 sm:p-4 md:p-8 pt-6">
      {/* Welcome Section with Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-blue-500 to-indigo-500">
          <CardHeader>
            <CardTitle className="text-white">Welcome to AI Social Automation</CardTitle>
            <CardDescription className="text-white/90">
              Your AI-powered social media management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="secondary" 
                className="w-full bg-white/10 hover:bg-white/20 text-white border-0"
                onClick={() => router.push('/dashboard/automation')}
              >
                <Bot className="mr-2 h-4 w-4" />
                Create New Automation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Health Score */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">AI Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">87%</span>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </div>
              <Progress value={87} className="h-2" />
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Content Quality
                </div>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  Engagement Rate
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Automation Status */}
      {incompleteAgent && (
        <div className="my-4">
          <AutomationStatus
            agentId={incompleteAgent.id}
            agentName={incompleteAgent.agentName}
            hasSocialConnections={incompleteAgent.hasSocialConnections}
            hasTriggers={incompleteAgent.hasTriggers}
          />
        </div>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.total}</div>
            <div className="flex items-center text-xs text-emerald-500 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{agentStats.newThisMonth} from last month
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-lime-50 dark:from-green-950/30 dark:to-lime-950/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Accounts</CardTitle>
            <Share2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectionStats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across {connectionStats.platformCount} platform{connectionStats.platformCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Engagement</CardTitle>
            <Activity className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.8k</div>
            <p className="text-xs text-muted-foreground">
              +19% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automated Posts</CardTitle>
            <Zap className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Details Section */}
      {completedAgent && completedAgent.id && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Active Agent Overview</CardTitle>
                <CardDescription>Monitor and manage your AI agent's performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <AgentDetailCard 
                  agent={completedAgent} 
                  triggerDetails={triggerDetails}
                  postingMode={postingMode}
                />
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Content Generated</span>
                    <span className="text-2xl font-bold">127</span>
                    <span className="text-xs text-muted-foreground">Last 30 days</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Avg. Engagement</span>
                    <span className="text-2xl font-bold">4.2k</span>
                    <span className="text-xs text-muted-foreground">Per post</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-2xl font-bold">94%</span>
                    <span className="text-xs text-muted-foreground">Content approval</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Upcoming Schedule</CardTitle>
                <CardDescription>Next 24 hours of activity</CardDescription>
              </CardHeader>
              <CardContent>
                <AgentScheduledPosts agentId={completedAgent.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
} 