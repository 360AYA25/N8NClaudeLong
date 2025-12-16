# Architecture

## Overview

n8n-claude-only is an MCP (Model Context Protocol) server that bridges n8n workflow automation with AI assistants like Claude. It provides structured access to n8n's node library and enables intelligent workflow generation.

## System Architecture

```
┌─────────────────┐
│  Claude Code    │
│  (AI Assistant) │
└────────┬────────┘
         │ MCP Protocol
         │
┌────────▼────────────────────────────────────┐
│         MCP Server (stdio/HTTP)             │
│  ┌──────────────────────────────────────┐  │
│  │          Tool Handlers                │  │
│  │  - search_nodes                       │  │
│  │  - get_node                           │  │
│  │  - validate_workflow                  │  │
│  │  - create_workflow                    │  │
│  │  - etc.                               │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼───────────────────────┐  │
│  │          Services Layer               │  │
│  │  - NodeService                        │  │
│  │  - WorkflowService                    │  │
│  │  - ValidationService                  │  │
│  │  - TemplateService                    │  │
│  └──────────────┬───────────────────────┘  │
│                 │                           │
│  ┌──────────────▼──────┬─────────────────┐ │
│  │   Database Layer    │  n8n API Client │ │
│  │   (SQLite)          │                 │ │
│  │  - NodeRepository   │  - HTTP Client  │ │
│  │  - TemplateRepo     │  - Workflows    │ │
│  └─────────────────────┴─────────────────┘ │
└─────────────────────────────────────────────┘
         │                       │
         │                       │
┌────────▼────────┐    ┌────────▼─────────┐
│  nodes.db       │    │   n8n Instance   │
│  (SQLite)       │    │   (External)     │
└─────────────────┘    └──────────────────┘
```

## Layered Architecture

### 1. MCP Layer (`src/mcp/`)

**Purpose:** Handle MCP protocol communication

**Components:**
- `server.ts` - MCP server implementation
- `tools.ts` - Tool definitions (11 tools)
- `handlers.ts` - Tool execution handlers
- `index.ts` - CLI entry point

**Responsibilities:**
- Accept MCP requests from Claude
- Route tool calls to handlers
- Return structured responses
- Handle stdio/HTTP transport

### 2. Services Layer (`src/services/`)

**Purpose:** Business logic and orchestration

**Components:**
- `NodeService.ts` - Node search and details
- `WorkflowService.ts` - Workflow CRUD operations
- `ValidationService.ts` - Workflow validation
- `TemplateService.ts` - Template management

**Responsibilities:**
- Implement business rules
- Coordinate between database and API
- Data transformation
- Error handling

### 3. Data Layer (`src/database/`)

**Purpose:** Data persistence and retrieval

**Components:**
- `client.ts` - SQLite connection manager
- `schema.ts` - Database schema definitions
- `repositories/NodeRepository.ts` - Node data access
- `repositories/TemplateRepository.ts` - Template data access

**Responsibilities:**
- Database connection management
- CRUD operations
- Query optimization
- Transaction management

### 4. Integration Layer (`src/n8n/`)

**Purpose:** External API integration

**Components:**
- `client.ts` - n8n REST API client

**Responsibilities:**
- n8n API authentication
- HTTP request/response handling
- Workflow management
- Execution tracking

## Data Model

### Database Schema

```sql
-- Nodes table
nodes (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE,
  display_name TEXT,
  description TEXT,
  category TEXT,
  version INTEGER,
  icon TEXT,
  documentation_url TEXT
)

-- Node properties
node_properties (
  id INTEGER PRIMARY KEY,
  node_id INTEGER,
  name TEXT,
  type TEXT,
  display_name TEXT,
  description TEXT,
  required BOOLEAN,
  default_value TEXT,
  options TEXT
)

-- Node examples
node_examples (
  id INTEGER PRIMARY KEY,
  node_id INTEGER,
  configuration TEXT,
  description TEXT,
  use_case TEXT
)

-- Workflow templates
workflow_templates (
  id INTEGER PRIMARY KEY,
  template_id TEXT UNIQUE,
  name TEXT,
  description TEXT,
  workflow_json TEXT,
  nodes_used TEXT,
  complexity TEXT,
  category TEXT,
  tags TEXT
)
```

## Communication Flow

### Tool Call Flow

```
1. Claude → MCP Request
2. MCP Server → Route to Handler
3. Handler → Call Service
4. Service → Query Database / Call n8n API
5. Service → Return Result
6. Handler → Format Response
7. MCP Server → Return to Claude
```

### Example: search_nodes

```
User: "Find HTTP nodes"
  ↓
Claude: Call search_nodes("http")
  ↓
MCP Server: handleSearchNodes({query: "http"})
  ↓
NodeService: searchNodes("http", 20)
  ↓
NodeRepository: SELECT * FROM nodes WHERE name LIKE '%http%'
  ↓
Database: Return matching rows
  ↓
Service: Format results
  ↓
Handler: Create MCP response
  ↓
Claude: Receives node list
```

## Design Patterns

### Repository Pattern
- Encapsulates data access logic
- Provides clean interface to services
- Enables easy testing and mocking

### Service Pattern
- Separates business logic from infrastructure
- Coordinates multiple repositories/APIs
- Provides transaction boundaries

### Dependency Injection
- Services receive dependencies via constructor
- Enables testing and flexibility
- Clear dependency graph

## Configuration

### Environment-based Config (`src/config/`)

```typescript
{
  mode: 'stdio' | 'http',
  port: number,
  host: string,
  database: { path: string },
  n8n?: { apiUrl: string, apiKey: string },
  logging: { level: string },
  telemetry: { enabled: boolean }
}
```

## Security

### API Authentication
- n8n API key stored in environment
- Never exposed in responses
- Optional (degraded mode without it)

### Input Validation
- All tool inputs validated
- Schema validation for workflows
- SQL injection prevention (parameterized queries)

### Database Security
- WAL mode for concurrent access
- Foreign key constraints enabled
- Prepared statements only

## Performance

### Database Optimization
- Indexes on frequently queried columns
- Connection pooling (SQLite WAL mode)
- Lazy loading of properties

### Caching Strategy
- No caching currently (future enhancement)
- Database itself acts as cache

## Scalability

### Current Limitations
- Single SQLite database
- Synchronous tool execution
- No horizontal scaling

### Future Enhancements
- PostgreSQL support for multi-user
- Async tool execution
- Distributed deployment
- Redis caching layer

## Error Handling

### Error Types
- `MCPError` - MCP protocol errors
- `DatabaseError` - Database operations
- `ValidationError` - Data validation
- `N8nApiError` - n8n API failures

### Error Flow
```
Error occurs
  ↓
Service catches and logs
  ↓
Handler formats error response
  ↓
MCP server returns error to Claude
  ↓
Claude shows error to user
```

## Monitoring

### Logging
- Structured logging with levels (debug, info, warn, error)
- All tool calls logged
- Database operations logged
- n8n API calls logged

### Health Checks
- HTTP `/health` endpoint
- Database connection check
- n8n API connectivity test

## Deployment Modes

### stdio Mode
- For Claude Desktop integration
- Single-user, local deployment
- Fastest performance

### HTTP Mode
- For remote access
- Multi-user capable
- RESTful API interface

## Future Architecture Considerations

### Planned Enhancements
1. Real-time node updates from n8n
2. Advanced caching layer
3. Workflow execution monitoring
4. Multi-tenant support
5. GraphQL API option
6. Webhook support for n8n events
