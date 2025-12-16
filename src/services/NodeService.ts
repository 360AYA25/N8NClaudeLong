/**
 * Service for node operations
 */

import { NodeRepository, NodeRow, NodePropertyRow } from '@/database';
import { logger } from '@/utils/logger';

export interface NodeDetail {
  name: string;
  displayName: string;
  description: string | null;
  category: string | null;
  version: number;
  icon: string | null;
  documentationUrl: string | null;
  properties: Array<{
    name: string;
    type: string;
    displayName: string | null;
    description: string | null;
    required: boolean;
    defaultValue: unknown;
    options: unknown;
  }>;
}

export class NodeService {
  constructor(private nodeRepo: NodeRepository) {}

  /**
   * Search nodes by query
   */
  async searchNodes(query: string, limit: number = 20): Promise<NodeRow[]> {
    logger.debug(`Searching nodes with query: ${query}`);
    return this.nodeRepo.search(query, limit);
  }

  /**
   * Get node details with properties
   */
  async getNodeDetails(nodeName: string): Promise<NodeDetail | null> {
    logger.debug(`Getting node details for: ${nodeName}`);

    const result = this.nodeRepo.getNodeWithProperties(nodeName);
    if (!result) return null;

    const { node, properties } = result;

    return {
      name: node.name,
      displayName: node.display_name,
      description: node.description,
      category: node.category,
      version: node.version,
      icon: node.icon,
      documentationUrl: node.documentation_url,
      properties: properties.map((p) => this.mapProperty(p)),
    };
  }

  /**
   * Get nodes by category
   */
  async getNodesByCategory(category: string): Promise<NodeRow[]> {
    logger.debug(`Getting nodes for category: ${category}`);
    return this.nodeRepo.findByCategory(category);
  }

  /**
   * Get all available nodes
   */
  async getAllNodes(limit?: number): Promise<NodeRow[]> {
    logger.debug('Getting all nodes');
    return this.nodeRepo.findAll(limit);
  }

  /**
   * Get node statistics
   */
  async getStats(): Promise<{ totalNodes: number }> {
    const totalNodes = this.nodeRepo.count();
    return { totalNodes };
  }

  /**
   * Map property from database row to service format
   */
  private mapProperty(prop: NodePropertyRow) {
    return {
      name: prop.name,
      type: prop.type,
      displayName: prop.display_name,
      description: prop.description,
      required: prop.required,
      defaultValue: prop.default_value ? JSON.parse(prop.default_value) : null,
      options: prop.options ? JSON.parse(prop.options) : null,
    };
  }
}
