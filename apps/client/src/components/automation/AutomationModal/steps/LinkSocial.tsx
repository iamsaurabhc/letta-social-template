import { Button } from "@/components/ui/button";

interface Props {
  onNext: (data: { connections: [], inspirationUrls: string[] }) => void;
}

export default function LinkSocial({ onNext }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Link Social Accounts</h3>
      {/* Form will go here */}
      <div className="flex justify-end">
        <Button onClick={() => onNext({ connections: [], inspirationUrls: [] })}>
          Save & Continue
        </Button>
      </div>
    </div>
  );
} 