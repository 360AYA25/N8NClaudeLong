/**
 * Configuration management
 */

import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export interface Config {
  mode: 'stdio' | 'http';
  port: number;
  host: string;
  database: {
    path: string;
  };
  n8n?: {
    apiUrl: string;
    apiKey: string;
  };
  logging: {
    level: string;
  };
  telemetry: {
    enabled: boolean;
  };
}

export const config: Config = {
  mode: (process.env.MCP_MODE as 'stdio' | 'http') || 'stdio',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',
  database: {
    path: process.env.DATABASE_PATH || './data/nodes.db',
  },
  n8n: process.env.N8N_API_URL
    ? {
        apiUrl: process.env.N8N_API_URL,
        apiKey: process.env.N8N_API_KEY || '',
      }
    : undefined,
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  telemetry: {
    enabled: process.env.TELEMETRY_ENABLED === 'true',
  },
};
