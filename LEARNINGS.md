# N8N Workflow Learnings

> **Как читать:** Grep по ключевым словам → Read с offset/limit
> **Как писать:** Добавлять в начало соответствующей категории
> **Формат даты:** [YYYY-MM-DD HH:MM]

---

## Quick Index

| Category | Line | Topics |
|----------|------|--------|
| MCP Operations | 50 | create, update, partial, addConnection |
| Node Configuration | 150 | expressions, parameters, defaults, Set, IF |
| Validation Errors | 250 | schema, types, missing fields |
| Execution & Debugging | 350 | logs, timeouts, mode selection |
| Telegram Bot | 450 | Reply Keyboard, HTTP Request, webhooks |
| AI Agent | 550 | memory, tools, system prompt |
| Common Gotchas | 650 | binary data, cascading changes |

**Total Entries:** 15 (initial from ClaudeN8N)
**Last Updated:** 2025-12-17

---

## MCP Operations

### [2025-12-17 12:00] addConnection requires 4 string parameters
**Problem:** Error "Expected string, received object" при добавлении connection
**Tried:**
- Object format {source: {nodeId, outputIndex}} → FAILED
- Combined string "node-1:main:0" → FAILED
**Solution:** 4 отдельных параметра:
```javascript
{
  "type": "addConnection",
  "source": "node-id",
  "target": "target-id",
  "sourcePort": "main",
  "targetPort": "main"
}
```
**Prevention:** Всегда использовать 4-param формат
**Tags:** #mcp #addConnection #partial-update
**Reference:** GitHub Issue #327

### [2025-12-17 12:00] IF Node routing requires branch parameter
**Problem:** Обе connections идут на один output (TRUE)
**Tried:** Без branch параметра → оба на TRUE
**Solution:** Добавить branch: "true" или branch: "false"
```javascript
{type: "addConnection", source: "IF", target: "Success",
 sourcePort: "main", targetPort: "main", branch: "true"}
{type: "addConnection", source: "IF", target: "Failure",
 sourcePort: "main", targetPort: "main", branch: "false"}
```
**Prevention:** Для IF Node ВСЕГДА указывать branch
**Tags:** #mcp #if-node #routing #connections

---

## Node Configuration

### [2025-12-17 12:00] Set Node v3.4+ requires mode="manual" and ={{ prefix
**Problem:** Expression not evaluated, literal string returned
**Tried:**
- value: "string{{ $json.field }}" → literal string
- value: "{{ $json.field }}" → literal string
**Solution:**
```javascript
{
  "mode": "manual",  // MANDATORY v3.4+
  "assignments": {
    "assignments": [{
      "id": "unique-id",
      "name": "output_field",
      "type": "string",
      "value": "={{ $json.field }}"  // Start with ={{
    }]
  }
}
```
**Prevention:** Always mode="manual" + ={{ prefix
**Tags:** #set-node #expressions #v3.4

### [2025-12-17 12:00] IF Node v2+ conditions must be array
**Problem:** Validation error - conditions format wrong
**Tried:** conditions as object → FAILED
**Solution:**
```javascript
"conditions": {
  "conditions": [  // Wrap in array!
    {
      "leftValue": "={{ $json.status }}",
      "operation": "equals",
      "rightValue": 200
    }
  ]
}
```
**Prevention:** Always conditions.conditions = array
**Tags:** #if-node #conditions #validation

### [2025-12-17 12:00] HTTP Request v4.2 ignoreHttpStatusErrors bug
**Problem:** ignoreHttpStatusErrors in options ignored
**Tried:** options.ignoreHttpStatusErrors: true → still fails on 4xx/5xx
**Solution:** Use continueOnFail at node level (not in parameters)
```javascript
{
  "continueOnFail": true,  // Node level!
  "parameters": {
    "url": "...",
    "method": "GET"
  }
}
```
**Prevention:** Use continueOnFail, not ignoreHttpStatusErrors
**Tags:** #http-request #error-handling #bug

### [2025-12-17 12:00] Code Node correct data access syntax
**Problem:** $('Node').first().json returns undefined
**Tried:**
- $('Check User').first().json?.field → undefined
**Solution:**
```javascript
// Correct syntax:
const data = $node['Check User'].json.field;
// OR
const data = $('Check User').item.json.field;
```
**Prevention:** Use $node['Name'].json or $().item.json
**Tags:** #code-node #syntax #data-access

---

## Validation Errors

### [2025-12-17 12:00] Never Trust Defaults - explicit parameters required
**Problem:** Runtime failures due to missing/wrong default values
**Tried:** Relying on node defaults → unpredictable behavior
**Solution:** Always specify explicitly:
```javascript
{
  "typeVersion": 3.4,        // Explicit version
  "method": "GET",           // Don't trust default
  "mode": "manual",          // Set node requirement
  "sendHeaders": true,       // HTTP Request explicit
  "responseFormat": "json"   // HTTP Request explicit
}
```
**Prevention:** Check node docs, set ALL parameters
**Tags:** #validation #defaults #best-practice

---

## Execution & Debugging

### [2025-12-17 12:00] L-067: Two-step execution for large workflows
**Problem:** mode="full" crashes on workflows >10 nodes or with binary data
**Tried:** n8n_executions({mode: "full"}) → "Prompt too long" crash
**Solution:** Two-step approach:
```javascript
// STEP 1: Overview (find WHERE) - safe ~3-5K tokens
n8n_executions({action: "get", id: "...", mode: "summary"})

// STEP 2: Details (find WHY) - only problem nodes
n8n_executions({
  action: "get", id: "...",
  mode: "filtered",
  nodeNames: ["problem_node", "before_node"],
  itemsLimit: -1
})
```
**Prevention:** Decision tree:
- >10 nodes OR binary → Two-step (L-067)
- ≤10 nodes, no binary → mode="full" safe
**Tags:** #execution #debugging #large-workflows #critical

### [2025-12-17 12:00] API timeout requires manual escalation
**Problem:** n8n API timeout, no execution data, continued guessing
**Tried:** Hypothesis-based fixes without data → wasted cycles
**Solution:** Escalate to user:
```
When API timeout:
1. Log: "API timeout - need manual check"
2. Ask user:
   "Please check n8n UI:
    - Executions page
    - Last 3 executions
    - Screenshot debug logs"
3. BLOCK further attempts until data provided
```
**Prevention:** Never fix without execution data
**Tags:** #debugging #escalation #api-timeout

---

## Telegram Bot

### [2025-12-17 12:00] L-100: Telegram node doesn't support Reply Keyboard
**Problem:** Reply Keyboard buttons never appear (9 attempts wasted)
**Tried:**
- replyMarkup: "replyKeyboard" → buttons don't appear
- JSON in additionalFields → doesn't work
- Various parameter formats → all fail
**Solution:** Use HTTP Request instead:
```javascript
{
  "method": "POST",
  "url": "https://api.telegram.org/bot<TOKEN>/sendMessage",
  "authentication": "none",
  "jsonBody": "={{ JSON.stringify({
    chat_id: $node['Telegram Trigger'].json.message.chat.id,
    text: 'Choose:',
    reply_markup: {
      keyboard: [[{text: 'Button 1'}, {text: 'Button 2'}]],
      resize_keyboard: true
    }
  }) }}"
}
```
**Prevention:**
- Reply Keyboard → HTTP Request (not Telegram node)
- Inline Keyboard → Telegram node works fine
**Tags:** #telegram #reply-keyboard #http-request #critical

### [2025-12-17 12:00] L-101: Credential expression in URL not resolved
**Problem:** {{ $credentials.telegramApi.accessToken }} in URL → 404
**Tried:** Credential expression in URL field → token missing
**Solution:**
- Option 1: Hardcode token for testing
- Option 2: Use Generic Credential Type
- Option 3: Pass token in body/headers (not URL)
**Prevention:** Avoid $credentials in URL field
**Tags:** #http-request #credentials #telegram

---

## AI Agent

### [2025-12-17 12:00] L-098: AI Memory caches data queries
**Problem:** AI returns cached answer instead of calling tools
**Tried:** Asked same question twice → got stale cached data
**Solution:** Add to System Prompt:
```markdown
## DATA RETRIEVAL RULES (CRITICAL!)

ALWAYS call tools for data queries. NEVER answer from memory!

- User asks "What did I eat?" → MUST call search tool
- User asks for report → MUST call get_summary tool

Memory = conversation context ONLY
Data source = Database via tools EVERY TIME
```
**Prevention:** Add DATA RETRIEVAL RULES to system prompt
**Tags:** #ai-agent #memory #caching #critical

---

## Common Gotchas

### [2025-12-17 12:00] L-068: IF nodes don't pass binary data
**Problem:** Binary data (photos, files) lost after IF node
**Tried:** Route through IF → binary-dependent node fails
**Solution:** Add Code Node to restore binary:
```javascript
// Between IF and binary-dependent node
const source = $("Download Photo").first();
const current = $input.first().json;

return [{
  json: { ...current },
  binary: source.binary  // Restore from source!
}];
```
**Prevention:** After IF → Code Node → Binary-dependent
**Tags:** #if-node #binary-data #code-node #critical

### [2025-12-17 12:00] L-102: Cascading changes - test after EACH change
**Problem:** Simple button change → 6 hours debugging
**Tried:**
- Changed 3 things at once
- Tested only at the end
- Merged architecture instead of minimal fix
**Solution:**
```
1. Full diagnosis FIRST (map architecture)
2. Create snapshot BEFORE changes
3. ONE change at a time
4. Test after EACH change
5. If 2+ failures → rollback, try different approach
```
**Prevention:**
- Simple UI change ≠ Simple architecture
- User frustration = STOP and rollback
- Prefer minimal fixes over architecture rewrites
**Tags:** #debugging #cascade #rollback #critical

### [2025-12-17 12:00] Cascading Parameter Changes
**Problem:** Changed one node → 5 downstream nodes broke
**Tried:** Renamed "user_id" → "userId" in Set node only
**Solution:**
```bash
# Step 1: Search ALL references first
grep -n "user_id" workflow.json
# Found: Code (3 refs), IF (1 ref), Supabase (1 ref)

# Step 2: Update ALL nodes simultaneously
# Step 3: Test end-to-end
```
**Prevention:** One parameter change = Multiple node updates
**Tags:** #refactoring #parameters #downstream

---

## Process Learnings

### [2025-12-17 12:00] Progressive Escalation - 7 cycle max
**Problem:** Stuck in loop 8+ cycles, 5 hours wasted
**Solution:**
| Cycles | Action | Success Rate |
|--------|--------|--------------|
| 1-3 | Direct fixes | 60% |
| 4-5 | Find alternative approach | 30% |
| 6-7 | Root cause diagnosis | 9% |
| 8+ | BLOCKED - ask user | 1% |

**Context Injection (cycles 2+):**
```
⚠️ ALREADY TRIED:
- Cycle 1: [what] → [result]
- Cycle 2: [what] → [result]
→ Need DIFFERENT approach!
```
**Prevention:** Hard cap at 7 cycles
**Tags:** #process #escalation #anti-loop

---

*Initial entries extracted from ClaudeN8N (82 learnings, 7,630 lines)*
*Add new learnings as problems are solved*
