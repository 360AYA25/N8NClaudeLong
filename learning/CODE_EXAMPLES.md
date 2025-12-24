# n8n Code Examples Reference

**Purpose:** Code examples extracted from CLAUDE.md to reduce token usage
**Usage:** Reference when needed, don't load on every request

---

## Template Search (3+ parallel)

```javascript
// Block 1 - MANDATORY parallel searches
search_templates({searchMode: 'keyword', query: 'user keywords', limit: 20})
search_templates({searchMode: 'by_task', task: 'relevant_task'})
search_templates({searchMode: 'by_metadata', complexity: 'simple'})

// Block 2 - If Block 1 returns 0 results
search_templates({query: 'broader terms', limit: 30})
search_templates({searchMode: 'by_nodes', nodeTypes: ['n8n-nodes-base.node']})
search_templates({searchMode: 'by_metadata', maxSetupMinutes: 60})
```

**Task types:** `ai_automation`, `data_sync`, `webhook_processing`, `email_automation`, `slack_integration`, `data_transformation`, `file_processing`, `scheduling`, `api_integration`, `database_operations`

---

## addConnection Syntax

### Correct Format (4 string params)
```json
{
  "type": "addConnection",
  "source": "source-node-id",
  "target": "target-node-id",
  "sourcePort": "main",
  "targetPort": "main"
}
```

### IF Node Routing (use branch param)
```json
// TRUE branch
{type: "addConnection", source: "If", target: "Success", sourcePort: "main", targetPort: "main", branch: "true"}

// FALSE branch
{type: "addConnection", source: "If", target: "Failure", sourcePort: "main", targetPort: "main", branch: "false"}
```

### Wrong Formats (DON'T USE)
```json
// ❌ Object format - fails with "Expected string, received object"
{"type": "addConnection", "connection": {"source": {...}, "destination": {...}}}

// ❌ Combined string - fails with "Source node not found"
{"type": "addConnection", "source": "node-1:main:0", "target": "node-2:main:0"}
```

---

## DOT NOTATION for updateNode (L-112 CRITICAL)

⚠️ **NEVER use nested objects in `updates` - causes 20KB data loss!**

### Wrong (CATASTROPHIC):
```javascript
// ❌ DELETES all other parameters!
n8n_update_partial_workflow({
  id: "wf-id",
  operations: [{
    type: "updateNode",
    nodeId: "ai-agent-001",
    updates: {
      parameters: {                  // Nested object
        systemMessage: "new text"    // REPLACES entire parameters!
      }
    }
  }]
})
// Result: 134KB → 114KB (20KB DELETED!)
```

### Correct (DOT NOTATION):
```javascript
// ✅ Changes ONLY systemMessage:
n8n_update_partial_workflow({
  id: "wf-id",
  operations: [{
    type: "updateNode",
    nodeId: "ai-agent-001",
    updates: {
      "parameters.systemMessage": "new text"  // DOT NOTATION!
    }
  }]
})
// Result: Only systemMessage changes
```

### Examples:
```javascript
// AI Agent prompt:
updates: { "parameters.systemMessage": "..." }

// HTTP URL:
updates: { "parameters.url": "https://..." }

// Nested option:
updates: { "parameters.options.timeout": 5000 }

// Code node:
updates: { "parameters.jsCode": "const x = 1;" }

// Multiple fields (same node):
updates: {
  "parameters.systemMessage": "...",
  "parameters.options.temperature": 0.7
}
```

---

## Batch Operations

```json
n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [
    {type: "updateNode", nodeId: "node-1", updates: {...}},
    {type: "updateNode", nodeId: "node-2", updates: {...}},
    {type: "cleanStaleConnections"}
  ]
})
```

---

## Node Configurations

### Set Node v3.4+
```javascript
{
  "mode": "manual",
  "assignments": {
    "assignments": [{
      "value": "={{ $json.field }}"  // ={{ prefix required!
    }]
  }
}
```

### IF Node v2+
```javascript
{
  "conditions": {
    "conditions": [...]  // Array, not object!
  }
}
```

### HTTP Request Error Handling
```javascript
{
  "continueOnFail": true  // Node level, not in options!
}
```

### Code Node Data Access
```javascript
const data = $node['Node Name'].json.field;
// OR
const data = $('Node Name').item.json.field;
```

### Telegram Reply Keyboard (use HTTP Request!)
```javascript
{
  "method": "POST",
  "url": "https://api.telegram.org/bot<TOKEN>/sendMessage",
  "jsonBody": "={{ JSON.stringify({
    chat_id: ...,
    reply_markup: { keyboard: [[{text: 'Button'}]] }
  }) }}"
}
```

---

## TodoWrite Structure

```javascript
TodoWrite({
  todos: [
    {content: "Task 1", status: "completed", activeForm: "Doing task 1"},
    {content: "Task 2", status: "in_progress", activeForm: "Doing task 2"},
    {content: "Task 3", status: "pending", activeForm: "Doing task 3"}
  ]
})
```

---

## Debug Session

### Start Steps

```javascript
// Step 0: Check debug_log.md
Read("projects/[workflow-name]/debug_log.md")

// Step 1: Checkpoint
n8n_workflow_versions({mode: "list", workflowId: "ID", limit: 3})
TodoWrite([{content: "Checkpoint: v#X", status: "completed", activeForm: "Saved"}])

// Step 2: Check learnings
Read("learning/INDEX.md")
Read("learning/LEARNINGS.md", {offset: LINE, limit: 50})

// Step 3: Record in debug_log.md BEFORE fix
Edit("projects/[workflow-name]/debug_log.md", add:)
// Format: ### [YYYY-MM-DD HH:MM] - Issue | Cycle: 1 | Problem | Attempt | Result

// Step 4: Plan
TodoWrite([
  {content: "Checkpoint: v#X", status: "completed"},
  {content: "Diagnose", status: "in_progress"},
  {content: "Fix", status: "pending"},
  {content: "Validate", status: "pending"}
])
```

### During Debug

```javascript
// After EACH change:
validate_node({nodeType: "...", config: {...}, mode: "full"})
validate_workflow({workflow: {...}})
n8n_validate_workflow({id: "..."})

// Update debug_log.md: ✅ WORKED / ❌ FAILED / ⚠️ PARTIAL
```

---

## Execution Analysis (L-067)

```javascript
// STEP 1: Overview (find WHERE)
n8n_executions({action: "get", id: "...", mode: "summary"})

// STEP 2: Details (find WHY) - targeted
n8n_executions({
  action: "get", id: "...",
  mode: "filtered",
  nodeNames: ["problem_node"],
  itemsLimit: -1
})
```

---

## WebSearch Templates

```javascript
// L3: Community Forum
WebSearch({query: "n8n [ERROR] site:community.n8n.io"})

// L4: GitHub Issues
WebSearch({query: "n8n [BUG] site:github.com/n8n-io/n8n/issues"})

// L4: Official Docs
WebSearch({query: "n8n [NODE] site:docs.n8n.io"})

// L5: Broad Search
WebSearch({query: "n8n [PROBLEM] solution 2024 2025"})
```

---

## Debug Log Entry Format

```markdown
### [YYYY-MM-DD HH:MM] - Issue Name

**Cycle:** 1
**Problem:** Brief description
**Attempt:** What I'm trying
**Result:** ✅ WORKED / ❌ FAILED / ⚠️ PARTIAL
**Notes:** Observations
```

---

## Learning Entry Format

```markdown
### [YYYY-MM-DD HH:MM] Short Title (L-XXX)

**Problem:** What went wrong
**Tried:**
- Attempt 1: [action] → [result]
**Root Cause:** Technical reason
**Solution:** [code or steps]
**Prevention:** How to avoid
**Impact:** HIGH/MEDIUM/LOW
**Tags:** #tag1 #tag2
```

---

## AI Prompt Writing (L-113)

### ❌ BAD - Token Waste Patterns

**1. Dialogue Rehearsals (15+ lines)**
```markdown
**Example flow with Tier 1:**
User: /meals
You: "Управление шаблонами блюд. Что хочешь сделать?"
User: "добавить греча"
You: [Call Search Food Nutrition("греча")]
API returns: {calories: 110, protein: 4.2...}
You: "Нашел данные для гречи: 📊 110ккал/100г..."
User: "да"
Tool call: Add User Meal {...}
You: "✅ Шаблон 'греча' добавлен!"
```
**Problem:** AI doesn't need dialogue rehearsal!

**2. Reference Data AI Already Knows**
```markdown
**Timezone Conversion:**
- Монреаль → America/Toronto
- Москва → Europe/Moscow
- Киев → Europe/Kiev
- Лондон → Europe/London
- Париж → Europe/Paris
- Берлин → Europe/Berlin
[...20 more cities]
```
**Problem:** AI knows timezone mappings from training!

**3. Human Checklists**
```markdown
**MANDATORY CHECKLIST before calling Update User Onboarding:**
- [ ] Asked ALL 6 profile questions (a-f)
- [ ] Asked ALL 6 macro questions (g-l)
- [ ] Converted timezone to IANA
- [ ] Have telegram_user_id from context
```
**Problem:** AI tracks this internally, doesn't need checkboxes!

**4. "Why" Explanations**
```markdown
This is important because it ensures data consistency
and prevents runtime errors that could occur if the
system tries to process incomplete information...
```
**Problem:** Just state the rule!

---

### ✅ GOOD - Token-Efficient Patterns

**1. Imperative Rules (1-2 lines)**
```markdown
Meal macro collection:
1. Try Search Food Nutrition FIRST
2. If empty → estimate → ask confirmation
3. If uncertain → ask manual input
NEVER save with null macros!
```

**2. Minimal Timezone Mapping**
```markdown
Timezone: convert to IANA.
Montreal → America/Toronto; Moscow → Europe/Moscow; Kyiv → Europe/Kiev
If uncertain: ask city/country
```

**3. Requirement (not checklist)**
```markdown
Before Update User Onboarding: MUST have all 12 fields + timezone (IANA) + telegram_user_id
```

**4. Direct Imperative**
```markdown
MUST ask confirmation before saving
```

---

### Writing Checklist

**Before saving AI_PROMPT.md:**
1. ✅ All rules use MUST/NEVER/ALWAYS?
2. ✅ Examples ≤3 lines each?
3. ✅ No dialogue examples?
4. ✅ No "why" explanations?
5. ✅ No reference data AI already knows?
6. ✅ Total <400 lines?

**Test:** "If I delete this line, will AI still understand?"
- NO → keep
- YES → delete

---

*Last Updated: 2025-12-23*
