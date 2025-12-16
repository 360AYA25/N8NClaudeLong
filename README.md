# n8n-claude-only

MCP (Model Context Protocol) server enabling Claude Code to create and manage n8n workflows with full automation capabilities.

## Overview

This project provides AI assistants like Claude with structured access to n8n's workflow automation platform. It enables intelligent workflow generation, validation, and management through a comprehensive set of MCP tools.

## ✨ Features

- 🔍 **Node Search** - Search and discover 543+ n8n nodes with full documentation
- ✅ **Workflow Validation** - Validate workflow structure and node configurations
- 📚 **Template Library** - Access 2,709+ pre-built workflow templates
- 🔧 **Workflow Management** - Create, update, execute, and monitor workflows
- 🚀 **Dual Modes** - Run as stdio (Claude Desktop) or HTTP server
- 💾 **SQLite Database** - Efficient local storage for nodes and templates
- 🔐 **n8n API Integration** - Direct integration with n8n instances

## 🎯 Use Cases

- **AI-Assisted Workflow Creation** - Let Claude design workflows based on requirements
- **Workflow Validation** - Check workflows before deployment
- **Template Discovery** - Find and customize existing workflows
- **Documentation Lookup** - Get instant node documentation and examples
- **Automation Testing** - Execute and monitor workflow runs

## Installation

```bash
# Install dependencies
npm install

# Build project
npm run build

# Start server
npm start
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Required Settings

- `MCP_MODE` - Server mode (`stdio` or `http`)

### Optional Settings

- `N8N_API_URL` - Your n8n instance URL
- `N8N_API_KEY` - n8n API authentication token
- `DATABASE_PATH` - Path to SQLite database

## 🚀 Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

### HTTP Server Mode

```bash
npm run start:http
```

## 🤖 Claude Desktop Integration

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "n8n-claude": {
      "command": "node",
      "args": ["/absolute/path/to/N8NClaudeOnly/dist/mcp/index.js"],
      "env": {
        "MCP_MODE": "stdio"
      }
    }
  }
}
```

Restart Claude Desktop to load the MCP server.

## 🛠️ Available MCP Tools

### Documentation Tools
- `search_nodes` - Search for n8n nodes by functionality
- `get_node` - Get detailed node information and properties
- `validate_node` - Validate node configuration

### Template Tools
- `search_templates` - Find workflow templates by category/complexity
- `get_template` - Get complete workflow JSON

### Workflow Management (requires n8n API)
- `create_workflow` - Create new workflows in n8n
- `get_workflow` - Retrieve existing workflows
- `update_workflow` - Modify workflows
- `list_workflows` - List all workflows
- `execute_workflow` - Run workflows
- `validate_workflow` - Validate complete workflow structure

See [docs/USAGE.md](docs/USAGE.md) for detailed tool documentation.

## Testing

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## 📁 Project Structure

```
src/
├── config/              # Configuration management
├── database/            # SQLite schema and repositories
│   ├── repositories/    # Data access layer
│   ├── schema.ts        # Database schema
│   └── client.ts        # SQLite client
├── mcp/                 # MCP protocol implementation
│   ├── server.ts        # MCP server
│   ├── tools.ts         # Tool definitions
│   ├── handlers.ts      # Tool execution
│   └── index.ts         # CLI entry point
├── n8n/                 # n8n API integration
│   └── client.ts        # REST API client
├── services/            # Business logic layer
│   ├── NodeService.ts
│   ├── WorkflowService.ts
│   ├── ValidationService.ts
│   └── TemplateService.ts
├── loaders/             # Data loading utilities
├── utils/               # Helper functions
├── types/               # TypeScript definitions
├── errors/              # Custom error classes
├── index.ts             # Main entry point
└── http-server.ts       # HTTP mode server
```

## 📚 Documentation

- [Usage Guide](docs/USAGE.md) - Detailed tool usage and examples
- [Architecture](docs/ARCHITECTURE.md) - System design and patterns

## 🔧 Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 🤝 Contributing

Based on [czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp) - full implementation for Claude Code integration.

## 📄 License

MIT

## 👤 Author

Sergey
