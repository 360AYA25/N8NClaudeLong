/**
 * Database schema definitions for SQLite
 */

export const SCHEMA = {
  nodes: `
    CREATE TABLE IF NOT EXISTS nodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT,
      category TEXT,
      version INTEGER DEFAULT 1,
      icon TEXT,
      documentation_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  node_properties: `
    CREATE TABLE IF NOT EXISTS node_properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      display_name TEXT,
      description TEXT,
      required BOOLEAN DEFAULT 0,
      default_value TEXT,
      options TEXT,
      FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE,
      UNIQUE(node_id, name)
    )
  `,

  node_examples: `
    CREATE TABLE IF NOT EXISTS node_examples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      node_id INTEGER NOT NULL,
      configuration TEXT NOT NULL,
      description TEXT,
      use_case TEXT,
      FOREIGN KEY (node_id) REFERENCES nodes(id) ON DELETE CASCADE
    )
  `,

  workflow_templates: `
    CREATE TABLE IF NOT EXISTS workflow_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      template_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      workflow_json TEXT NOT NULL,
      nodes_used TEXT,
      complexity TEXT,
      category TEXT,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  indexes: [
    'CREATE INDEX IF NOT EXISTS idx_nodes_name ON nodes(name)',
    'CREATE INDEX IF NOT EXISTS idx_nodes_category ON nodes(category)',
    'CREATE INDEX IF NOT EXISTS idx_node_properties_node_id ON node_properties(node_id)',
    'CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category)',
  ],
};
