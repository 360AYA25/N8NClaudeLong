# GitHub Copilot Instructions

When working with this n8n-claude-only project, follow these guidelines:

## Project Context

This is an MCP (Model Context Protocol) server that enables AI assistants to create and manage n8n workflows. The codebase uses TypeScript with a 3-layer architecture.

## Code Style

- Use TypeScript strict mode
- Prefer `async/await` over promises
- Use repository pattern for database operations
- Keep services focused on business logic
- Use custom error types (DatabaseError, N8nApiError, etc.)

## Common Patterns

### Database Access
```typescript
// Use repositories, not direct SQL
const node = await nodeRepository.findByName(name);
const nodes = await nodeRepository.search(query, limit);
```

### Service Layer
```typescript
// Services orchestrate repositories and external APIs
class NodeService {
  async getNodeDetails(name: string): Promise<NodeDetail | null> {
    const result = this.nodeRepo.getNodeWithProperties(name);
    // ... transform and return
  }
}
```

### Error Handling
```typescript
// Use custom errors for clarity
throw new DatabaseError('Failed to connect');
throw new N8nApiError('API request failed', statusCode);
throw new ValidationError('Invalid configuration');
```

## Build Process

- Source: `src/` → Build: `dist/src/`
- Always run `npm run build` after changes
- MCP server entry: `dist/src/mcp/index.js`

## Testing

- Write tests for new features
- Use mocking for external dependencies
- Test both success and error paths

## Don't

- Don't use `console.log` - use `logger` utility
- Don't commit secrets or API keys
- Don't create files unless necessary
- Don't over-engineer - keep it simple

## Do

- Run `npm run typecheck` before commits
- Use ESLint auto-fix: `npm run lint:fix`
- Write clear commit messages
- Test locally before committing
