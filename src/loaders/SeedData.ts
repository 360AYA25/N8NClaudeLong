/**
 * Seed data loader for n8n nodes
 */

import { NodeRepository, TemplateRepository } from '@/database';
import { logger } from '@/utils/logger';

/**
 * Sample n8n nodes for initial database seeding
 */
export const SAMPLE_NODES = [
  {
    name: 'n8n-nodes-base.httpRequest',
    display_name: 'HTTP Request',
    description: 'Makes an HTTP request and returns the response data',
    category: 'Core Nodes',
    version: 1,
    icon: 'fa:at',
    documentation_url: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/',
  },
  {
    name: 'n8n-nodes-base.set',
    display_name: 'Set',
    description: 'Sets values on items and optionally remove other values',
    category: 'Core Nodes',
    version: 1,
    icon: 'fa:pen',
    documentation_url: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.set/',
  },
  {
    name: 'n8n-nodes-base.if',
    display_name: 'IF',
    description: 'Routes items to different branches based on comparison operations',
    category: 'Core Nodes',
    version: 1,
    icon: 'fa:map-signs',
    documentation_url: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.if/',
  },
  {
    name: 'n8n-nodes-base.webhook',
    display_name: 'Webhook',
    description: 'Starts workflow execution when webhook is called',
    category: 'Core Nodes',
    version: 1,
    icon: 'fa:satellite-dish',
    documentation_url: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/',
  },
];

/**
 * Sample properties for HTTP Request node
 */
export const HTTP_REQUEST_PROPERTIES = [
  {
    name: 'url',
    type: 'string',
    display_name: 'URL',
    description: 'The URL to make the request to',
    required: true,
    default_value: null,
    options: null,
  },
  {
    name: 'method',
    type: 'options',
    display_name: 'Method',
    description: 'The HTTP method to use',
    required: true,
    default_value: JSON.stringify('GET'),
    options: JSON.stringify(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']),
  },
  {
    name: 'authentication',
    type: 'options',
    display_name: 'Authentication',
    description: 'The authentication method to use',
    required: false,
    default_value: JSON.stringify('none'),
    options: JSON.stringify(['none', 'basicAuth', 'oAuth2', 'headerAuth']),
  },
];

/**
 * Seed database with initial data
 */
export async function seedDatabase(
  nodeRepo: NodeRepository,
  templateRepo: TemplateRepository
): Promise<void> {
  logger.info('Seeding database with sample data...');

  // Check if data already exists
  const existingCount = nodeRepo.count();
  if (existingCount > 0) {
    logger.info(`Database already has ${existingCount} nodes, skipping seed`);
    return;
  }

  // Insert sample nodes
  for (const node of SAMPLE_NODES) {
    try {
      const nodeId = nodeRepo.create(node);
      logger.debug(`Created node: ${node.name} (ID: ${nodeId})`);

      // Add properties for HTTP Request node
      if (node.name === 'n8n-nodes-base.httpRequest') {
        for (const prop of HTTP_REQUEST_PROPERTIES) {
          nodeRepo.addProperty({ ...prop, node_id: nodeId });
        }
      }
    } catch (error) {
      logger.error(`Failed to create node ${node.name}:`, error);
    }
  }

  logger.info(`Seeded ${SAMPLE_NODES.length} nodes`);

  // Add sample template
  try {
    const sampleWorkflow = {
      name: 'Simple HTTP Request',
      nodes: [
        {
          id: 'webhook',
          type: 'n8n-nodes-base.webhook',
          position: [250, 300],
          parameters: {
            path: 'webhook-test',
          },
        },
        {
          id: 'httpRequest',
          type: 'n8n-nodes-base.httpRequest',
          position: [450, 300],
          parameters: {
            url: 'https://api.example.com/data',
            method: 'GET',
          },
        },
      ],
      connections: {
        webhook: {
          main: [[{ node: 'httpRequest', type: 'main', index: 0 }]],
        },
      },
    };

    templateRepo.create({
      template_id: 'simple-http-request',
      name: 'Simple HTTP Request',
      description: 'A simple workflow that makes an HTTP request when webhook is triggered',
      workflow_json: JSON.stringify(sampleWorkflow),
      nodes_used: JSON.stringify(['webhook', 'httpRequest']),
      complexity: 'beginner',
      category: 'API',
      tags: JSON.stringify(['http', 'webhook', 'api']),
    });

    logger.info('Seeded 1 sample template');
  } catch (error) {
    logger.error('Failed to create sample template:', error);
  }

  logger.info('Database seeding completed');
}
