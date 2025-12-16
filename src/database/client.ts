/**
 * SQLite database client
 */

import Database from 'better-sqlite3';
import { config } from '@/config';
import { DatabaseError } from '@/errors';
import { logger } from '@/utils/logger';
import { SCHEMA } from './schema';

export class DatabaseClient {
  private db: Database.Database | null = null;

  constructor(private dbPath: string = config.database.path) {}

  /**
   * Initialize database connection and create tables
   */
  async connect(): Promise<void> {
    try {
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON');

      logger.info(`Database connected: ${this.dbPath}`);

      await this.createTables();
    } catch (error) {
      throw new DatabaseError(`Failed to connect to database: ${error}`);
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new DatabaseError('Database not connected');

    try {
      this.db.exec(SCHEMA.nodes);
      this.db.exec(SCHEMA.node_properties);
      this.db.exec(SCHEMA.node_examples);
      this.db.exec(SCHEMA.workflow_templates);

      SCHEMA.indexes.forEach((index) => this.db!.exec(index));

      logger.info('Database tables created');
    } catch (error) {
      throw new DatabaseError(`Failed to create tables: ${error}`);
    }
  }

  /**
   * Get database instance
   */
  getDb(): Database.Database {
    if (!this.db) {
      throw new DatabaseError('Database not connected');
    }
    return this.db;
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      logger.info('Database connection closed');
    }
  }

  /**
   * Run a query with parameters
   */
  run(query: string, params?: unknown[]): Database.RunResult {
    return this.getDb().prepare(query).run(...(params || []));
  }

  /**
   * Get single row
   */
  get<T = unknown>(query: string, params?: unknown[]): T | undefined {
    return this.getDb().prepare(query).get(...(params || [])) as T | undefined;
  }

  /**
   * Get all rows
   */
  all<T = unknown>(query: string, params?: unknown[]): T[] {
    return this.getDb().prepare(query).all(...(params || [])) as T[];
  }

  /**
   * Execute transaction
   */
  transaction<T>(fn: () => T): T {
    const db = this.getDb();
    const transaction = db.transaction(fn);
    return transaction();
  }
}

// Singleton instance
export const dbClient = new DatabaseClient();
