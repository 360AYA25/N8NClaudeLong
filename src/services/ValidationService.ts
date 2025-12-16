/**
 * Service for workflow validation
 */

import { N8nWorkflow } from '@/n8n/client';
import { NodeService } from './NodeService';
import { logger } from '@/utils/logger';
import { ValidationResult, ValidationError } from '@/types';

export class ValidationService {
  constructor(private nodeService: NodeService) {}

  /**
   * Validate workflow structure and configuration
   */
  async validateWorkflow(workflow: N8nWorkflow): Promise<ValidationResult> {
    logger.debug(`Validating workflow: ${workflow.name}`);

    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Basic structure validation
    if (!workflow.name || workflow.name.trim() === '') {
      errors.push({
        field: 'name',
        message: 'Workflow name is required',
        severity: 'error',
      });
    }

    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      errors.push({
        field: 'nodes',
        message: 'Workflow must contain nodes array',
        severity: 'error',
      });
      return { valid: false, errors, warnings };
    }

    if (workflow.nodes.length === 0) {
      warnings.push('Workflow has no nodes');
    }

    // Validate each node
    for (const node of workflow.nodes as Array<{ type: string; parameters?: Record<string, unknown> }>) {
      if (!node.type) {
        errors.push({
          field: 'nodes',
          message: 'Node type is required',
          severity: 'error',
        });
        continue;
      }

      // Check if node type exists
      const nodeDetails = await this.nodeService.getNodeDetails(node.type);
      if (!nodeDetails) {
        errors.push({
          field: 'nodes',
          message: `Unknown node type: ${node.type}`,
          severity: 'error',
        });
        continue;
      }

      // Validate required properties
      if (nodeDetails.properties && node.parameters) {
        const requiredProps = nodeDetails.properties.filter((p) => p.required);
        for (const prop of requiredProps) {
          if (!(prop.name in node.parameters)) {
            errors.push({
              field: `nodes.${node.type}.${prop.name}`,
              message: `Required property missing: ${prop.name}`,
              severity: 'error',
            });
          }
        }
      }
    }

    // Validate connections
    if (!workflow.connections) {
      warnings.push('Workflow has no connections between nodes');
    }

    const valid = errors.length === 0;

    if (valid) {
      logger.info(`Workflow validation passed: ${workflow.name}`);
    } else {
      logger.warn(`Workflow validation failed: ${workflow.name}`, errors);
    }

    return {
      valid,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Quick validation (minimal checks)
   */
  async quickValidate(workflow: N8nWorkflow): Promise<boolean> {
    if (!workflow.name || !workflow.nodes || !Array.isArray(workflow.nodes)) {
      return false;
    }
    return workflow.nodes.length > 0;
  }
}
