'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateAgent from '@/components/automation/AutomationModal/steps/CreateAgent';
import { useState, useEffect } from 'react';
import { AutomationStepData } from '@/components/automation/AutomationModal/types';
import LinkSocial from '@/components/automation/AutomationModal/steps/LinkSocial';
import CreateTrigger from '@/components/automation/AutomationModal/steps/CreateTrigger';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/utils/api';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { useAgentStore } from '@/stores/agentStore';
import { toast } from '@/hooks/use-toast';

export default function AutomationPage() {
  const [currentStep, setCurrentStep] = useState<'agent' | 'social' | 'trigger'>('agent');
  const [stepData, setStepData] = useState<AutomationStepData>({
    agent: null,
    socialConnections: [],
    inspirationUrls: [],
    triggers: null
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle step and agentId from URL
    const step = searchParams.get('step');
    const agentId = searchParams.get('agentId');

    if (step && ['agent', 'social', 'trigger'].includes(step)) {
      setCurrentStep(step as 'agent' | 'social' | 'trigger');
    }

    // If we have an agentId, fetch the agent data
    if (agentId) {
      fetchAgentData(agentId);
    }
  }, [searchParams]);

  const fetchAgentData = async (agentId: string) => {
    try {
      const response = await api.get(`/social/agents/${agentId}`);
      setStepData(prev => ({
        ...prev,
        agent: response.data
      }));
    } catch (error) {
      console.error('Failed to fetch agent data:', error);
    }
  };

  // Preserve agentId when navigating between steps
  const navigateToStep = (step: string, preserveParams = true) => {
    const currentUrl = new URL(window.location.href);
    const agentId = currentUrl.searchParams.get('agentId');
    
    if (preserveParams) {
      // Keep agentId if it exists and update step
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('step', step);
      router.push(newUrl.toString());
    } else {
      // Only keep step parameter
      const newUrl = new URL(window.location.pathname, window.location.origin);
      newUrl.searchParams.set('step', step);
      if (agentId) {
        newUrl.searchParams.set('agentId', agentId);
      }
      router.push(newUrl.toString());
    }
  };

  const handleFinalSubmit = async () => {
    // Will implement this later
    console.log('Final data:', stepData);
    router.push('/dashboard');
  };

  return (
    <div className="container max-w-[800px] py-6">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {stepData.agent ? (
              <>
                <h1 className="text-2xl font-bold">Continue Automation Setup</h1>
                <div className="flex flex-col gap-1">
                  <p className="text-muted-foreground">
                    Set up automated posting for agent <span className="font-bold">{stepData.agent.name}</span>
                  </p>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold">Add Automation</h1>
                <p className="text-muted-foreground">Set up automated posting for your agent</p>
              </>
            )}
          </div>
          
          {stepData.agent && (
            <Button 
              onClick={() => {
                const nextStep = !stepData.socialConnections.length ? 'social' : 'trigger';
                router.push(`/dashboard/automation?step=${nextStep}&agentId=${stepData.agent?.id}`);
              }}
              className="w-full sm:w-auto"
            >
              Save & Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Tabs value={currentStep} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 p-1.5 bg-secondary/50">
          <TabsTrigger 
            value="agent"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
          >
            <span className="hidden md:inline">Create Agent</span>
            <span className="md:hidden">Agent</span>
          </TabsTrigger>
          <TabsTrigger 
            value="social" 
            disabled={!stepData.agent}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
          >
            <span className="hidden md:inline">Link Social</span>
            <span className="md:hidden">Socials</span>
          </TabsTrigger>
          <TabsTrigger 
            value="trigger" 
            disabled={!stepData.agent || stepData.socialConnections.length === 0}
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white"
          >
            <span className="hidden md:inline">Setup Triggers</span>
            <span className="md:hidden">Triggers</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agent">
          <CreateAgent 
            onNext={(agentData) => {
              setStepData(prev => ({ ...prev, agent: agentData }));
              setCurrentStep('social');
              router.push(`/dashboard/automation?step=social&agentId=${agentData.id}`);
            }}
            readOnly={!!stepData.agent}
            initialData={stepData.agent || undefined}
          />
        </TabsContent>

        <TabsContent value="social">
          <LinkSocial 
            onNext={(socialData) => {
              setStepData(prev => ({
                ...prev,
                socialConnections: socialData.connections,
                inspirationUrls: socialData.inspirationUrls
              }));
              setCurrentStep('trigger');
              router.push(`/dashboard/automation?step=trigger&agentId=${stepData.agent?.id}`);
            }}
          />
        </TabsContent>

        <TabsContent value="trigger">
          <CreateTrigger 
            onFinish={async (triggerData) => {
              setStepData(prev => ({ ...prev, triggers: triggerData }));
              await handleFinalSubmit();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
} 