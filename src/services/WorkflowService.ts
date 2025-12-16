/**
 * Service for workflow operations
 */

import { N8nClient, N8nWorkflow } from '@/n8n/client';
import { logger } from '@/utils/logger';

export class WorkflowService {
  constructor(private n8nClient: N8nClient) {}

  /**
   * Create new workflow in n8n
   */
  async createWorkflow(workflow: N8nWorkflow): Promise<N8nWorkflow> {
    logger.info(`Creating workflow: ${workflow.name}`);
    return this.n8nClient.createWorkflow(workflow);
  }

  /**
   * Get workflow by ID
   */
  async getWorkflow(id: string): Promise<N8nWorkflow> {
    logger.debug(`Getting workflow: ${id}`);
    return this.n8nClient.getWorkflow(id);
  }

  /**
   * Update existing workflow
   */
  async updateWorkflow(id: string, updates: Partial<N8nWorkflow>): Promise<N8nWorkflow> {
    logger.info(`Updating workflow: ${id}`);
    return this.n8nClient.updateWorkflow(id, updates);
  }

  /**
   * Delete workflow
   */
  async deleteWorkflow(id: string): Promise<void> {
    logger.info(`Deleting workflow: ${id}`);
    await this.n8nClient.deleteWorkflow(id);
  }

  /**
   * List all workflows
   */
  async listWorkflows(): Promise<N8nWorkflow[]> {
    logger.debug('Listing all workflows');
    const result = await this.n8nClient.listWorkflows();
    return result.data;
  }

  /**
   * Activate workflow
   */
  async activateWorkflow(id: string): Promise<N8nWorkflow> {
    logger.info(`Activating workflow: ${id}`);
    return this.n8nClient.activateWorkflow(id);
  }

  /**
   * Deactivate workflow
   */
  async deactivateWorkflow(id: string): Promise<N8nWorkflow> {
    logger.info(`Deactivating workflow: ${id}`);
    return this.n8nClient.deactivateWorkflow(id);
  }

  /**
   * Execute workflow
   */
  async executeWorkflow(id: string, data?: unknown) {
    logger.info(`Executing workflow: ${id}`);
    return this.n8nClient.executeWorkflow(id, data);
  }

  /**
   * Get execution status
   */
  async getExecution(executionId: string) {
    logger.debug(`Getting execution: ${executionId}`);
    return this.n8nClient.getExecution(executionId);
  }

  /**
   * Test n8n connection
   */
  async testConnection(): Promise<boolean> {
    logger.debug('Testing n8n connection');
    return this.n8nClient.healthCheck();
  }
}
