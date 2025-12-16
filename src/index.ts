/**
 * Main entry point for n8n-claude-only MCP server
 */

import { config } from '@/config';
import { logger } from '@/utils/logger';

async function main() {
  try {
    logger.info('Starting n8n-claude-only MCP server...');
    logger.info(`Mode: ${config.mode}`);

    // TODO: Initialize MCP server based on mode

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
