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

**Total Entries:** 21 (15 initial + 6 new: L-004, L-005, L-006, L-007, L-008, L-009)
**Last Updated:** 2025-12-17 21:30

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

### [2025-12-17 19:15] IF Node connection without branch → node never executes (L-004)
**Problem:** Week Calculations Code node created and connected to IF node, but NEVER executes in workflow
**Tried:**
- Checked connection exists in structure → YES
- Verified node not disabled → YES
- Checked IF node outputs TRUE → YES
**Root Cause:** Connection from IF node missing `branch` parameter → n8n ignores connection
**Solution:**
```javascript
// Remove old connection without branch
{type: "removeConnection", source: "if-node-id", target: "target-id",
 sourcePort: "main", targetPort: "main"}
// Add new connection WITH branch
{type: "addConnection", source: "if-node-id", target: "target-id",
 sourcePort: "main", targetPort: "main", branch: "true"}
```
**Evidence:** After adding branch="true", node executed successfully in trace
**Prevention:** When adding connection to IF node output, ALWAYS include branch parameter
**Impact:** HIGH - node silently ignored without error, hard to debug
**Tags:** #if-node #branch #connections #silent-failure #debugging
**Reference:** FoodTracker /week fix 2025-12-17

### [2025-12-17 19:50] Switch Node: reorder conditions = must update connections! (L-006)
**Problem:** Voice messages fail after reordering Switch conditions (still broken!)
**Context:** Reordered Switch rules array but forgot connections still point to OLD indexes
**Tried:**
- Attempt 1: Reordered rules (voice→8, photo→9, text→10) → ❌ Still broken!
- User reported: "не работает головой ввод" (voice input doesn't work)
**Root Cause:** Connections independent from conditions!
- Output 8 (NEW: voice rule) → still connected to "Process Text" (OLD target) ❌
- Output 9 (NEW: photo rule) → still connected to "Process Voice" (OLD target) ❌
- Output 10 (NEW: text rule) → still connected to "Process Photo" (OLD target) ❌
**Solution:** Reorder conditions + update connections in ONE batch:
```javascript
n8n_update_partial_workflow({
  operations: [
    // Step 1: Reorder rules
    {type: "updateNode", nodeId: "switch-id",
     updates: {"parameters.rules": {values: [/* reordered */]}}},

    // Step 2: Remove old connections
    {type: "removeConnection", source: "Switch", target: "Process Text"},
    {type: "removeConnection", source: "Switch", target: "Process Voice"},
    {type: "removeConnection", source: "Switch", target: "Process Photo"},

    // Step 3: Add NEW connections with case parameter
    {type: "addConnection", source: "Switch", target: "Process Voice", case: 8},
    {type: "addConnection", source: "Switch", target: "Process Photo", case: 9},
    {type: "addConnection", source: "Switch", target: "Process Text", case: 10}
  ]
})
```
**Prevention:**
- ⚠️ CRITICAL: Switch conditions and connections are SEPARATE!
- Reordering rules does NOT update connections automatically
- ALWAYS batch: reorder + remove old + add new (3 operations minimum)
- Use `case` parameter to explicitly specify output index
**Best Practice:**
1. Order conditions: specific → generic (voice/photo BEFORE text)
2. Telegram gotcha: voice messages have BOTH .voice AND .text fields
3. When reordering: ONE operation with all changes (atomic!)
**Tags:** #switch-node #routing #connections #reordering #critical #telegram
**Reference:** FoodTracker voice input fix 2025-12-17 (2 attempts)

### [2025-12-17 20:00] Switch evaluates ALL conditions sequentially - non-existent fields throw errors! (L-007)
**Problem:** Voice input STILL fails after reordering conditions AND connections (3rd attempt!)
**Context:** Fixed connection routing (L-006), but voice messages STILL don't work
**User reported:** "не работает" → told me to check executions myself
**Investigation:**
- Execution 34125: Voice message → Switch node FAILED
- Error: `"Conversion error: the string '' can't be converted to an object [condition 0, item 0]"`
- Voice message data: Has `.voice` object but NO `.text` field
- Condition 0 was checking `/start` command: `$json.message.text === "/start"`
**Root Cause:** Switch evaluates conditions SEQUENTIALLY from position 0
- Telegram voice messages: Have `.voice` object, NO `.text` field
- Command checks (positions 0-7): ALL try to access `$json.message.text`
- Switch tries to evaluate condition 0 → accesses non-existent `.text` → throws error
- Never reaches voice check at position 8!
**Solution:** Voice/photo checks MUST be FIRST (positions 0-1):
```javascript
// CORRECT order for Telegram workflows:
{
  "parameters.rules": {
    "values": [
      // Position 0: Voice check (NO .text access)
      {conditions: [{leftValue: "={{ $json.message.voice }}", operator: "exists"}], outputKey: "voice"},

      // Position 1: Photo check (NO .text access)
      {conditions: [{leftValue: "={{ $json.message.photo }}", operator: "exists"}], outputKey: "photo"},

      // Positions 2-9: Command checks (safe - voice/photo already handled)
      {conditions: [{leftValue: "={{ $json.message.text }}", rightValue: "/start", operator: "equals"}]},

      // Position 10: Generic text check (fallback)
      {conditions: [{leftValue: "={{ $json.message.text }}", operator: "exists"}], outputKey: "text"}
    ]
  }
}
```
**Critical Insight:**
- ⚠️ Switch doesn't skip non-matching conditions - it EVALUATES ALL expressions
- If expression accesses non-existent field → error thrown BEFORE correct condition is reached
- Order matters for BOTH correctness AND error prevention!
**Prevention:**
1. **Telegram workflows:** Voice/photo checks FIRST (positions 0-1)
2. **General rule:** Checks that DON'T access `.text` BEFORE checks that DO
3. **Test edge cases:** Voice messages, photos, stickers (may have different fields)
**Why this is insidious:**
- Error message misleading: "condition 0" suggests command check logic is wrong
- Actually: Command check is correct, but evaluated on WRONG message type
- Silent assumption: "Switch will skip to matching condition" → FALSE!
**Tags:** #switch-node #sequential-evaluation #expression-errors #telegram #voice-input #critical #debugging
**Reference:** FoodTracker voice input fix 2025-12-17 (3 attempts, cycle 3)

### [2025-12-17 21:00] Switch Node: Duplicate connections cause wrong routing (L-008)

**Problem:** Voice input fails even after fixing conditions (L-006) AND sequential evaluation (L-007)
**Context:** After 6 debug cycles over ~30 minutes, voice messages STILL routed to wrong handler

**User frustration:** "бот молчит" (bot is silent) → workflow executes but no response

**Investigation (cycle 6 - breakthrough):**
- Checked execution 34128: Switch status = "success" ✅
- BUT workflow routed to "Simple Reply" instead of "Process Voice" ❌
- Retrieved workflow structure with `n8n_get_workflow(mode='structure')`
- FOUND THE ROOT CAUSE:

```json
"Switch": {
  "main": [
    [  // Output 0 - DUPLICATE connections!
      {"node": "Simple Reply", "type": "main", "index": 0},      // FIRST - executed
      {"node": "Process Voice", "type": "main", "index": 0}      // SECOND - ignored
    ]
  ]
}
```

**Root Cause:** Output had ARRAY of connections - workflow followed FIRST one
- Previous fix attempts used `addConnection` without removing old connections
- Each fix added NEW connection without cleaning up duplicates
- Output 0 accumulated: ["Simple Reply", "Process Voice"]
- n8n always executes FIRST connection in array

**Why This Happened:**
- Cycle 1-3: Reordered conditions → added new connections → duplicates created
- Cycle 4-5: Changed operators → kept adding connections → more duplicates
- Cycle 6: Finally checked workflow structure → discovered array of connections

**Solution:** Remove ALL connections first, then re-add correct ones
```javascript
// Step 1: Remove duplicates using continueOnError
n8n_update_partial_workflow({
  id: "workflow-id",
  continueOnError: true,  // Apply valid operations even if some fail
  operations: [
    // Remove ALL Switch → Simple Reply connections (clears duplicates)
    {type: "removeConnection", source: "Switch", target: "Simple Reply",
     sourcePort: "main", targetPort: "main", case: 0}
  ]
})

// Step 2: Re-add ONLY correct connections
n8n_update_partial_workflow({
  operations: [
    // Output 0 → Process Voice (single connection)
    {type: "addConnection", source: "Switch", target: "Process Voice",
     sourcePort: "main", targetPort: "main", case: 0},

    // Output 1 → Process Photo (single connection)
    {type: "addConnection", source: "Switch", target: "Process Photo",
     sourcePort: "main", targetPort: "main", case: 1}
  ]
})
```

**removeConnection Behavior (CRITICAL):**
- WITHOUT `case`: Removes ALL connections from source→target (all outputs)
- WITH `case`: Removes connection from specific output only
- If multiple connections exist at same output, removes ONE at a time

**Detection Methods:**
1. **Workflow structure check:**
```javascript
n8n_get_workflow({id: "workflow-id", mode: "structure"})
// Look for arrays with multiple objects at same output index
```

2. **Execution trace analysis:**
- Switch node shows "success" status
- Correct output index (e.g., output[0])
- BUT wrong node executes next
- → Indicates duplicate connections

3. **Validation warnings:**
- May show no warnings (duplicates are valid!)
- Need manual structure inspection

**Prevention:**
1. **Before adding connection:** Check current state with mode='structure'
2. **When changing routing:** ALWAYS remove old connection first
3. **Batch operations:** Use single update with remove + add operations
4. **After connection changes:** Verify with structure check
5. **One output → one target:** Unless intentional parallel routing

**Best Practice Pattern:**
```javascript
// CORRECT: Remove old, add new in one batch
n8n_update_partial_workflow({
  operations: [
    {type: "removeConnection", ...},  // Remove old
    {type: "addConnection", ...}      // Add new
  ]
})

// WRONG: Just add without removing
n8n_update_partial_workflow({
  operations: [
    {type: "addConnection", ...}  // Creates duplicate!
  ]
})
```

**Verification:**
- Execution 34129 after fix: Switch → Process Voice ✅
- Transcription worked: "200 грамм курицы" ✅
- AI Agent received data ✅
- Routing confirmed WORKING!

**Why This is Insidious:**
- No error messages - duplicates are valid workflow structure
- Switch node reports "success" - logic worked correctly
- Only symptom: Wrong node executes (first connection wins)
- Misleading: Looks like Switch logic issue, actually connection issue
- Hard to debug: Need to inspect workflow structure, not just execution

**Key Insight:** Switch logic can be PERFECT but routing still fails due to duplicate connections. Always verify BOTH conditions AND connections structure.

**Impact:** HIGH - Causes silent routing failures, very hard to debug without structure inspection
**Time to Discover:** 6 cycles, ~30 minutes (after fixing L-006 and L-007)
**Tags:** #switch-node #connections #duplicate #routing #debugging #critical #structure-inspection
**Reference:** FoodTracker voice input fix 2025-12-17 (cycles 1-6)
**Related:** L-006 (connection updates), L-007 (sequential evaluation)

### [2025-12-17 19:15] Code Node variables must come from $input, not globals (L-005)
**Problem:** Code node fails with "variable is not defined" errors
**Context:** Updated Inject Context node code - added new logic
**Errors encountered:**
- "user is not defined" → tried using `user?.timezone` without defining user
- "telegram_user_id is not defined" → tried using variable without reading from input
**Tried:**
- Assuming variables available globally → FAILED
- Using variables from context without declaration → FAILED
**Solution:** Always explicitly read data from sources:
```javascript
// Read from previous node output
const inputData = $input.first().json;
const telegram_user_id = inputData.telegram_user_id;
const user_message = inputData.data || inputData.original_message;

// Read from other nodes by name
const user = $('Check User').first().json;
const userData = $('Other Node').first().json;
```
**Prevention:**
- NEVER assume variables exist globally
- ALWAYS explicitly declare and read from $input or $('Node Name')
- Code nodes are isolated - only $input, $(), $json, $node available
**Tags:** #code-node #variables #input #context #scope
**Reference:** FoodTracker Inject Context fix 2025-12-17

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

### [2025-12-17 21:30] L-009: AI Agent tool optional parameters need nullable types (toolHttpRequest)
**Problem:** AI Agent fails with "Expected number, received null → at p_fiber"
**Context:** Tool has optional parameter marked with `valueProvider: "modelOptional"`, but schema doesn't allow null
**Symptom:** Workflow executes, AI Agent receives data, but fails when calling tool with optional parameters

**Investigation (execution 34129):**
- Voice routing: ✅ Works
- Transcription: ✅ Works
- AI Agent invocation: ✅ Works
- Tool call fails: ❌ Schema validation error

**Root Cause:**
```json
// WRONG: Optional parameter with strict type
{
  "name": "p_fiber",
  "valueProvider": "modelOptional",  // Marks as optional
  "description": "Fiber in grams (optional)",
  "type": "number"  // ❌ Doesn't accept null!
}
```

When AI Agent calls tool with null for optional parameter:
- Tool input: `{p_fiber: null, ...}`
- Schema expects: `type: "number"`
- Validation: FAIL - null is not a number

**Solution:**
```json
// CORRECT: Use array notation for nullable types
{
  "name": "p_fiber",
  "valueProvider": "modelOptional",
  "description": "Fiber in grams (optional)",
  "type": ["number", "null"]  // ✅ Accepts both number and null
}
```

**Fix via MCP:**
```javascript
n8n_update_partial_workflow({
  id: "workflow-id",
  operations: [{
    type: "updateNode",
    nodeId: "tool-node-id",
    updates: {
      "parameters.placeholderDefinitions.values": [
        // ... other parameters ...
        {"name": "p_fiber", "description": "...", "type": ["number", "null"]},
        {"name": "p_time", "description": "...", "type": ["string", "null"]}
      ]
    }
  }]
})
```

**Detection:**
1. Check execution logs for "Expected [type], received null"
2. Find parameter name in error message
3. Locate tool node (type: `@n8n/n8n-nodes-langchain.toolHttpRequest`)
4. Check `placeholderDefinitions.values` for parameter with single type

**Prevention:**
- For optional parameters (with `valueProvider: "modelOptional"`):
  - Use `"type": ["number", "null"]` for numeric parameters
  - Use `"type": ["string", "null"]` for string parameters
  - Use `"type": ["boolean", "null"]` for boolean parameters
- NEVER use single type (`"number"`, `"string"`) for optional parameters

**Important Note:**
This applies to `toolHttpRequest` nodes (AI Agent tools). Regular HTTP Request nodes use different parameter structure.

**Tags:** #ai-agent #tools #schema #validation #nullable #optional-parameters
**Time to Fix:** ~5 minutes (1 cycle)
**Related:** L-098 (AI Agent memory), validation errors

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
