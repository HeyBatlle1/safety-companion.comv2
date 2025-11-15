/**
 * Agent Configuration API Service
 *
 * Handles all API calls for the Agent Configuration Dashboard
 */

const API_BASE_URL = '/api/v1/admin';

export interface AgentConfiguration {
  id?: number;
  user_id?: string;
  agent_name: string;
  model: string;
  temperature: number;
  max_tokens: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_used_at?: string | null;
  total_executions?: number;
  avg_execution_time_ms?: number | null;
  notes?: string | null;
}

export interface AgentTestRequest {
  agent_name: string;
  test_prompt: string;
  use_config_id?: number;
}

export interface AgentTestResponse {
  agent_name: string;
  model_used: string;
  test_prompt: string;
  response: string;
  execution_time_ms: number;
  token_usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  success: boolean;
  error?: string;
}

export interface AgentStatusResponse {
  agents: AgentConfiguration[];
  total_agents: number;
  active_agents: number;
  last_execution: string | null;
  available_models: Array<{
    value: string;
    label: string;
    description: string;
  }>;
}

export interface BulkConfigUpdateRequest {
  configs: AgentConfiguration[];
}

export const getAgentConfigs = async (): Promise<AgentStatusResponse> => {
  const response = await fetch(`${API_BASE_URL}/agent-config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch agent configs: ${response.statusText}`);
  }

  return response.json();
};

export const updateAgentConfig = async (config: AgentConfiguration): Promise<AgentConfiguration> => {
  const response = await fetch(`${API_BASE_URL}/agent-config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(`Failed to update agent config: ${response.statusText}`);
  }

  return response.json();
};

export const bulkUpdateAgentConfigs = async (configs: AgentConfiguration[]): Promise<AgentConfiguration[]> => {
  const response = await fetch(`${API_BASE_URL}/agent-config/bulk`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ configs }),
  });

  if (!response.ok) {
    throw new Error(`Failed to bulk update agent configs: ${response.statusText}`);
  }

  return response.json();
};

export const testAgent = async (request: AgentTestRequest): Promise<AgentTestResponse> => {
  const response = await fetch(`${API_BASE_URL}/agent-config/test`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to test agent: ${response.statusText}`);
  }

  return response.json();
};

export const deleteAgentConfig = async (agentName: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/agent-config/${agentName}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to delete agent config: ${response.statusText}`);
  }

  return response.json();
};

export const getAgentPerformance = async (days: number = 30) => {
  const response = await fetch(`${API_BASE_URL}/agent-config/performance?days=${days}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch agent performance: ${response.statusText}`);
  }

  return response.json();
};

export const getAvailableModels = async () => {
  const response = await fetch(`${API_BASE_URL}/available-models`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch available models: ${response.statusText}`);
  }

  return response.json();
};