import { create } from 'zustand';
import { AgentData } from '@/components/automation/AutomationModal/types';

interface AgentStore {
  agents: AgentData[];
  incompleteAgent: {
    id: string;
    agentName: string;
    hasSocialConnections: boolean;
    hasTriggers: boolean;
    completedSteps: {
      agent: boolean;
      social: boolean;
      trigger: boolean;
    };
  } | null;
  isLoading: boolean;
  setAgents: (agents: AgentData[]) => void;
  setIncompleteAgent: (agent: any) => void;
  updateStepCompletion: (step: 'agent' | 'social' | 'trigger', completed: boolean) => void;
  setLoading: (loading: boolean) => void;
  clearStore: () => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  agents: [],
  incompleteAgent: null,
  isLoading: false,
  setAgents: (agents) => set({ agents }),
  setIncompleteAgent: (agent) => set({ 
    incompleteAgent: agent ? {
      ...agent,
      completedSteps: {
        agent: true, // Agent is always completed if we have data
        social: agent.hasSocialConnections,
        trigger: agent.hasTriggers
      }
    } : null 
  }),
  updateStepCompletion: (step, completed) => set((state) => ({
    incompleteAgent: state.incompleteAgent ? {
      ...state.incompleteAgent,
      completedSteps: {
        ...state.incompleteAgent.completedSteps,
        [step]: completed
      }
    } : null
  })),
  setLoading: (loading) => set({ isLoading: loading }),
  clearStore: () => set({ agents: [], incompleteAgent: null, isLoading: false }),
})); 