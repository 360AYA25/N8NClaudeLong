# Usage Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Build Project

```bash
npm run build
```

### 4. Start Server

```bash
# stdio mode (for Claude Desktop)
npm start

# HTTP mode (for remote access)
npm run start:http
```

## Available MCP Tools

### Documentation Tools

#### search_nodes
Search for n8n nodes by name or functionality.

```json
{
  "query": "http",
  "limit": 20
}
```

#### get_node
Get detailed information about a specific node.

```json
{
  "nodeName": "n8n-nodes-base.httpRequest"
}
```

#### validate_node
Validate node configuration.

```json
{
  "nodeType": "n8n-nodes-base.httpRequest",
  "configuration": {
    "url": "https://api.example.com",
    "method": "GET"
  }
}
```

### Template Tools

#### search_templates
Search for workflow templates.

```json
{
  "query": "api",
  "category": "API",
  "complexity": "beginner",
  "limit": 10
}
```

#### get_template
Get complete workflow JSON for a template.

```json
{
  "templateId": "simple-http-request"
}
```

### Workflow Management Tools

*(Requires n8n API configuration)*

#### create_workflow
Create a new workflow in n8n.

```json
{
  "name": "My Workflow",
  "nodes": [...],
  "connections": {...},
  "active": false
}
```

#### validate_workflow
Validate complete workflow structure.

```json
{
  "workflow": {
    "name": "Test Workflow",
    "nodes": [...],
    "connections": {...}
  }
}
```

#### get_workflow
Retrieve an existing workflow.

```json
{
  "workflowId": "123"
}
```

#### update_workflow
Update an existing workflow.

```json
{
  "workflowId": "123",
  "updates": {
    "name": "Updated Name",
    "active": true
  }
}
```

#### list_workflows
List all workflows.

```json
{}
```

#### execute_workflow
Execute a workflow.

```json
{
  "workflowId": "123",
  "data": {
    "input": "test data"
  }
}
```

## Configuration

### Required Settings

- `MCP_MODE` - Server mode (`stdio` or `http`)

### Optional Settings

- `N8N_API_URL` - Your n8n instance URL (e.g., `http://localhost:5678`)
- `N8N_API_KEY` - n8n API authentication token
- `DATABASE_PATH` - Path to SQLite database (default: `./data/nodes.db`)
- `PORT` - HTTP server port (default: `3000`)
- `HOST` - HTTP server host (default: `localhost`)
- `LOG_LEVEL` - Logging level (default: `info`)

## Claude Desktop Integration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "n8n-claude": {
      "command": "node",
      "args": ["/path/to/N8NClaudeOnly/dist/mcp/index.js"],
      "env": {
        "MCP_MODE": "stdio"
      }
    }
  }
}
```

## HTTP Mode

When running in HTTP mode, access tools via POST requests:

```bash
curl -X POST http://localhost:3000/tools/search_nodes \
  -H "Content-Type: application/json" \
  -d '{"query": "http", "limit": 5}'
```

## Examples

### Example 1: Search for HTTP nodes

```javascript
// Using search_nodes tool
{
  "query": "http request",
  "limit": 5
}
```

### Example 2: Create a simple webhook workflow

```javascript
// Using create_workflow tool
{
  "name": "Webhook Test",
  "nodes": [
    {
      "id": "webhook1",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "path": "test-webhook"
      }
    },
    {
      "id": "http1",
      "type": "n8n-nodes-base.httpRequest",
      "position": [450, 300],
      "parameters": {
        "url": "https://api.example.com/data",
        "method": "GET"
      }
    }
  ],
  "connections": {
    "webhook1": {
      "main": [[{"node": "http1", "type": "main", "index": 0}]]
    }
  },
  "active": false
}
```

### Example 3: Validate workflow before creation

```javascript
// First validate
{
  "workflow": {
    "name": "Test Workflow",
    "nodes": [...],
    "connections": {...}
  }
}

// If valid, then create
{
  "name": "Test Workflow",
  "nodes": [...],
  "connections": {...}
}
```

## Troubleshooting

### Database not found

Ensure database path is correct in `.env`:

```
DATABASE_PATH=./data/nodes.db
```

### n8n API connection failed

Check n8n configuration:

```
N8N_API_URL=http://localhost:5678
N8N_API_KEY=your-api-key-here
```

Verify n8n is running and API is enabled.

### MCP tools not appearing in Claude

1. Check Claude Desktop config path
2. Verify `dist/mcp/index.js` exists (run `npm run build`)
3. Restart Claude Desktop
4. Check logs for errors
