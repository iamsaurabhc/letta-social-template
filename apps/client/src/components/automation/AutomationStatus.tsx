import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { useState } from "react";
import { AutomationModal } from "./AutomationModal";

interface AutomationStatusProps {
  agentName: string;
  hasSocialConnections: boolean;
  hasTriggers: boolean;
}

export function AutomationStatus({ agentName, hasSocialConnections, hasTriggers }: AutomationStatusProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Determine which step to start from
  const startingStep = !hasSocialConnections ? 'social' : 'trigger';

  return (
    <>
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Complete Your Automation Setup</span>
            {!hasSocialConnections && (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
          </CardTitle>
          <CardDescription>
            Continue setting up automation for {agentName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Agent Created</span>
              </div>
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasSocialConnections ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <span>Social Accounts Connected</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {hasSocialConnections ? 'Completed' : 'Pending'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasTriggers ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <span>Automation Triggers</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {hasTriggers ? 'Completed' : 'Pending'}
              </span>
            </div>

            {(!hasSocialConnections || !hasTriggers) && (
              <Button 
                onClick={() => setIsModalOpen(true)}
                className="w-full mt-4"
              >
                Continue Setup
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <AutomationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialStep={startingStep}
      />
    </>
  );
} 