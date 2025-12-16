/**
 * Service for workflow template operations
 */

import { TemplateRepository, TemplateRow } from '@/database';
import { logger } from '@/utils/logger';

export interface TemplateSearchOptions {
  category?: string;
  complexity?: string;
  limit?: number;
}

export class TemplateService {
  constructor(private templateRepo: TemplateRepository) {}

  /**
   * Search templates
   */
  async searchTemplates(query: string, options?: TemplateSearchOptions): Promise<TemplateRow[]> {
    logger.debug(`Searching templates with query: ${query}`);
    return this.templateRepo.search(query, options);
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<TemplateRow | null> {
    logger.debug(`Getting template: ${templateId}`);
    const template = this.templateRepo.findById(templateId);
    return template || null;
  }

  /**
   * Get template workflow JSON
   */
  async getTemplateWorkflow(templateId: string): Promise<unknown | null> {
    const template = await this.getTemplate(templateId);
    if (!template) return null;

    try {
      return JSON.parse(template.workflow_json);
    } catch (error) {
      logger.error(`Failed to parse template workflow JSON: ${error}`);
      return null;
    }
  }

  /**
   * Get templates by category
   */
  async getTemplatesByCategory(category: string): Promise<TemplateRow[]> {
    logger.debug(`Getting templates for category: ${category}`);
    return this.templateRepo.findByCategory(category);
  }

  /**
   * Get all templates
   */
  async getAllTemplates(limit?: number): Promise<TemplateRow[]> {
    logger.debug('Getting all templates');
    return this.templateRepo.findAll(limit);
  }

  /**
   * Get template statistics
   */
  async getStats(): Promise<{ totalTemplates: number }> {
    const totalTemplates = this.templateRepo.count();
    return { totalTemplates };
  }
}
