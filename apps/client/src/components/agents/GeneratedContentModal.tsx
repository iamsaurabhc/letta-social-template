import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface GeneratedContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
}

export function GeneratedContentModal({ isOpen, onClose, content }: GeneratedContentModalProps) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generated Content</DialogTitle>
        </DialogHeader>
        <div className="relative mt-4">
          <div className="rounded-lg bg-muted p-4">
            <pre className="whitespace-pre-wrap text-sm">{content}</pre>
          </div>
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 