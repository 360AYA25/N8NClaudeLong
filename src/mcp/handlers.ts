/**
 * MCP Tool handlers
 */

import { NodeService, WorkflowService, ValidationService, TemplateService } from '@/services';
import { logger } from '@/utils/logger';

export class MCPHandlers {
  constructor(
    private nodeService: NodeService,
    private workflowService: WorkflowService,
    private validationService: ValidationService,
    private templateService: TemplateService
  ) {}

  /**
   * Handle search_nodes tool
   */
  async handleSearchNodes(args: { query: string; limit?: number }) {
    const { query, limit = 20 } = args;
    const nodes = await this.nodeService.searchNodes(query, limit);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              found: nodes.length,
              nodes: nodes.map((n) => ({
                name: n.name,
                displayName: n.display_name,
                description: n.description,
                category: n.category,
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }

  /**
   * Handle get_node tool
   */
  async handleGetNode(args: { nodeName: string }) {
    const { nodeName } = args;
    const node = await this.nodeService.getNodeDetails(nodeName);

    if (!node) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: `Node not found: ${nodeName}` }),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(node, null, 2),
        },
      ],
    };
  }

  /**
   * Handle validate_node tool
   */
  async handleValidateNode(args: { nodeType: string; configuration: Record<string, unknown> }) {
    const { nodeType, configuration } = args;

    const nodeDetails = await this.nodeService.getNodeDetails(nodeType);
    if (!nodeDetails) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: `Unknown node type: ${nodeType}` }),
          },
        ],
        isError: true,
      };
    }

    const errors: string[] = [];
    const requiredProps = nodeDetails.properties.filter((p) => p.required);

    for (const prop of requiredProps) {
      if (!(prop.name in configuration)) {
        errors.push(`Missing required property: ${prop.name}`);
      }
    }

    const valid = errors.length === 0;

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ valid, errors: errors.length > 0 ? errors : undefined }, null, 2),
        },
      ],
    };
  }

  /**
   * Handle search_templates tool
   */
  async handleSearchTemplates(args: {
    query: string;
    category?: string;
    complexity?: string;
    limit?: number;
  }) {
    const { query, category, complexity, limit = 10 } = args;
    const templates = await this.templateService.searchTemplates(query, {
      category,
      complexity,
      limit,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              found: templates.length,
              templates: templates.map((t) => ({
                id: t.template_id,
                name: t.name,
                description: t.description,
                category: t.category,
                complexity: t.complexity,
                nodesUsed: t.nodes_used ? JSON.parse(t.nodes_used) : [],
              })),
            },
            null,
            2
          ),
        },
      ],
    };
  }

  /**
   * Handle get_template tool
   */
  async handleGetTemplate(args: { templateId: string }) {
    const { templateId } = args;
    const workflow = await this.templateService.getTemplateWorkflow(templateId);

    if (!workflow) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: `Template not found: ${templateId}` }),
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(workflow, null, 2),
        },
      ],
    };
  }

  /**
   * Handle create_workflow tool
   */
  async handleCreateWorkflow(args: {
    name: string;
    nodes: unknown[];
    connections: unknown;
    active?: boolean;
  }) {
    try {
      const workflow = await this.workflowService.createWorkflow({
        name: args.name,
        nodes: args.nodes,
        connections: args.connections,
        active: args.active || false,
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                workflow: {
                  id: workflow.id,
                  name: workflow.name,
                  active: workflow.active,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      logger.error('Failed to create workflow:', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: `Failed to create workflow: ${error}` }),
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Handle validate_workflow tool
   */
  async handleValidateWorkflow(args: { workflow: unknown }) {
    const result = await this.validationService.validateWorkflow(args.workflow as any);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }

  /**
   * Handle get_workflow tool
   */
  async handleGetWorkflow(args: { workflowId: string }) {
    try {
      const workflow = await this.workflowService.getWorkflow(args.workflowId);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(workflow, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: `Failed to get workflow: ${error}` }),
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Handle update_workflow tool
   */
  async handleUpdateWorkflow(args: { workflowId: string; updates: Record<string, unknown> }) {
    try {
      const workflow = await this.workflowService.updateWorkflow(
        args.workflowId,
        args.updates as any
      );

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, workflow }, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: `Failed to update workflow: ${error}` }),
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Handle list_workflows tool
   */
  async handleListWorkflows() {
    try {
      const workflows = await this.workflowService.listWorkflows();

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                count: workflows.length,
                workflows: workflows.map((w) => ({
                  id: w.id,
                  name: w.name,
                  active: w.active,
                })),
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: `Failed to list workflows: ${error}` }),
          },
        ],
        isError: true,
      };
    }
  }

  /**
   * Handle execute_workflow tool
   */
  async handleExecuteWorkflow(args: { workflowId: string; data?: unknown }) {
    try {
      const execution = await this.workflowService.executeWorkflow(args.workflowId, args.data);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                execution: {
                  id: execution.id,
                  workflowId: execution.workflowId,
                  finished: execution.finished,
                  startedAt: execution.startedAt,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: `Failed to execute workflow: ${error}` }),
          },
        ],
        isError: true,
      };
    }
  }
}
