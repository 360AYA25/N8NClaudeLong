# n8n-claude-only

MCP (Model Context Protocol) server for n8n workflow automation integration with AI assistants.

## Overview

This project provides AI assistants like Claude with structured access to n8n's workflow automation capabilities, enabling intelligent workflow generation and management.

## Features

- 🔍 Search and documentation for 543+ n8n nodes
- ✅ Configuration validation for workflows
- 📚 Access to 2,709+ workflow templates
- 🔧 Workflow management (create, update, execute)
- 🚀 Multiple deployment modes (stdio, HTTP)

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

## Usage

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

## Project Structure

```
src/
├── config/         # Configuration management
├── database/       # SQLite operations
├── mcp/           # MCP protocol implementation
├── n8n/           # n8n integration
├── services/      # Business logic
└── utils/         # Utilities
```

## License

MIT

## Author

Sergey
