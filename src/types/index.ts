/**
 * Common TypeScript type definitions
 */

export interface Node {
  name: string;
  displayName: string;
  description: string;
  category: string;
  version: number;
  properties: NodeProperty[];
}

export interface NodeProperty {
  name: string;
  type: string;
  displayName: string;
  description?: string;
  required?: boolean;
  default?: unknown;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  nodes: unknown[];
  connections: unknown;
  metadata?: Record<string, unknown>;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  warnings?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}
