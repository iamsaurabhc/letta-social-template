import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateAgent from './steps/CreateAgent';
import LinkSocial from './steps/LinkSocial';
import CreateTrigger from './steps/CreateTrigger';
import { useState } from 'react';
import { AutomationStepData } from './types';

export function AutomationModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentStep, setCurrentStep] = useState('agent');
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
            <TabsTrigger value="agent">Create Agent</TabsTrigger>
            <TabsTrigger value="social" disabled={!stepData.agent}>
              Link Social
            </TabsTrigger>
            <TabsTrigger 
              value="trigger" 
              disabled={!stepData.agent || stepData.socialConnections.length === 0}
            >
              Setup Triggers
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