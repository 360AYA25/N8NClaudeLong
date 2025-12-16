/**
 * Main entry point for n8n-claude-only MCP server
 */

import { config } from '@/config';
import { logger } from '@/utils/logger';
import { MCPServer } from '@/mcp/server';
import { dbClient, NodeRepository, TemplateRepository } from '@/database';
import { seedDatabase } from '@/loaders/SeedData';

async function main() {
  try {
    logger.info('Starting n8n-claude-only MCP server...');
    logger.info(`Mode: ${config.mode}`);

    // Initialize database and seed if needed
    await dbClient.connect();
    const nodeRepo = new NodeRepository(dbClient);
    const templateRepo = new TemplateRepository(dbClient);
    await seedDatabase(nodeRepo, templateRepo);

    if (config.mode === 'stdio') {
      // Start MCP server in stdio mode
      const server = new MCPServer();
      await server.start();

      // Keep process running
      process.stdin.resume();
    } else if (config.mode === 'http') {
      // HTTP mode - import and start HTTP server
      const { startHttpServer } = await import('./http-server');
      await startHttpServer();
    } else {
      throw new Error(`Unknown mode: ${config.mode}`);
    }

    logger.info('Server started successfully');
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
});

main();
