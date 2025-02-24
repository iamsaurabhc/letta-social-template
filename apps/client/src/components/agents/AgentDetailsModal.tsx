'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AgentData } from "../automation/AutomationModal/types";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

interface AgentDetailsModalProps {
  agent: AgentData;
  isOpen: boolean;
  onClose: () => void;
}

export function AgentDetailsModal({ agent, isOpen, onClose }: AgentDetailsModalProps) {
  const router = useRouter();

  const parseArrayField = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(',').map(item => item.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Agent Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="border-b pb-2 pt-2">
              <h3 className="font-medium">Basic Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Agent Name</Label>
                <p className="text-sm mt-1">{agent.name}</p>
              </div>
              
              <div>
                <Label>Created</Label>
                <p className="text-sm mt-1">
                  {agent.created_at 
                    ? new Date(agent.created_at).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })
                    : 'N/A'}
                </p>
              </div>

              {agent.website_url && (
                <div className="col-span-2">
                  <Label>Website URL</Label>
                  <a 
                    href={agent.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm mt-1 text-primary hover:underline block"
                  >
                    {agent.website_url}
                  </a>
                </div>
              )}

              {agent.description && (
                <div className="col-span-2">
                  <Label>Description</Label>
                  <p className="text-sm mt-1">{agent.description}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="border-b pb-2">
              <h3 className="font-medium">Agent Preferences</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Industries</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {parseArrayField(agent.industry).map((ind) => (
                    <span 
                      key={ind}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>Target Audience</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {agent.target_audience?.map((audience) => (
                    <span 
                      key={audience}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                    >
                      {audience}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label>Brand Personality</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {agent.brand_personality?.map((trait) => (
                    <span 
                      key={trait}
                      className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              onClick={() => router.push(`/dashboard/automation?step=social&agentId=${agent.id}`)}
            >
              Continue Setup
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 