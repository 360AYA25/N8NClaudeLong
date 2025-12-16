# n8n-claude-only

n8n-mcp integration for Claude Code CLI.

## Overview

This project integrates [n8n-mcp](https://github.com/czlonkowski/n8n-mcp) (10.8k⭐) with Claude Code CLI, enabling AI-assisted n8n workflow creation and management.

## ✨ Features

- 🔍 **543+ n8n nodes** - Full documentation and property schemas
- ✅ **99% property coverage** - Complete configuration access
- 📚 **2,709+ templates** - Pre-built workflows with metadata
- 🤖 **271 AI nodes** - LangChain and AI agent support
- 🔧 **20 MCP tools** - Complete workflow management
- 🚀 **~12ms response time** - Optimized SQLite database
- 🔐 **n8n API integration** - Direct instance management

## Installation

```bash
npm install
```

## Configuration

Edit [`.env`](.env) with your n8n credentials:

```bash
N8N_API_URL=https://your-n8n-instance.com
N8N_API_KEY=your-api-key-here
```

## 🤖 Claude Code CLI Setup

**Configuration file:** [`.mcp.json`](.mcp.json)

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "N8N_API_URL": "https://your-n8n-instance.com",
        "N8N_API_KEY": "your-api-key",
        "LOG_LEVEL": "error",
        "DISABLE_CONSOLE_OUTPUT": "true",
        "WEBHOOK_SECURITY_MODE": "moderate",
        "N8N_MCP_TELEMETRY_DISABLED": "true"
      }
    }
  }
}
```

**Quick Start:**
1. `npm install`
2. Edit [`.mcp.json`](.mcp.json) with your n8n credentials
3. Run `claude mcp list` to verify connection
4. **Install n8n-skills**: `/plugin install czlonkowski/n8n-skills`
5. Use `/mcp` in Claude Code to see all tools

**Verify installation:**
```bash
claude mcp list
# Should show: n8n-mcp: npx n8n-mcp - ✓ Connected
```

## 🎓 n8n Skills (Recommended)

**7 specialized knowledge modules** that teach Claude Code how to build production-ready n8n workflows:

1. **n8n Expression Syntax** - `{{}}` patterns, `$json`, `$node`, webhook data access
2. **n8n MCP Tools Expert** - Efficient tool usage and parameter formatting
3. **n8n Workflow Patterns** - 5 proven architectures from 2,653+ templates
4. **n8n Validation Expert** - Error interpretation and resolution
5. **n8n Node Configuration** - Operation-specific requirements
6. **n8n Code JavaScript** - Top 5 error patterns with solutions (62%+ failures)
7. **n8n Code Python** - Standard library usage and limitations

**Installation:**
```bash
# Step 1: Add marketplace
/plugin marketplace add czlonkowski/n8n-skills

# Step 2: Install plugin (interactive)
/plugin
# Or directly: /plugin install n8n-mcp-skills@czlonkowski/n8n-skills
```

Skills install globally to `~/.claude/plugins/cache/` and activate automatically based on your queries, providing expert guidance for workflow building.

**Repository:** [czlonkowski/n8n-skills](https://github.com/czlonkowski/n8n-skills)

## 🛠️ Available MCP Tools (20 Total)

### Documentation Tools (7)
- `tools_documentation` - Help for any MCP tool
- `search_nodes` - Search 543+ nodes with examples
- `get_node` - Detailed node info (minimal/standard/full)
- `validate_node` - Configuration validation
- `validate_workflow` - Complete workflow validation
- `search_templates` - Multi-mode template discovery
- `get_template` - Retrieve complete workflow JSON

### Workflow Management (8 - requires n8n API)
- `n8n_create_workflow` - Create new workflows
- `n8n_get_workflow` - Retrieve workflows
- `n8n_update_full_workflow` - Complete updates
- `n8n_update_partial_workflow` - Incremental updates with diff operations
- `n8n_delete_workflow` - Remove workflows
- `n8n_list_workflows` - List all workflows
- `n8n_validate_workflow` - Validate by ID
- `n8n_autofix_workflow` - Auto-fix common errors

### Execution & Testing (1)
- `n8n_test_workflow` - Test/trigger workflow execution

### Execution Management (3)
- `n8n_executions` - Get/list/delete execution records

### Version Control (1)
- `n8n_workflow_versions` - Version history & rollback

### Template Deployment (1)
- `n8n_deploy_template` - Deploy from n8n.io directly

### System Tools (1)
- `n8n_health_check` - API connectivity verification

**📖 Full documentation:** [FEATURES.md](FEATURES.md)

## 📁 Project Structure

```
N8NClaudeOnly/
├── .mcp.json            ← MCP server config (Claude Code CLI)
├── CLAUDE.md            ← n8n workflow expert prompt
├── FEATURES.md          ← Complete list of 20 MCP tools
├── .env                 ← Optional: additional configuration
├── README.md
└── package.json         ← n8n-mcp dependency
```

## ⚠️ Safety Guidelines

**NEVER edit production workflows directly with AI!** Always:
- ✅ Create workflow copies before modifications
- ✅ Test in development environments
- ✅ Export backups of important workflows
- ✅ Validate all changes before production deployment

## 🎯 Best Practices

1. **Templates First** - Check 2,709 templates before building from scratch
2. **Silent Execution** - Execute tools without commentary
3. **Parallel Operations** - Run independent tasks simultaneously
4. **Multi-Level Validation** - Quick check → Full validation → Workflow validation
5. **Never Trust Defaults** - Explicitly configure ALL parameters

See [FEATURES.md](FEATURES.md) for detailed usage patterns.

## 🤝 Contributing

Based on [czlonkowski/n8n-mcp](https://github.com/czlonkowski/n8n-mcp) - full implementation for Claude Code integration.

## 📄 License

MIT

## 👤 Author

Sergey
