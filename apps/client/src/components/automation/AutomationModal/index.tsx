import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateAgent from './steps/CreateAgent';
import { useState } from 'react';
import { AutomationStepData } from './types';
import LinkSocial from './steps/LinkSocial';
import CreateTrigger from './steps/CreateTrigger';

export function AutomationModal({
  isOpen,
  onClose,
  initialStep = 'agent'
}: {
  isOpen: boolean;
  onClose: () => void;
  initialStep?: 'agent' | 'social' | 'trigger';
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [stepData, setStepData] = useState<AutomationStepData>({
    agent: null,
    socialConnections: [],
    inspirationUrls: [],
    triggers: null
  });

  const handleFinalSubmit = async () => {
    // Will implement this later
    console.log('Final data:', stepData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Add Automation</DialogTitle>
        </DialogHeader>
        
        <Tabs value={currentStep} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agent">
              <span className="hidden md:inline">Create Agent</span>
              <span className="md:hidden">Agent</span>
            </TabsTrigger>
            <TabsTrigger value="social" disabled={!stepData.agent}>
              <span className="hidden md:inline">Link Social</span>
              <span className="md:hidden">Socials</span>
            </TabsTrigger>
            <TabsTrigger 
              value="trigger" 
              disabled={!stepData.agent || stepData.socialConnections.length === 0}
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
              }}
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
              }}
            />
          </TabsContent>

          <TabsContent value="trigger">
            <CreateTrigger 
              onFinish={async (triggerData) => {
                setStepData(prev => ({ ...prev, triggers: triggerData }));
                // Handle final submission
                await handleFinalSubmit();
                onClose();
              }}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 