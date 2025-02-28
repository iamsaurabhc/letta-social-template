import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import api from "@/utils/api";

interface GeneratedContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: {
    normal: string;
    longForm: string;
  };
  agentId: string;
  connectionId: string;
}

type ScheduleTime = "now" | "hour" | "custom";

export function GeneratedContentModal({ isOpen, onClose, content, agentId, connectionId }: GeneratedContentModalProps) {
  const [currentView, setCurrentView] = useState<"normal" | "longForm">("normal");
  const [scheduleTime, setScheduleTime] = useState<ScheduleTime>("now");
  const [customDate, setCustomDate] = useState<Date>(new Date());
  const [isScheduling, setIsScheduling] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(currentView === "normal" ? content.normal : content.longForm);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard",
    });
  };

  const getScheduledTime = () => {
    switch (scheduleTime) {
      case "now":
        return new Date();
      case "hour":
        const hourLater = new Date();
        hourLater.setHours(hourLater.getHours() + 1);
        return hourLater;
      case "custom":
        return customDate;
      default:
        return new Date();
    }
  };

  const handleSchedule = async () => {
    try {
      setIsScheduling(true);
      const scheduledFor = getScheduledTime();
      
      if (!connectionId) {
        throw new Error('No connection ID provided');
      }

      console.log('Scheduling post with payload:', {
        agentId,
        connectionId,
        format: currentView,
        content: currentView === "normal" ? content.normal : content.longForm,
        scheduledFor: scheduledFor.toISOString()
      });

      const response = await api.post("/social/posts/schedule", {
        agentId,
        connectionId,
        format: currentView,
        content: currentView === "normal" ? content.normal : content.longForm,
        scheduledFor: scheduledFor.toISOString()
      });

      console.log('Schedule response:', response);

      toast({
        title: "Success!",
        description: "Post has been scheduled successfully",
      });
      onClose();
    } catch (error) {
      console.error('Scheduling error details:', {
        error,
        payload: {
          agentId,
          connectionId,
          format: currentView,
          scheduledFor: getScheduledTime().toISOString()
        }
      });

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule post. Please try again.",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Generated Content
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                disabled={currentView === "normal"}
                onClick={() => setCurrentView("normal")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {currentView === "normal" ? "Normal" : "Long Form"}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={currentView === "longForm"}
                onClick={() => setCurrentView("longForm")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative mt-4">
          <div className="rounded-lg bg-muted p-4">
            <pre className="whitespace-pre-wrap text-sm">
              {currentView === "normal" ? content.normal : content.longForm}
            </pre>
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

        <Separator className="my-4" />

        <div className="space-y-4">
          <RadioGroup
            value={scheduleTime}
            onValueChange={(value) => setScheduleTime(value as ScheduleTime)}
            className="flex items-center space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="now" id="now" />
              <Label htmlFor="now">Now</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hour" id="hour" />
              <Label htmlFor="hour">In an hour</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom">Custom</Label>
            </div>
          </RadioGroup>

          {scheduleTime === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                  {format(customDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={customDate}
                  onSelect={(date) => date && setCustomDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}

          <Button 
            className="w-full" 
            onClick={handleSchedule}
            disabled={isScheduling}
          >
            {isScheduling ? "Scheduling..." : "Schedule Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 