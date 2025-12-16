# n8n-MCP Features & Tools

## 📊 Coverage Statistics

- **543 n8n nodes** from n8n-nodes-base and @n8n/n8n-nodes-langchain
- **99% property schema coverage** with detailed configurations
- **87% official documentation coverage** including AI nodes
- **271 AI-capable nodes** with full documentation
- **2,646 pre-extracted configurations** from popular templates
- **2,709 workflow templates** with complete metadata
- **~12ms average response time** with optimized SQLite database

## 🛠️ Available MCP Tools (20 Total)

### Core Documentation Tools (7 tools)

1. **`tools_documentation`** - Reference for any MCP tool
   - Get help for specific tools or overview

2. **`search_nodes`** - Full-text search across 543+ nodes
   - Optional: `includeExamples: true` for real-world configurations
   - Modes: OR (default), AND, FUZZY
   - Returns up to 20 results

3. **`get_node`** - Unified node information
   - Detail levels: `minimal` (~200 tokens), `standard` (~1-2K, default), `full` (~3-8K)
   - Modes: `info` (default), `docs` (markdown), `search_properties`, `versions`, `compare`, `breaking`, `migrations`
   - `includeExamples: true` for template configurations
   - `includeTypeInfo: true` for type structure metadata

4. **`validate_node`** - Configuration validation
   - `mode='minimal'` - Quick required fields check (<100ms)
   - `mode='full'` - Comprehensive validation with errors/warnings/suggestions
   - Profiles: `strict`, `runtime`, `ai-friendly`, `minimal`

5. **`validate_workflow`** - Complete workflow validation
   - Validates structure, connections, expressions, AI tools
   - Returns errors, warnings, and suggested fixes

6. **`search_templates`** - Multi-mode template discovery
   - `searchMode='keyword'` - Text search (default)
   - `searchMode='by_nodes'` - Find templates using specific nodes
   - `searchMode='by_task'` - Curated task-based templates
   - `searchMode='by_metadata'` - Filter by complexity/services
   - Filtering: complexity, targetAudience, maxSetupMinutes, requiredService

7. **`get_template`** - Retrieve complete workflow JSON
   - Modes: `nodes_only`, `structure`, `full` (default)

### n8n Management Tools (13 tools - Requires API Configuration)

#### Workflow Management (8 tools)

8. **`n8n_create_workflow`** - Create new workflows
   - Requires: name, nodes[], connections{}
   - Created inactive by default

9. **`n8n_get_workflow`** - Retrieve existing workflows
   - Modes: `full`, `details` (with stats), `structure` (topology), `minimal` (metadata)

10. **`n8n_update_full_workflow`** - Complete workflow update
    - Requires entire nodes[] and connections{}

11. **`n8n_update_partial_workflow`** - Incremental updates with diff operations
    - Operations: addNode, removeNode, updateNode, moveNode, enable/disableNode
    - addConnection, removeConnection (with branch parameter for IF nodes)
    - updateSettings, updateName, add/removeTag, cleanStaleConnections
    - `continueOnError: true` for best-effort mode

12. **`n8n_delete_workflow`** - Permanently delete workflow

13. **`n8n_list_workflows`** - List all workflows (minimal metadata)
    - Filters: active, projectId, tags
    - Pagination: cursor, limit (1-100)

14. **`n8n_validate_workflow`** - Validate by ID
    - Options: validateNodes, validateConnections, validateExpressions
    - Profiles: minimal, runtime, ai-friendly, strict

15. **`n8n_autofix_workflow`** - Auto-fix common errors
    - Fixes: expression-format, typeversion-correction, error-output-config
    - `applyFixes: false` for preview mode
    - `confidenceThreshold`: high, medium, low

#### Workflow Execution (1 tool)

16. **`n8n_test_workflow`** - Test/trigger workflow execution
    - Auto-detects trigger type: webhook, form, chat
    - Supports custom data, headers, HTTP methods
    - `waitForResponse: true` (default) to wait for completion

#### Execution Management (3 tools)

17. **`n8n_executions`** - Manage execution records
    - Actions: `get` (details), `list` (all executions), `delete` (remove record)
    - Filters: workflowId, status (success/error/waiting), projectId
    - Modes for `get`: preview, summary (default), filtered, full

#### Version Control (1 tool)

18. **`n8n_workflow_versions`** - Version history management
    - Modes: `list`, `get`, `rollback`, `delete`, `prune`, `truncate`
    - Automatic backup before rollback
    - Prune to keep N most recent versions

#### Template Deployment (1 tool)

19. **`n8n_deploy_template`** - Deploy from n8n.io directly
    - Auto-fixes common issues after deployment
    - `autoUpgradeVersions: true` for latest typeVersions
    - `stripCredentials: true` (default) for security

#### System Tools (1 tool)

20. **`n8n_health_check`** - API connectivity verification
    - Modes: `status` (quick check), `diagnostic` (detailed debug)

## 🎯 Best Practices

### Workflow Building Strategy

1. **Templates First** - Always check 2,709 templates before building from scratch
2. **Silent Execution** - Execute tools without commentary between operations
3. **Parallel Operations** - Run independent tasks simultaneously for efficiency
4. **Multi-Level Validation** - Quick check → Full validation → Workflow validation
5. **Never Trust Defaults** - Explicitly configure ALL parameters

### Safety Guidelines

⚠️ **CRITICAL: Never edit production workflows directly with AI!**

Always:
- Create workflow copies before modifications
- Test in development environments
- Export backups of important workflows
- Validate all changes before production deployment

### Configuration Validation

```javascript
// Level 1 - Quick (before building)
validate_node({nodeType, config, mode: 'minimal'})

// Level 2 - Comprehensive (before building)
validate_node({nodeType, config, mode: 'full', profile: 'runtime'})

// Level 3 - Complete (after building)
validate_workflow(workflow)

// Level 4 - Post-Deployment
n8n_validate_workflow({id})
n8n_autofix_workflow({id})
```

### Batch Operations

✅ **GOOD** - Single call with multiple operations:
```json
n8n_update_partial_workflow({
  id: "wf-123",
  operations: [
    {type: "updateNode", nodeId: "slack-1", changes: {...}},
    {type: "updateNode", nodeId: "http-1", changes: {...}},
    {type: "cleanStaleConnections"}
  ]
})
```

❌ **BAD** - Separate calls:
```json
n8n_update_partial_workflow({id: "wf-123", operations: [{...}]})
n8n_update_partial_workflow({id: "wf-123", operations: [{...}]})
```

## 🔧 Critical Configuration Notes

### addConnection Syntax

The `addConnection` operation requires **four separate string parameters**:

✅ **CORRECT:**
```json
{
  "type": "addConnection",
  "source": "node-id-string",
  "target": "target-node-id-string",
  "sourcePort": "main",
  "targetPort": "main"
}
```

### IF Node Multi-Output Routing

IF nodes have **two outputs** (TRUE and FALSE). Use the **`branch` parameter**:

```json
// TRUE branch
{type: "addConnection", source: "If Node", target: "True Handler",
 sourcePort: "main", targetPort: "main", branch: "true"}

// FALSE branch
{type: "addConnection", source: "If Node", target: "False Handler",
 sourcePort: "main", targetPort: "main", branch: "false"}
```

## 📚 Resources

- **Repository**: https://github.com/czlonkowski/n8n-mcp
- **Dashboard**: https://dashboard.n8n-mcp.com
- **Stars**: 10.8k+ on GitHub
- **License**: MIT
