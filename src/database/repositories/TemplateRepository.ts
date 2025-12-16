/**
 * Repository for workflow template operations
 */

import { DatabaseClient } from '../client';
import { DatabaseError } from '@/errors';

export interface TemplateRow {
  id: number;
  template_id: string;
  name: string;
  description: string | null;
  workflow_json: string;
  nodes_used: string | null;
  complexity: string | null;
  category: string | null;
  tags: string | null;
  created_at: string;
}

export class TemplateRepository {
  constructor(private db: DatabaseClient) {}

  /**
   * Create a new template
   */
  create(template: Omit<TemplateRow, 'id' | 'created_at'>): number {
    try {
      const result = this.db.run(
        `INSERT INTO workflow_templates (template_id, name, description, workflow_json, nodes_used, complexity, category, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          template.template_id,
          template.name,
          template.description,
          template.workflow_json,
          template.nodes_used,
          template.complexity,
          template.category,
          template.tags,
        ]
      );
      return result.lastInsertRowid as number;
    } catch (error) {
      throw new DatabaseError(`Failed to create template: ${error}`);
    }
  }

  /**
   * Find template by ID
   */
  findById(templateId: string): TemplateRow | undefined {
    return this.db.get<TemplateRow>(
      'SELECT * FROM workflow_templates WHERE template_id = ?',
      [templateId]
    );
  }

  /**
   * Search templates
   */
  search(query: string, options?: { category?: string; complexity?: string; limit?: number }): TemplateRow[] {
    let sql = `SELECT * FROM workflow_templates WHERE (name LIKE ? OR description LIKE ? OR tags LIKE ?)`;
    const params: unknown[] = [`%${query}%`, `%${query}%`, `%${query}%`];

    if (options?.category) {
      sql += ' AND category = ?';
      params.push(options.category);
    }

    if (options?.complexity) {
      sql += ' AND complexity = ?';
      params.push(options.complexity);
    }

    sql += ' ORDER BY name';

    if (options?.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    return this.db.all<TemplateRow>(sql, params);
  }

  /**
   * Get all templates
   */
  findAll(limit?: number): TemplateRow[] {
    const query = limit
      ? 'SELECT * FROM workflow_templates ORDER BY name LIMIT ?'
      : 'SELECT * FROM workflow_templates ORDER BY name';
    return this.db.all<TemplateRow>(query, limit ? [limit] : []);
  }

  /**
   * Get templates by category
   */
  findByCategory(category: string): TemplateRow[] {
    return this.db.all<TemplateRow>(
      'SELECT * FROM workflow_templates WHERE category = ? ORDER BY name',
      [category]
    );
  }

  /**
   * Count templates
   */
  count(): number {
    const result = this.db.get<{ count: number }>('SELECT COUNT(*) as count FROM workflow_templates');
    return result?.count || 0;
  }
}
