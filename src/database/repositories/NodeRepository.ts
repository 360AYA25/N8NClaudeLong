/**
 * Repository for node operations
 */

import { DatabaseClient } from '../client';
import { DatabaseError } from '@/errors';

export interface NodeRow {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  category: string | null;
  version: number;
  icon: string | null;
  documentation_url: string | null;
}

export interface NodePropertyRow {
  id: number;
  node_id: number;
  name: string;
  type: string;
  display_name: string | null;
  description: string | null;
  required: boolean;
  default_value: string | null;
  options: string | null;
}

export class NodeRepository {
  constructor(private db: DatabaseClient) {}

  /**
   * Create a new node
   */
  create(node: Omit<NodeRow, 'id'>): number {
    try {
      const result = this.db.run(
        `INSERT INTO nodes (name, display_name, description, category, version, icon, documentation_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          node.name,
          node.display_name,
          node.description,
          node.category,
          node.version,
          node.icon,
          node.documentation_url,
        ]
      );
      return result.lastInsertRowid as number;
    } catch (error) {
      throw new DatabaseError(`Failed to create node: ${error}`);
    }
  }

  /**
   * Find node by name
   */
  findByName(name: string): NodeRow | undefined {
    return this.db.get<NodeRow>('SELECT * FROM nodes WHERE name = ?', [name]);
  }

  /**
   * Find node by ID
   */
  findById(id: number): NodeRow | undefined {
    return this.db.get<NodeRow>('SELECT * FROM nodes WHERE id = ?', [id]);
  }

  /**
   * Search nodes by text
   */
  search(query: string, limit: number = 20): NodeRow[] {
    const searchTerm = `%${query}%`;
    return this.db.all<NodeRow>(
      `SELECT * FROM nodes
       WHERE name LIKE ? OR display_name LIKE ? OR description LIKE ?
       ORDER BY name
       LIMIT ?`,
      [searchTerm, searchTerm, searchTerm, limit]
    );
  }

  /**
   * Get nodes by category
   */
  findByCategory(category: string): NodeRow[] {
    return this.db.all<NodeRow>('SELECT * FROM nodes WHERE category = ? ORDER BY name', [
      category,
    ]);
  }

  /**
   * Get all nodes
   */
  findAll(limit?: number): NodeRow[] {
    const query = limit
      ? 'SELECT * FROM nodes ORDER BY name LIMIT ?'
      : 'SELECT * FROM nodes ORDER BY name';
    return this.db.all<NodeRow>(query, limit ? [limit] : []);
  }

  /**
   * Add property to node
   */
  addProperty(property: Omit<NodePropertyRow, 'id'>): number {
    try {
      const result = this.db.run(
        `INSERT INTO node_properties (node_id, name, type, display_name, description, required, default_value, options)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          property.node_id,
          property.name,
          property.type,
          property.display_name,
          property.description,
          property.required ? 1 : 0,
          property.default_value,
          property.options,
        ]
      );
      return result.lastInsertRowid as number;
    } catch (error) {
      throw new DatabaseError(`Failed to add node property: ${error}`);
    }
  }

  /**
   * Get properties for a node
   */
  getProperties(nodeId: number): NodePropertyRow[] {
    return this.db.all<NodePropertyRow>(
      'SELECT * FROM node_properties WHERE node_id = ? ORDER BY name',
      [nodeId]
    );
  }

  /**
   * Get node with properties
   */
  getNodeWithProperties(name: string): { node: NodeRow; properties: NodePropertyRow[] } | null {
    const node = this.findByName(name);
    if (!node) return null;

    const properties = this.getProperties(node.id);
    return { node, properties };
  }

  /**
   * Count total nodes
   */
  count(): number {
    const result = this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM nodes');
    return result?.count || 0;
  }
}
