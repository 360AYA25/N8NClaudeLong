/**
 * HTTP server for MCP (alternative to stdio mode)
 */

import express, { Request, Response } from 'express';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { dbClient, NodeRepository, TemplateRepository } from '@/database';
import { N8nClient } from '@/n8n/client';
import { NodeService, WorkflowService, ValidationService, TemplateService } from '@/services';
import { MCPHandlers } from '@/mcp/handlers';

export async function startHttpServer() {
  const app = express();
  app.use(express.json());

  // Initialize database
  await dbClient.connect();

  // Initialize services
  const nodeRepo = new NodeRepository(dbClient);
  const templateRepo = new TemplateRepository(dbClient);
  const nodeService = new NodeService(nodeRepo);
  const templateService = new TemplateService(templateRepo);

  let workflowService: WorkflowService | null = null;
  try {
    const n8nClient = new N8nClient();
    workflowService = new WorkflowService(n8nClient);
  } catch {
    logger.warn('n8n API not configured - workflow management disabled');
  }

  const validationService = new ValidationService(nodeService);
  const handlers = new MCPHandlers(
    nodeService,
    workflowService!,
    validationService,
    templateService
  );

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', mode: 'http' });
  });

  // MCP tool endpoints
  app.post('/tools/search_nodes', async (req: Request, res: Response) => {
    try {
      const result = await handlers.handleSearchNodes(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/tools/get_node', async (req: Request, res: Response) => {
    try {
      const result = await handlers.handleGetNode(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/tools/validate_node', async (req: Request, res: Response) => {
    try {
      const result = await handlers.handleValidateNode(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/tools/search_templates', async (req: Request, res: Response) => {
    try {
      const result = await handlers.handleSearchTemplates(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/tools/get_template', async (req: Request, res: Response) => {
    try {
      const result = await handlers.handleGetTemplate(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/tools/create_workflow', async (req: Request, res: Response) => {
    if (!workflowService) {
      return res.status(503).json({ error: 'n8n API not configured' });
    }
    try {
      const result = await handlers.handleCreateWorkflow(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/tools/validate_workflow', async (req: Request, res: Response) => {
    try {
      const result = await handlers.handleValidateWorkflow(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/tools/get_workflow', async (req: Request, res: Response) => {
    if (!workflowService) {
      return res.status(503).json({ error: 'n8n API not configured' });
    }
    try {
      const result = await handlers.handleGetWorkflow(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/tools/update_workflow', async (req: Request, res: Response) => {
    if (!workflowService) {
      return res.status(503).json({ error: 'n8n API not configured' });
    }
    try {
      const result = await handlers.handleUpdateWorkflow(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/tools/list_workflows', async (req: Request, res: Response) => {
    if (!workflowService) {
      return res.status(503).json({ error: 'n8n API not configured' });
    }
    try {
      const result = await handlers.handleListWorkflows();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  app.post('/tools/execute_workflow', async (req: Request, res: Response) => {
    if (!workflowService) {
      return res.status(503).json({ error: 'n8n API not configured' });
    }
    try {
      const result = await handlers.handleExecuteWorkflow(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: String(error) });
    }
  });

  // Start server
  const server = app.listen(config.port, config.host, () => {
    logger.info(`HTTP server listening on http://${config.host}:${config.port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, closing HTTP server...');
    server.close(() => {
      dbClient.close();
      process.exit(0);
    });
  });

  return server;
}
