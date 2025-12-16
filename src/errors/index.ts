/**
 * Custom error classes
 */

export class MCPError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MCPError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class N8nApiError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'N8nApiError';
  }
}
