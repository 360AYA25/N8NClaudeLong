/**
 * MCP Server implementation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { dbClient, NodeRepository, TemplateRepository } from '@/database';
import { N8nClient } from '@/n8n/client';
import { NodeService, WorkflowService, ValidationService, TemplateService } from '@/services';
import { logger } from '@/utils/logger';
import { config } from '@/config';
import { TOOLS } from './tools';
import { MCPHandlers } from './handlers';

export class MCPServer {
  private server: Server;
  private handlers: MCPHandlers;

  constructor() {
    this.server = new Server(
      {
        name: 'n8n-claude-only',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize services
    const nodeRepo = new NodeRepository(dbClient);
    const templateRepo = new TemplateRepository(dbClient);

    const nodeService = new NodeService(nodeRepo);
    const templateService = new TemplateService(templateRepo);

    let workflowService: WorkflowService;
    try {
      const n8nClient = new N8nClient();
      workflowService = new WorkflowService(n8nClient);
    } catch {
      logger.warn('n8n API not configured - workflow management disabled');
      workflowService = null as any; // Will be checked before use
    }

    const validationService = new ValidationService(nodeService);

    this.handlers = new MCPHandlers(
      nodeService,
      workflowService,
      validationService,
      templateService
    );

    this.setupHandlers();
  }

  /**
   * Setup MCP request handlers
   */
  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOLS,
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      logger.info(`MCP tool called: ${name}`);

      try {
        switch (name) {
          case 'search_nodes':
            return await this.handlers.handleSearchNodes(args as any);

          case 'get_node':
            return await this.handlers.handleGetNode(args as any);

          case 'validate_node':
            return await this.handlers.handleValidateNode(args as any);

          case 'search_templates':
            return await this.handlers.handleSearchTemplates(args as any);

          case 'get_template':
            return await this.handlers.handleGetTemplate(args as any);

          case 'create_workflow':
            return await this.handlers.handleCreateWorkflow(args as any);

          case 'validate_workflow':
            return await this.handlers.handleValidateWorkflow(args as any);

          case 'get_workflow':
            return await this.handlers.handleGetWorkflow(args as any);

          case 'update_workflow':
            return await this.handlers.handleUpdateWorkflow(args as any);

          case 'list_workflows':
            return await this.handlers.handleListWorkflows();

          case 'execute_workflow':
            return await this.handlers.handleExecuteWorkflow(args as any);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error(`Tool execution failed: ${name}`, error);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Tool execution failed: ${error}` }),
            },
          ],
          isError: true,
        };
      }
    });
  }

  /**
   * Start MCP server with stdio transport
   */
  async start() {
    logger.info('Starting MCP server in stdio mode...');

    // Connect to database
    await dbClient.connect();

    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    logger.info('MCP server started successfully');
  }

  /**
   * Stop MCP server
   */
  async stop() {
    logger.info('Stopping MCP server...');
    dbClient.close();
    await this.server.close();
  }
}
