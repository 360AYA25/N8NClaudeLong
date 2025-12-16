/**
 * MCP Tool definitions for n8n workflow automation
 */

import { Tool } from '@modelcontextprotocol/sdk/types.js';

export const TOOLS: Tool[] = [
  {
    name: 'search_nodes',
    description:
      'Search for n8n nodes by name or functionality. Returns list of available nodes with their descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (node name, category, or functionality)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 20)',
          default: 20,
        },
      },
      required: ['query'],
    },
  },

  {
    name: 'get_node',
    description:
      'Get detailed information about a specific n8n node including all properties, types, and configuration options.',
    inputSchema: {
      type: 'object',
      properties: {
        nodeName: {
          type: 'string',
          description: 'Exact name of the node (e.g., "n8n-nodes-base.httpRequest")',
        },
      },
      required: ['nodeName'],
    },
  },

  {
    name: 'validate_node',
    description:
      'Validate a node configuration. Checks if all required properties are present and correctly formatted.',
    inputSchema: {
      type: 'object',
      properties: {
        nodeType: {
          type: 'string',
          description: 'Node type to validate',
        },
        configuration: {
          type: 'object',
          description: 'Node configuration object to validate',
        },
      },
      required: ['nodeType', 'configuration'],
    },
  },

  {
    name: 'search_templates',
    description:
      'Search for workflow templates by keyword, category, or complexity. Returns pre-built workflow examples.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query (keyword, use case, or description)',
        },
        category: {
          type: 'string',
          description: 'Filter by category',
        },
        complexity: {
          type: 'string',
          description: 'Filter by complexity (beginner, intermediate, advanced)',
          enum: ['beginner', 'intermediate', 'advanced'],
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results (default: 10)',
          default: 10,
        },
      },
      required: ['query'],
    },
  },

  {
    name: 'get_template',
    description:
      'Get complete workflow JSON for a template by ID. Returns full workflow structure ready to use.',
    inputSchema: {
      type: 'object',
      properties: {
        templateId: {
          type: 'string',
          description: 'Template ID to retrieve',
        },
      },
      required: ['templateId'],
    },
  },

  {
    name: 'create_workflow',
    description:
      'Create a new workflow in n8n. Requires n8n API configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Workflow name',
        },
        nodes: {
          type: 'array',
          description: 'Array of workflow nodes',
        },
        connections: {
          type: 'object',
          description: 'Node connections configuration',
        },
        active: {
          type: 'boolean',
          description: 'Whether workflow should be active (default: false)',
          default: false,
        },
      },
      required: ['name', 'nodes', 'connections'],
    },
  },

  {
    name: 'validate_workflow',
    description:
      'Validate complete workflow structure. Checks nodes, connections, and required properties.',
    inputSchema: {
      type: 'object',
      properties: {
        workflow: {
          type: 'object',
          description: 'Complete workflow object to validate',
        },
      },
      required: ['workflow'],
    },
  },

  {
    name: 'get_workflow',
    description:
      'Retrieve an existing workflow from n8n by ID. Requires n8n API configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'Workflow ID to retrieve',
        },
      },
      required: ['workflowId'],
    },
  },

  {
    name: 'update_workflow',
    description:
      'Update an existing workflow in n8n. Requires n8n API configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'Workflow ID to update',
        },
        updates: {
          type: 'object',
          description: 'Workflow updates (name, nodes, connections, etc.)',
        },
      },
      required: ['workflowId', 'updates'],
    },
  },

  {
    name: 'list_workflows',
    description:
      'List all workflows in n8n instance. Requires n8n API configuration.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },

  {
    name: 'execute_workflow',
    description:
      'Execute a workflow in n8n. Requires n8n API configuration.',
    inputSchema: {
      type: 'object',
      properties: {
        workflowId: {
          type: 'string',
          description: 'Workflow ID to execute',
        },
        data: {
          type: 'object',
          description: 'Input data for workflow execution',
        },
      },
      required: ['workflowId'],
    },
  },
];
