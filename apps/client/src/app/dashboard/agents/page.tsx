'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus } from "lucide-react";
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { AgentDetailsModal } from '@/components/agents/AgentDetailsModal';
import { AgentData } from '@/components/automation/AutomationModal/types';

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await api.get('/social/agents');
        setAgents(response.data || []);
      } catch (error) {
        console.error('Failed to fetch agents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Agents</h1>
          <p className="text-muted-foreground">Manage your AI agents and their configurations</p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/automation')}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Agent
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card 
            key={agent.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedAgent(agent)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{agent.name}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              {agent.description && (
                <CardDescription className="line-clamp-2">
                  {agent.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.isArray(agent.industry) && agent.industry.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {agent.industry.slice(0, 3).map((ind) => (
                      <span 
                        key={ind}
                        className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                      >
                        {ind}
                      </span>
                    ))}
                    {agent.industry.length > 3 && (
                      <span className="text-xs text-muted-foreground">
                        +{agent.industry.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Created {agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}

        {agents.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground mb-4">No agents found</p>
            <Button 
              onClick={() => router.push('/dashboard/automation')}
              variant="outline"
            >
              Create Your First Automation
            </Button>
          </div>
        )}
      </div>

      {selectedAgent && (
        <AgentDetailsModal
          agent={selectedAgent}
          isOpen={!!selectedAgent}
          onClose={() => setSelectedAgent(null)}
        />
      )}
    </div>
  );
} 