import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

interface Props {
  onFinish: (data: { postingMode: 'automatic' | 'manual_approval', schedules: [] }) => void;
}

export default function CreateTrigger({ onFinish }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Setup Triggers</h3>
      {/* Form will go here */}
      <div className="flex justify-between">
        <Button 
          variant="outline"
          onClick={() => {
            const agentId = searchParams.get('agentId');
            router.push(`/dashboard/automation?step=social&agentId=${agentId}`);
          }}
        >
          Back
        </Button>
        <Button onClick={() => onFinish({ postingMode: 'manual_approval', schedules: [] })}>
          Save & Deploy
        </Button>
      </div>
    </div>
  );
} 