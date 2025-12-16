/**
 * n8n API client for workflow management
 */

import { config } from '@/config';
import { N8nApiError } from '@/errors';
import { logger } from '@/utils/logger';

export interface N8nWorkflow {
  id?: string;
  name: string;
  active: boolean;
  nodes: unknown[];
  connections: unknown;
  settings?: Record<string, unknown>;
  staticData?: unknown;
  tags?: string[];
}

export interface N8nExecution {
  id: string;
  finished: boolean;
  mode: string;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  data?: unknown;
}

export class N8nClient {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    if (!config.n8n) {
      throw new N8nApiError('n8n API configuration not found');
    }
    this.apiUrl = config.n8n.apiUrl.replace(/\/$/, '');
    this.apiKey = config.n8n.apiKey;
  }

  /**
   * Make authenticated request to n8n API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'X-N8N-API-KEY': this.apiKey,
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    try {
      logger.debug(`n8n API request: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new N8nApiError(
          `n8n API error: ${response.statusText} - ${errorText}`,
          response.status
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof N8nApiError) throw error;
      throw new N8nApiError(`Failed to connect to n8n API: ${error}`);
    }
  }

  /**
   * Create a new workflow
   */
  async createWorkflow(workflow: N8nWorkflow): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>('/api/v1/workflows', {
      method: 'POST',
      body: JSON.stringify(workflow),
    });
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(id: string): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>(`/api/v1/workflows/${id}`);
  }

  /**
   * Update workflow
   */
  async updateWorkflow(id: string, workflow: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>(`/api/v1/workflows/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(workflow),
    });
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    await this.request(`/api/v1/workflows/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * List all workflows
   */
  async listWorkflows(): Promise<{ data: N8nWorkflow[] }> {
    return this.request<{ data: N8nWorkflow[] }>('/api/v1/workflows');
  }

  /**
   * Activate workflow
   */
  async activateWorkflow(id: string): Promise<N8nWorkflow> {
    return this.updateWorkflow(id, { active: true });
  }

  /**
   * Deactivate workflow
   */
  async deactivateWorkflow(id: string): Promise<N8nWorkflow> {
    return this.updateWorkflow(id, { active: false });
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(id: string, data?: unknown): Promise<N8nExecution> {
    return this.request<N8nExecution>(`/api/v1/workflows/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  /**
   * Get execution by ID
   */
  async getExecution(id: string): Promise<N8nExecution> {
    return this.request<N8nExecution>(`/api/v1/executions/${id}`);
  }

  /**
   * List executions for workflow
   */
  async listExecutions(workflowId: string): Promise<{ data: N8nExecution[] }> {
    return this.request<{ data: N8nExecution[] }>(
      `/api/v1/executions?workflowId=${workflowId}`
    );
  }

  /**
   * Test workflow connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/healthz');
      return true;
    } catch {
      return false;
    }
  }
}
