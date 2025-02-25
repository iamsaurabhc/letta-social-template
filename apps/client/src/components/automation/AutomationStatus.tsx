import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useAgentStore } from "@/stores/agentStore";

interface AutomationStatusProps {
  agentName: string;
  hasSocialConnections: boolean;
  hasTriggers: boolean;
  agentId: string;
}


interface StepItemProps {
  isCompleted: boolean;
  label: string;
  mobileLabel?: string;
}

const StepItem = ({ isCompleted, label, mobileLabel }: StepItemProps) => (
  <div className="flex items-center justify-between" role="listitem">
    <div className="flex items-center gap-2">
      {isCompleted ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" aria-label="Completed" />
      ) : (
        <AlertCircle className="h-5 w-5 text-yellow-500" aria-label="Pending" />
      )}
      <span>
        {mobileLabel ? (
          <>
            <span className="sm:hidden">{mobileLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </span>
    </div>
    <span className="text-sm text-muted-foreground">
      {isCompleted ? 'Completed' : 'Pending'}
    </span>
  </div>
);

const FallbackComponent = () => (
  <Card className="border-dashed">
    <CardHeader>
      <CardTitle>Error Loading Automation Status</CardTitle>
      <CardDescription>Please refresh the page to try again</CardDescription>
    </CardHeader>
  </Card>
);

const LoadingState = () => (
  <Card className="border-dashed">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Skeleton className="h-6 w-[200px]" />
      </CardTitle>
      <CardDescription>
        <Skeleton className="h-4 w-[300px]" />
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export function AutomationStatus({ 
  agentName, 
  hasSocialConnections, 
  hasTriggers, 
  agentId 
}: AutomationStatusProps) {
  const router = useRouter();
  const startingStep = !hasSocialConnections ? 'social' : 'trigger';
  const isLoading = useAgentStore((state) => state.isLoading);

  const handleContinueSetup = () => {
    try {
      router.push(`/dashboard/automation?step=${startingStep}&agentId=${agentId}`);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Complete Your Automation</span>
            {(!hasSocialConnections || !hasTriggers) && (
              <AlertCircle 
                className="h-5 w-5 text-yellow-500" 
                aria-label="Setup incomplete" 
              />
            )}
          </CardTitle>
          <CardDescription>
            Continue setting up automation for {agentName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4" role="list">
            <StepItem 
              isCompleted={true} 
              label="Agent Created" 
            />
            <StepItem 
              isCompleted={hasSocialConnections}
              label="Social Accounts Connected"
              mobileLabel="Social Accounts"
            />
            <StepItem 
              isCompleted={hasTriggers}
              label="Automation Triggers Set"
              mobileLabel="Automation Triggers"
            />
          </div>

          {(!hasSocialConnections || !hasTriggers) && (
            <Button 
              onClick={handleContinueSetup}
              className="w-full mt-4"
              aria-label="Continue automation setup"
            >
              Continue Setup
              <ChevronRight className="h-4 w-4 ml-2" aria-hidden="true" />
            </Button>
          )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  );
} 