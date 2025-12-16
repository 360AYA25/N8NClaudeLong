# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**n8n-claude-only** is an MCP (Model Context Protocol) server that enables Claude Code to create and manage n8n workflows with full automation capabilities. It provides AI assistants with structured access to n8n's workflow automation platform through 11 MCP tools.

### Architecture:
```
src/
├── database/
│   ├── schema.ts              # SQLite schema (nodes, properties, templates)
│   ├── client.ts              # Database connection & operations
│   └── repositories/          # Data access layer
│       ├── NodeRepository.ts
│       └── TemplateRepository.ts
├── mcp/
│   ├── server.ts              # MCP server implementation
│   ├── tools.ts               # 11 MCP tool definitions
│   ├── handlers.ts            # Tool execution handlers
│   └── index.ts               # CLI entry point
├── n8n/
│   └── client.ts              # n8n REST API client
├── services/
│   ├── NodeService.ts         # Node search & details
│   ├── WorkflowService.ts     # Workflow CRUD operations
│   ├── ValidationService.ts   # Configuration validation
│   └── TemplateService.ts     # Template management
├── loaders/
│   └── SeedData.ts            # Database seeding
├── config/
│   └── index.ts               # Environment configuration
├── utils/
│   └── logger.ts              # Logging utility
├── types/
│   └── index.ts               # TypeScript definitions
├── errors/
│   └── index.ts               # Custom error classes
├── http-server.ts             # HTTP mode server
└── index.ts                   # Main entry point (stdio/http)
```

## Development Commands

```bash
# Build and Setup
npm install                # Install dependencies
npm run build              # Build TypeScript → dist/src/
npm run dev                # Development mode with auto-reload

# Running
npm start                  # Start MCP server (stdio mode)
npm run start:http         # Start HTTP server mode

# Testing
npm test                   # Run all tests
npm run test:unit          # Unit tests only
npm run test:integration   # Integration tests
npm run test:e2e           # End-to-end tests

# Code Quality
npm run typecheck          # TypeScript type checking
npm run lint               # ESLint check
npm run lint:fix           # Fix linting issues
```

## VS Code Integration

**MCP Configuration:** `.vscode/mcp.json`

```json
{
  "n8n-claude": {
    "command": "node",
    "args": ["${workspaceFolder}/dist/src/mcp/index.js"],
    "env": {
      "MCP_MODE": "stdio",
      "DATABASE_PATH": "${workspaceFolder}/data/nodes.db"
    }
  }
}
```

**After changes to MCP server:**
1. Run `npm run build`
2. Reload VS Code: `Cmd+Shift+P` → "Developer: Reload Window"
3. Test changes

## MCP Tools (11 total)

### Documentation Tools
- `search_nodes` - Search n8n nodes by name/functionality
- `get_node` - Get detailed node information
- `validate_node` - Validate node configuration

### Template Tools
- `search_templates` - Find workflow templates
- `get_template` - Get complete workflow JSON

### Workflow Management (requires n8n API)
- `create_workflow` - Create new workflows
- `get_workflow` - Retrieve workflows
- `update_workflow` - Modify workflows
- `list_workflows` - List all workflows
- `execute_workflow` - Run workflows
- `validate_workflow` - Validate complete workflows

## Development Workflow

### Making Changes
1. Edit source files in `src/`
2. Run `npm run build`
3. If MCP server changed: Reload VS Code
4. Test with Claude Code
5. Commit changes

### Testing Locally
```bash
# Test MCP server starts
node dist/src/index.js

# Should see:
# [INFO] Starting n8n-claude-only MCP server...
# [INFO] Mode: stdio
# [INFO] Database connected
# [INFO] MCP server started successfully
```

### Database Management
- Database auto-creates on first run
- Seeded with 4 sample nodes + 1 template
- Located at: `data/nodes.db`
- SQLite with WAL mode for performance

## Important Development Reminders

### Core Principles
- **Do what has been asked; nothing more, nothing less**
- **NEVER create files unless absolutely necessary**
- **ALWAYS prefer editing existing files**
- **NEVER proactively create documentation files** (only when explicitly requested)

### MCP Server Changes
- After modifying MCP server code, always ask user to reload VS Code before testing
- Build is required: `npm run build`
- Check logs for errors

### Code Quality
- Run `npm run typecheck` after every change
- Run `npm run lint:fix` before commits
- Keep functions focused and small
- Use repository pattern for data access

### Testing Best Practices
- Write tests for new features
- Test both success and error cases
- Mock external dependencies (n8n API)
- Keep tests fast and isolated

### Git Workflow
- Write clear commit messages
- One feature per commit
- Test before committing
- Use conventional commits format

## Common Pitfalls

### TypeScript Compilation
- **Issue:** `dist/src/mcp/index.js` not found
- **Fix:** Run `npm run build` - output goes to `dist/src/` not `dist/`

### MCP Server Not Loading
- **Issue:** Changes not reflected in VS Code
- **Fix:** Rebuild (`npm run build`) + Reload VS Code

### Database Errors
- **Issue:** "Database not found"
- **Fix:** Run `npm start` once to initialize, then restart VS Code

### n8n API Connection
- **Issue:** "n8n API not configured"
- **Fix:** Set `N8N_API_URL` and `N8N_API_KEY` in `.vscode/mcp.json` env

## Architecture Patterns

### Repository Pattern
All database operations through repositories:
```typescript
NodeRepository.findByName(name)
NodeRepository.search(query)
TemplateRepository.findById(id)
```

### Service Layer
Business logic separated from data access:
```typescript
NodeService.getNodeDetails(name)      // Uses NodeRepository
WorkflowService.createWorkflow(...)   // Uses N8nClient
ValidationService.validateWorkflow()  // Complex validation logic
```

### Error Handling
Custom error types for clarity:
```typescript
throw new DatabaseError('...')
throw new N8nApiError('...')
throw new ValidationError('...')
```

## Performance Considerations

### Database
- SQLite with WAL mode for concurrent access
- Indexes on frequently queried columns
- Prepared statements prevent SQL injection

### API Calls
- Only call n8n API when necessary
- Cache results when appropriate
- Use validation before API calls

### Token Efficiency
- Return minimal data needed
- Use streaming for large responses
- Validate locally before API calls

## Security

### API Keys
- **NEVER commit API keys to git**
- Store in `.vscode/mcp.json` env (gitignored)
- Or use `.env` file (gitignored)

### Input Validation
- Validate all tool inputs
- Sanitize database queries (use parameterized)
- Check workflow structure before execution

## Documentation

- **README.md** - Project overview
- **docs/CLAUDE_CODE_SETUP.md** - Complete setup guide
- **docs/USAGE.md** - All MCP tools with examples
- **docs/ARCHITECTURE.md** - System design details

## File Naming Conventions

- **Services:** `XxxService.ts` (PascalCase)
- **Repositories:** `XxxRepository.ts`
- **Types:** `index.ts` for exports
- **Tests:** `xxx.test.ts`

## TypeScript Best Practices

- Use strict mode (enabled)
- Explicit return types for public methods
- Avoid `any` - use `unknown` if needed
- Type all function parameters
- Use interfaces for public contracts

# IMPORTANT REMINDERS

1. **Build before test**: Always run `npm run build` after changes
2. **Reload VS Code**: After MCP server changes, reload window
3. **Don't over-engineer**: Implement only what's requested
4. **Test locally**: Run server manually to verify
5. **Keep it simple**: Avoid premature optimization
6. **Documentation**: Only when explicitly asked
7. **Git commits**: Clear, concise messages
8. **Error handling**: Use custom error types
9. **Logging**: Use logger utility, not console
10. **Security**: Never commit secrets

---

Based on [czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp) - full implementation for Claude Code integration.
