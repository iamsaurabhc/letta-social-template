import { create } from 'zustand';
import { AgentData } from '@/components/automation/AutomationModal/types';

interface AgentStore {
  agents: AgentData[];
  incompleteAgent: {
    id: string;
    agentName: string;
    hasSocialConnections: boolean;
    hasTriggers: boolean;
  } | null;
  isLoading: boolean;
  setAgents: (agents: AgentData[]) => void;
  setIncompleteAgent: (agent: any) => void;
  setLoading: (loading: boolean) => void;
  clearStore: () => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  incompleteAgent: null,
  isLoading: false,
  setAgents: (agents) => set({ agents }),
  setIncompleteAgent: (agent) => set({ incompleteAgent: agent }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearStore: () => set({ agents: [], incompleteAgent: null, isLoading: false }),
})); 