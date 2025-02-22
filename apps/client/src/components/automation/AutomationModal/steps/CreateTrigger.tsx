import { Button } from "@/components/ui/button";

interface Props {
  onFinish: (data: { postingMode: 'automatic' | 'manual_approval', schedules: [] }) => void;
}

export default function CreateTrigger({ onFinish }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Setup Triggers</h3>
      {/* Form will go here */}
      <div className="flex justify-end">
        <Button onClick={() => onFinish({ postingMode: 'manual_approval', schedules: [] })}>
          Save & Deploy
        </Button>
      </div>
    </div>
  );
} 