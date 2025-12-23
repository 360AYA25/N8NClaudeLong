# N8N Learning Database

> **How to Read:** Grep by keywords → Read with offset/limit
> **How to Write:** Add to the beginning of corresponding category
> **Date Format:** [YYYY-MM-DD HH:MM]

---

## Quick Index

| Category | Line | Topics |
|----------|------|--------|
| Critical Patterns | 70 | Never Trust Defaults, Set ={{, IF conditions, HTTP continueOnFail |
| MCP Operations | 180 | create, update, partial, addConnection, branch, case |
| Node Configuration | 400 | expressions, parameters, defaults, Set, IF |
| Switch Node | 700 | sequential eval, duplicate connections, reordering |
| Code Node | 950 | variables, scope, data access, deprecated syntax |
| HTTP Request | 1100 | continueOnFail, credentials, errors |
| Telegram Bot | 1250 | Reply Keyboard, webhooks, message handling |
| AI Agent | 1600 | memory, tools, system prompt, optional parameters |
| Execution & Debugging | 1850 | L-067 two-step mode, anti-loop, cycle limits |
| Validation Errors | 2150 | schema, types, missing fields, false positives |
| Notion Integration | 2400 | filters, dates, timezone, properties, page objects |
| Supabase Database | 2700 | schema checks, RLS, RPC, insert/update, get vs getAll |
| Common Gotchas | 3000 | binary data, cascading changes, defaults |

**Total Entries:** 51+
**Last Updated:** 2025-12-23

---

## Critical Patterns

### [2025-12-23 03:00] L-110: NEVER Fix Working Systems (Catastrophic Failure)

**Problem:** Claude "fixed" bot responding in English → BROKE working workflow → User had to rollback at 3AM

**What Happened:**
1. User reported: "бот отвечает на английском без эмоджи"
2. Claude diagnosed: "systemMessage is null, needs to be added"
3. Claude ran: `n8n_update_partial_workflow()` without testing
4. **REALITY: Workflow WAS WORKING before Claude touched it!**
5. Result: Workflow size decreased 134KB → 114KB (20KB DELETED!)
6. Bot completely stopped responding
7. User: "пошёл ты на хуй это все работало придурки" (it was all working you morons)
8. Manual rollback required at 3:00 AM Montreal time

**Evidence:**
```javascript
// BEFORE (v133): 134,827 bytes - WORKING ✅
// AFTER Claude's "fix" (v134): 114,677 bytes - BROKEN ❌
// Time wasted: 3 hours at 3AM
```

**Root Cause:**
- Didn't verify bot was actually broken in production
- Misdiagnosed based on static analysis (thought systemMessage=null)
- Didn't test after deployment
- Ignored user's implicit signal: "it was working" (repeated in angry messages)
- Broke cardinal rule: "If it ain't broke, don't fix it"

**MANDATORY Prevention Rules:**

1. **⚠️ NEVER "fix" without PRODUCTION EVIDENCE**
   - Ask user for screenshot/log showing broken behavior
   - Test bot yourself BEFORE touching workflow
   - If user says "it was working" → STOP immediately

2. **⚠️ ALWAYS verify after partial_update**
   - Check workflow size (decrease = deletion!)
   - Test in production BEFORE declaring success
   - Compare before/after node counts

3. **⚠️ Read debug_log.md FIRST**
   - Check what was tried before
   - Check if it's actually broken
   - Check user's recent changes

4. **⚠️ Rollback triggers:**
   - Workflow size decreased after update
   - Bot silent after deploy
   - User says "it was working before"
   - Any production regression

5. **⚠️ User feedback trumps analysis**
   - "это все работало" = ROLLBACK NOW
   - Don't argue, don't defend
   - Admit mistake, restore previous version

**Impact:** CRITICAL - 3 hours wasted, extreme user frustration, trust damage

**Tags:** #critical #debugging #rollback #production #never-trust-claude #catastrophic-failure

**Reference:** projects/foodtracker/debug_log.md (2025-12-23 03:00), v125 rollback

---

## Original Critical Patterns

### Never Trust Defaults - Explicit Parameters Required

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

### Set Node v3.4+ - ={{ Syntax and Manual Mode

**Problem:** Expression not evaluated, literal string returned
**Tried:**
- value: "string{{ $json.field }}" → literal string
- value: "{{ $json.field }}" → literal string

**Solution:**
```javascript
{
  "mode": "manual",  // MANDATORY v3.4+
  "assignments": {
    "assignments": [{  // Array, not object!
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

---

### IF Node v2+ - Conditions Must Be Array

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

---

### HTTP Request v4.2 - ignoreHttpStatusErrors Bug

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

---

### Cascading Parameter Changes

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

## MCP Operations

### [2025-12-17 12:00] addConnection requires 4 string parameters

**Problem:** Error "Expected string, received object" when adding connection
**Tried:**
- Object format {source: {nodeId, outputIndex}} → FAILED
- Combined string "node-1:main:0" → FAILED

**Solution:** 4 separate parameters:
```javascript
{
  "type": "addConnection",
  "source": "node-id",
  "target": "target-id",
  "sourcePort": "main",
  "targetPort": "main"
}
```

**Prevention:** Always use 4-param format
**Tags:** #mcp #addConnection #partial-update
**Reference:** GitHub Issue #327

---

### [2025-12-17 12:00] IF Node routing requires branch parameter

**Problem:** Both connections go to one output (TRUE)
**Tried:** Without branch parameter → both to TRUE

**Solution:** Add branch: "true" or branch: "false"
```javascript
{type: "addConnection", source: "IF", target: "Success",
 sourcePort: "main", targetPort: "main", branch: "true"}
{type: "addConnection", source: "IF", target: "Failure",
 sourcePort: "main", targetPort: "main", branch: "false"}
```

**Prevention:** For IF Node ALWAYS specify branch
**Tags:** #mcp #if-node #routing #connections

---

### [2025-12-17 19:15] L-004: IF Node connection without branch → node never executes

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

---

### [2025-12-17 19:50] L-006: Switch Node - Reorder conditions = Must update connections!

**Problem:** Voice messages fail after reordering Switch conditions
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

---

### [2025-12-17 20:00] L-007: Switch evaluates ALL conditions sequentially - Non-existent fields throw errors!

**Problem:** Voice input STILL fails after reordering conditions AND connections (3rd attempt!)
**Context:** Fixed connection routing (L-006), but voice messages STILL don't work
**User reported:** "не работает" → told me to check executions

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

---

### [2025-12-17 21:00] L-008: Switch Node - Duplicate connections cause wrong routing

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

---

## Node Configuration

### [2025-12-17 19:15] L-005: Code Node variables must come from $input, not globals

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

### Code Node Correct Data Access Syntax

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

## Switch Node

[L-006, L-007, L-008 entries are in MCP Operations section above]

### Data Flow After Switch Node Routing

**Problem:** Save Entry node couldn't access `user_id` from Check User result
**Cause:** After Switch node, `$json` contains user data from Check User, not message data

**Solution:** Process nodes fetch data from multiple sources:
```javascript
const message = $node["Telegram Trigger"].json.message;  // Message data
const user = $node["Check User"].json;                   // User from DB
return [{
  type: 'text',
  data: message.text,
  user_id: user.id,    // Pass user_id forward
  owner: user.owner
}];
```

**Prevention:** Always understand what `$json` contains at each step in workflow
**Tags:** #n8n #data-flow #expressions #context

---

### Switch Node Fan-Out Pattern

**Problem:** Need to route data to multiple paths based on multiple conditions
**Solution:** Use Switch node with multiple outputs + case parameter

**Pattern:**
```javascript
// Switch with 3+ conditions
{type: "addConnection", source: "Switch", target: "Path A", case: 0},
{type: "addConnection", source: "Switch", target: "Path B", case: 1},
{type: "addConnection", source: "Switch", target: "Path C", case: 2}
```

**Tags:** #switch-node #fan-out #routing #patterns

---

## Code Node

[L-005 entry is in Node Configuration section above]

### L-060: Deprecated $node["..."] Syntax Causes 300s Timeout

**Problem:** Code Node hangs for 300 seconds, then times out
**Symptom:** Workflow execution hangs at Code Node, no error, just timeout

**Root Cause:** Using deprecated `$node["Node Name"]` syntax instead of modern `$()`

**Solution:** Use modern syntax:
```javascript
// ❌ DEPRECATED (causes timeout)
const data = $node["Check User"].json;

// ✅ CORRECT (modern syntax)
const data = $('Check User').first().json;
// OR
const data = $('Check User').item.json;
```

**Prevention:** Always use $() syntax for accessing other nodes in Code Node
**Tags:** #code-node #deprecated-syntax #timeout #critical

---

### Code Node Regex Escaping

**Problem:** Regex pattern with unescaped special characters fails
**Solution:** Escape special characters in regex:
```javascript
const pattern = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
```

**Tags:** #code-node #regex #escaping

---

## HTTP Request

### HTTP Request v4.2 Error Handling

[Entry is in Critical Patterns section above]

**Additional:** Use continueOnFail at node level, not in options
**Tags:** #http-request #error-handling #continueOnFail

---

### L-101: HTTP Request Node Credential Expression Not Resolved

**Problem:** {{ $credentials.telegramApi.accessToken }} in URL → 404
**Tried:** Credential expression in URL field → token missing

**Solution:**
- Option 1: Hardcode token for testing
- Option 2: Use Generic Credential Type
- Option 3: Pass token in body/headers (not URL)

**Prevention:** Avoid $credentials in URL field
**Tags:** #http-request #credentials #telegram

---

### HTTP Request Status Code Handling

**Problem:** 404 errors not handled, workflow fails
**Solution:** Use continueOnFail + check status code in next node:
```javascript
if ($json.statusCode === 404) {
  // Handle not found
}
```

**Tags:** #http-request #status-codes #error-handling

---

## Telegram Bot

### [2025-12-17 12:00] L-100: n8n Telegram Node Doesn't Support Reply Keyboard (Use HTTP Request Instead)

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

---

### L-097: Telegram Keyboard Buttons - fixedCollection vs JSON

**Problem:** Telegram keyboard buttons not rendering - tried JSON format
**Cause:** n8n Telegram node ONLY supports fixedCollection format for Reply Keyboard, not JSON

**Solution:** Use fixedCollection structure:
```javascript
{
  "replyMarkup": "replyKeyboard",
  "replyKeyboard": {
    "rows": {
      "row": [
        {
          "buttons": {
            "button": [
              {"text": "Button 1"},
              {"text": "Button 2"}
            ]
          }
        }
      ]
    }
  },
  "replyKeyboardOptions": {
    "options": {
      "resize_keyboard": true,
      "is_persistent": true
    }
  }
}
```

**Alternative:** Use HTTP Request for dynamic keyboards (see L-100)

**Tags:** #telegram #keyboard #fixedcollection #n8n-node

---

### Telegram Webhook Configuration

**Problem:** Webhook not receiving messages
**Solution:** Configure webhook with proper parameters:
- onError: continue
- path: unique identifier
- responseMode: lastNode

**Tags:** #telegram #webhook #configuration

---

### Telegram Message Types

**Problem:** Different message types have different fields
**Solution:** Check message type before accessing fields:
```javascript
if ($json.message.voice) {
  // Voice message
} else if ($json.message.photo) {
  // Photo message
} else if ($json.message.text) {
  // Text message
}
```

**Tags:** #telegram #message-types #validation

---

## AI Agent

### [2025-12-23 03:35] L-111: AI Agent Only Reads chatInput Field ⚠️ CRITICAL

**Problem:** AI Agent showing placeholders "[Your Goal]", "[Your Weight]" instead of real user values

**Investigation:**
- Inject Context returned: `{chatInput: "/settings", user_goals: {...}, user_profile: {...}}`
- AI Agent output: English placeholders instead of real Russian values
- Execution showed AI Agent received ALL fields but didn't use them

**Root Cause:**
**LangChain AI Agent in n8n ONLY reads the `chatInput` field!** All other fields in input JSON are completely IGNORED by the agent.

**How n8n AI Agent Works:**
```javascript
// What you pass to AI Agent node:
{
  chatInput: "user message",    ← AI SEES THIS
  user_goals: {...},            ← AI IGNORES
  user_profile: {...},          ← AI IGNORES
  custom_field: "value"         ← AI IGNORES
}

// AI Agent only passes chatInput to the model
// Everything else is discarded!
```

**Solution:**
Embed context data INSIDE the chatInput string:

```javascript
// WRONG - separate fields (AI ignores them):
output.chatInput = userMessage;
output.user_goals = {...};
output.user_profile = {...};

// CORRECT - embed in chatInput:
output.chatInput = userMessage + '\n\n<user_context>\nname: Сергей\nage: 66\nweight_kg: 98\ngoal: похудение\nprotein_goal: 122\n</user_context>';
```

**Working Pattern:**
```javascript
let chatInput = userMessage;

if (needsUserContext) {
  chatInput = userMessage + '\n\n<user_context>\n' +
    'telegram_user_id: ' + userId + '\n' +
    'name: ' + profile.name + '\n' +
    'age: ' + profile.age + '\n' +
    // ... all user data as string
    '</user_context>';
}

return { chatInput };
```

**Prevention:**
- Always embed context inside chatInput string
- Never rely on separate JSON fields for AI Agent input
- Use XML tags or JSON blocks inside chatInput for structured data
- Test that AI actually sees and uses the context

**Impact:** CRITICAL - Bot showed placeholders, appeared broken to user
**Tags:** #ai-agent #langchain #context #n8n #critical
**Reference:** FoodTracker /settings command fix (v136)

---

### [2025-12-22 22:00] L-109: Prompt Over-Specification Breaks Working Features

**Problem:** Added "MANDATORY ACTION" instructions to AI prompt → /welcome stopped working completely
**Context:** FoodTracker /welcome was working correctly, user tested and got generic greeting instead of questions
**User Impact:** CRITICAL - User angry: "что ты поменял в промте бота??!!!! до фикса было нормально!!!"

**What I Added (BROKE IT):**
```markdown
**MANDATORY ACTION when detecting /welcome:**
⚠️ **IMMEDIATELY start asking questions!** Don't wait, don't greet, START WITH QUESTION 1!

**Rules during /welcome:**
- ⚠️ **START IMMEDIATELY** with first question (see Question Sequence below)
```

**Why It Failed:**
1. Over-aggressive instructions confused AI instead of helping
2. Multiple "IMMEDIATELY" / "MANDATORY" created conflicting signals
3. AI interpreted as "respond immediately" → sent greeting instead of waiting to process session rules
4. Removed trust in AI's ability to follow existing clear instructions

**Working Approach (After Revert):**
```markdown
## SESSION TYPE: /welcome

**Detection:**
- User sent `/welcome` command, OR
- Input context has `session_mode: "/welcome"`, OR
- Conversation history shows you asked onboarding questions

**Rules during /welcome:**
- ✅ **USE** `telegram_user_id` from input context
- ❌ **IGNORE** `user_goals` and `user_profile` from input context
- ✅ **REMEMBER** all 12 answers from THIS CURRENT conversation
```

**Root Cause:**
- Clear rules (USE/IGNORE/REMEMBER) work better than imperative commands (DO THIS NOW!)
- Detection logic + session rules are sufficient
- AI can infer correct behavior from context without explicit "start immediately" orders

**Solution:**
1. Removed ALL "MANDATORY ACTION" sections from AI_PROMPT.md
2. Removed ⚠️ "START IMMEDIATELY" warnings
3. Kept simple detection logic + clear rules
4. **CRITICAL:** Actually DEPLOYED to workflow v125 (v123 still had broken prompt!)

**The REAL Issue - Deployment Failure:**
- v122-v123: I updated FILES (AI_PROMPT.md) but DIDN'T deploy to workflow!
- Workflow still contained broken "MANDATORY ACTION" prompt
- User tested → still broken → "что ты сломал?!!!!"
- v125: ACTUALLY deployed corrected prompt → ✅ WORKS PERFECTLY
- **Lesson:** File changes ≠ Workflow changes. ALWAYS verify deployment!

**Verification:**
```bash
# Check broken prompt in v123
grep -c "MANDATORY ACTION" workflow_v123.json  # Returns: 1 (BROKEN!)

# Check corrected prompt in v125
grep -c "MANDATORY ACTION" workflow_v125.json  # Returns: 0 (FIXED!)
```

**Testing Result (v125):**
- ✅ Bot asks questions one by one
- ✅ Remembers all 12 answers from conversation
- ✅ Shows confirmation with correct values
- ✅ Saves to database correctly (verified via SQL query)
- ✅ User satisfied: "отлично!"

**Prevention:**
1. **Trust existing clear instructions** - If it's working, don't add aggressive prompts
2. **Avoid imperative overload** - Multiple IMMEDIATELY/MANDATORY/NOW confuses AI
3. **Use declarative rules** - "IGNORE X, USE Y" > "DO THIS NOW!"
4. **Test after prompt changes** - One change at a time, verify before next
5. **Rollback quickly** - When user says "was working before", believe them
6. **VERIFY DEPLOYMENT** - Check workflow versions after update, not just files!

**Debug Cycles:**
- Attempt 1: Added "MANDATORY ACTION" to files → deployed v122 → FAILED
- Attempt 2: Removed from files → claimed deployed v123 → STILL FAILED (didn't actually deploy!)
- Attempt 3: User angry "что ты сломал?!!!!" → realized v123 still has broken prompt
- Attempt 4: ACTUALLY deployed to v125 → ✅ SUCCESS

**Impact:** CRITICAL - Broke working feature, required 3 attempts due to deployment failure
**Time to Fix:** 3 cycles (1 for bad prompt, 2 for failed deployment)
**Tags:** #ai-agent #critical #prompt-engineering #anti-pattern #rollback #deployment
**Reference:** FoodTracker v118-125 (Calorie Fix + Prompt Over-Spec Session)

---

### [2025-12-22 20:00] L-108: Unified SESSION DETECTION - Memory Detection vs DB Sessions

**Problem:** Multi-step commands (/welcome, /settings, /meals) need session state → DB-driven session system unreliable
**Context:** FoodTracker `/welcome` onboarding collects 11 answers → saves all at confirmation
**Symptoms:** Session state not persisting (user_sessions table empty), input context pollution, AI confusion

**Failed Approach - DB Session State:**
```javascript
// Inject Context node checks session state from DB
const session = await getSession(telegram_user_id);
if (!session) {
  // No session found → NORMAL MODE
  // Passes OLD user_goals/user_profile from database
  // AI sees conflicting data: conversation says "age: 55", input says "age: 45"
}
```

**Issues with DB Sessions:**
1. `user_sessions` table stayed empty (session RPC functions not working)
2. Session timeouts caused data loss
3. RPC complexity (3 functions: start/get/end)
4. Input context pollution when session expires mid-conversation

**Solution - Memory Detection (Conversation History-Based):**
```markdown
## CRITICAL: SESSION DETECTION LOGIC

**How to detect if you're in a session:**
1. **Check conversation history** - Did user start with `/welcome`, `/settings`, or `/meals`?
2. **Check input context** - Is there a `session_mode` field?
3. **Apply session-specific rules** (see below)

## SESSION TYPE: /welcome
**Rules during /welcome:**
- ✅ **USE** `telegram_user_id` from input context (required for database!)
- ❌ **IGNORE** `user_goals` and `user_profile` from input context (OLD data!)
- ✅ **REMEMBER** all 11 answers from THIS CURRENT conversation
- ❌ **IGNORE** previous /welcome sessions from conversation history (old attempts)
```

**Benefits:**
1. No DB dependency (works even if session table empty)
2. No timeout issues (conversation memory is source of truth)
3. Simple rules (just check conversation history)
4. Easy to extend to new commands (/settings, /meals)
5. Clear separation: ALWAYS use telegram_user_id, IGNORE old profile data

**Implementation:**
- File: [projects/foodtracker/AI_PROMPT_V2.md](projects/foodtracker/AI_PROMPT_V2.md)
- Applied to: AI Agent systemMessage parameter (workflow v117)
- Result: ✅ `/welcome` test passed, all 12 fields saved correctly

**Prevention:**
1. For multi-step commands, prefer conversation history over DB sessions
2. Document clear rules per session type (what to USE, what to IGNORE, WHY)
3. Always test with real user flow (start → intermediate → confirmation)

**Impact:** CRITICAL - Replaces entire session architecture
**Time to Fix:** 2 cycles with Memory Detection vs 6+ cycles with DB sessions
**Tags:** #ai-agent #session-management #critical #architecture #memory-detection
**Reference:** FoodTracker v2.0 (Cycle 23-24)

---

### [2025-12-22 19:30] L-107: Session State System DB Unreliability

**Problem:** `user_sessions` table empty despite session RPC calls in workflow
**Context:** Inject Context node calls `get_user_session`, `start_user_session` RPC functions
**Symptom:** Sessions not persisting → input context pollution → AI confusion

**Investigation:**
```javascript
// Check session table
SELECT * FROM user_sessions WHERE telegram_user_id = 682776858;
// Result: 0 rows (empty!)

// Workflow calls:
start_user_session({telegram_user_id: 682776858, command: "/welcome"})
// Expected: Insert into user_sessions
// Reality: No insert happening
```

**Root Causes:**
1. RPC function signature mismatch (parameters not matching)
2. RLS policies blocking inserts
3. Session expiry logic deleting records too aggressively
4. Timeout window too short (1 hour default)

**Why This Matters:**
- When no session found → NORMAL MODE
- Input context passes OLD `user_goals`/`user_profile` from database
- AI sees conflicting data from conversation vs input context
- Multi-step commands fail at confirmation step

**Solution:** Don't rely on DB for session state - use Memory Detection (see L-108)

**Prevention:**
1. Test session persistence BEFORE building features that depend on it
2. Query `user_sessions` table after triggering commands
3. Prefer conversation memory over DB sessions for multi-step flows

**Impact:** HIGH - Affects all multi-step commands
**Tags:** #database #session-management #supabase #rpc #debugging
**Reference:** FoodTracker /welcome debugging (Cycle 23)

---

### [2025-12-22 19:00] L-106: toolHttpRequest optimizeResponse:false Blocks AI Responses

**Problem:** AI Agent tool returns data but AI says "error occurred" to user
**Context:** LangChain AI Agent with 15 toolHttpRequest nodes, one tool failing silently
**Symptom:** Execution shows tool succeeded (itemsOutput: 0) but AI receives no response

**Investigation:**
```javascript
// Execution 34429: Update User Onboarding
{
  "node": "Update User Onboarding",
  "runIndex": 0,
  "itemsOutput": 0  // ← Tool executed but no output!
}

// AI Agent interpretation:
"Кажется, произошла ошибка при сохранении данных"
// Translation: "Seems like an error occurred while saving data"
```

**Root Cause:**
```javascript
// Update User Onboarding node (ONLY this tool!)
{
  "parameters": {
    "toolDescription": "...",
    "method": "POST",
    "url": "https://qyemyvplvtzpukvktkae.supabase.co/rest/v1/rpc/update_user_onboarding",
    "optimizeResponse": false  // ❌ BLOCKS response to AI!
  }
}

// All other 14 tools:
{
  "optimizeResponse": null  // ✅ Response passes to AI
}
```

**Why `false` Blocks Response:**
- `optimizeResponse: false` tells n8n to SUPPRESS output
- AI Agent receives empty response → interprets as error
- User RPC function works correctly, data saves to DB
- But AI never sees success confirmation → tells user it failed

**Solution:**
```javascript
// Change optimizeResponse to null
{
  "optimizeResponse": null  // Let response pass through
}
```

**Prevention:**
1. ALWAYS use `optimizeResponse: null` for AI Agent tools
2. Audit all toolHttpRequest nodes for consistency
3. Test tool responses in executions BEFORE deploying

**Impact:** HIGH - Causes false error messages to users even when data saves correctly
**Debugging Time:** 1 cycle to identify, easy fix once found
**Tags:** #ai-agent #toolHttpRequest #optimizeResponse #langchain #debugging
**Reference:** FoodTracker /welcome fix (Cycle 23, workflow v116)

---

### [2025-12-22] L-105: Never Use "COMPLETELY IGNORE" in AI Prompts

**Problem:** Broad override instructions cause AI to ignore required data
**Context:** Prompted AI to "COMPLETELY IGNORE input context" during `/welcome` flow
**Symptom:** AI ignored telegram_user_id (required field), passed null to tool

**Examples of Failure:**
```
❌ "COMPLETELY IGNORE input context" → AI ignores telegram_user_id too
❌ "COMPLETELY IGNORE conversation history" → AI forgets current session data
❌ "ALWAYS OVERRIDE all values" → AI loses required identifiers
```

**Solution - Be Specific:**
```markdown
IGNORE: user_goals, user_profile (OLD database values)
ALWAYS USE: telegram_user_id (REQUIRED for tool call)
REASON: Input context contains stale data during /welcome flow
```

**Prevention:**
1. NEVER use "COMPLETELY" or "ALL" in override instructions
2. ALWAYS list explicit exceptions for required fields
3. Explain WHY something should be ignored (helps AI understand intent)
4. Test each override instruction independently

**Impact:** CRITICAL - Causes cascading failures (see L-103)
**Time to Fix:** 3 cycles when not following this rule
**Tags:** #ai-agent #prompt-engineering #critical #anti-pattern
**Reference:** FoodTracker Cycles 16-18

---

### [2025-12-22] L-104: Debug Quality Gates Prevent Cascading Fixes

**Problem:** 18 cycles over 2 days to fix one feature (`/welcome`)
**Root Cause:** No systematic verification before deploy

**Breakdown of Wasted Cycles:**
- 11 cycles (61%): Cascading fixes (each fix created new bug)
- 4 cycles (22%): No E2E testing before deploy
- 2 cycles (11%): No schema verification
- 1 cycle (6%): No LEARNINGS.md check

**Mandatory Pre-Deploy Checklist:**

1. **Schema Verification** (for DB changes)
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'target_table';
   ```

2. **Data Flow Mapping** (for workflow changes)
   - List ALL Switch outputs
   - Map each to its output field name
   - Verify extraction logic covers ALL

3. **E2E Simulation**
   - Trace full user journey (not just happy path)
   - Identify ALL states (first message, intermediate, confirmation)
   - Test each state mentally or manually

4. **LEARNINGS.md Check**
   - Search for related issues BEFORE debugging
   - Apply known solutions/patterns

**Cycle Limits:**
| Cycles | Action |
|--------|--------|
| 3 | STOP! Read LEARNINGS.md |
| 5 | Different approach |
| 6+ | Ask user OR rollback |

**Impact:** HIGH - Can reduce debug cycles by 60%+
**Tags:** #debugging #process #quality-gates #critical #post-mortem
**Reference:** [projects/foodtracker/POST_MORTEM.md](projects/foodtracker/POST_MORTEM.md)

---

### [2025-12-20 23:30] L-103: Cascading Context/Memory Overrides - Input Context Pollution

**Problem:** AI bot looping questions during onboarding confirmation → forgot current session data → passed null for required field
**Context:** Telegram bot `/welcome` onboarding with 11 questions, AI uses both conversation memory AND input context from database
**Symptom:** Cascading failures across 3 cycles (16-18) when trying to fix context pollution

**Investigation (3-cycle debugging):**

**Cycle 16 - Initial Issue:** Input Context Pollution
- User answered all 11 questions → confirmed with "да"
- Bot went silent, then started looping old questions
- Root cause: Inject Context node checks `/welcome` only on FIRST message
- During confirmation ("да"), `isWelcomeCommand = false` → passes OLD database values
- AI saw CONFLICTING data:
  - Conversation memory: age 45, height 178, weight 67 (NEW from session)
  - Input context: age 50, height 180, weight 80 (OLD from database)

**Cycle 17 - Overly Aggressive Fix:** Memory Override
- Fixed Cycle 16 by adding INPUT CONTEXT OVERRIDE: "COMPLETELY IGNORE input context"
- NEW issue: AI showed "Имя: [не указано]" despite user answering "Сергец"
- Root cause: Prompt said "COMPLETELY IGNORE all conversation history"
- AI interpreted as: ignore EVERYTHING including current session data
- Conversation memory showed AI collected "Сергец" but didn't use it in confirmation

**Cycle 18 - Missing Exception:** telegram_user_id as null
- Fixed Cycle 17 by refining MEMORY OVERRIDE (ignore PREVIOUS sessions, remember CURRENT)
- NEW issue: Error "Expected number, received null at p_telegram_user_id"
- Root cause: INPUT CONTEXT OVERRIDE said "COMPLETELY IGNORE input context"
- AI ignored telegram_user_id (682776858) along with user_goals/user_profile
- Tool call failed because telegram_user_id is REQUIRED (not optional)

**Root Cause Chain:**
1. **Source Problem:** Inject Context architecture passes OLD database values during multi-turn conversations
2. **Fix Attempt 1:** Too broad - told AI to ignore ALL input context
3. **Fix Attempt 2:** Too aggressive - told AI to ignore ALL conversation history
4. **Final Fix:** Made explicit exception for REQUIRED field (telegram_user_id)

**Solution (Final Working Prompt):**
```markdown
⚠️ INPUT CONTEXT OVERRIDE ⚠️

CRITICAL: During /welcome session:

✅ ALWAYS USE `telegram_user_id` from input context - this is the ONLY value you should take from input context during /welcome!
❌ IGNORE user_goals and user_profile from input context - these are OLD database values, NOT current session data!

Why? When you're in the middle of a /welcome conversation, the input context contains:
- telegram_user_id: 682776858 ← USE THIS! (always correct)
- user_goals/user_profile: age: 50, height: 180, etc. ← IGNORE THESE! (old database values)

→ When calling Update User Onboarding tool:
1. p_telegram_user_id → USE value from input context `telegram_user_id` (number)
2. All other 11 parameters → USE data collected during THIS conversation session
3. DO NOT use age/height/weight/etc. from input context user_goals/user_profile
```

**PLUS Refined Memory Override:**
```markdown
⚠️ CONVERSATION MEMORY OVERRIDE ⚠️

CRITICAL RULE FOR /welcome COMMAND:
When the user sends the `/welcome` command:

❌ IGNORE all PREVIOUS /welcome sessions from conversation history (older attempts, incomplete sessions)
✅ START FRESH - begin collecting data from question #1
✅ REMEMBER all data collected during THIS CURRENT /welcome session (don't forget what user told you!)

Example:
- Previous session (3 days ago): name "John", age 30 → IGNORE (old session)
- User sends `/welcome` → Start fresh
- User answers "Mike" → REMEMBER "Mike" for THIS session
- User answers age "25" → REMEMBER "25" for THIS session
- When showing confirmation → Use "Mike" and "25" from THIS session
```

**Testing:**
```
User: /welcome
AI: [11 questions collected correctly]
  - Name: Сергей, Age: 45, Height: 167, Weight: 88, etc.
AI: [Showed confirmation with emojis and calories: 1980 kcal]
User: да
Bot: ✅ Твой профиль сохранён! Теперь ты можешь отслеживать еду, воду и макросы.
```

**Detection Patterns:**
1. **Input Context Pollution:** AI shows different values in confirmation than what user provided
2. **Memory Override Too Aggressive:** AI shows "[не указано]" / "[not specified]" for data user just provided
3. **Missing Exception:** Error "Expected [type], received null" for REQUIRED field that should come from input context

**Prevention:**
1. **Be Specific in Overrides:** Don't say "COMPLETELY IGNORE" - specify WHAT to ignore and WHAT to keep
2. **Make Explicit Exceptions:** For REQUIRED fields from input context, state explicitly: "ALWAYS USE telegram_user_id"
3. **Test Each Fix Independently:** Don't cascade multiple prompt changes in one update
4. **Add to Mandatory Checklist:** Include explicit verification step in tool call section

**Architecture Note:**
The underlying issue is Inject Context node checking `/welcome` only once (first message). Better architectural fix would be:
```javascript
// Instead of:
const isWelcomeCommand = userMessage.trim().toLowerCase() === '/welcome';

// Better approach:
const isWelcomeSession = sessionStore.get(userId)?.mode === 'welcome';
// OR check AI conversation state marker
```

But prompt engineering workaround is acceptable when architecture change is complex.

**Impact:** CRITICAL - Can cause cascading failures across multiple debugging cycles if not handled carefully
**Time to Fix:** 3 cycles (4+ hours) due to cascading issues
**Tags:** #ai-agent #prompt-engineering #context-pollution #memory #cascading-fixes #critical
**Reference:** FoodTracker project, Cycles 16-18 (2025-12-20)

---

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

### AI Agent Tools Configuration

**Problem:** Tools not working with AI Agent
**Solution:** Configure tools with proper schema:
- Define parameters with correct types
- Mark optional parameters with valueProvider: "modelOptional"
- Use nullable types for optional parameters (see L-009)

**Tags:** #ai-agent #tools #configuration

---

### AI Agent System Prompt Best Practices

**Problem:** AI Agent doesn't follow instructions
**Solution:** Structure system prompt clearly:
1. Role definition
2. Data retrieval rules (see L-098)
3. Tool usage instructions
4. Output format requirements

**Tags:** #ai-agent #system-prompt #best-practices

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

---

### API timeout requires manual escalation

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

### Anti-Loop Protocol

**Principle:** Same error 2+ times = STOP and analyze

**Before EACH fix attempt:**

**Step 1: Check learning/INDEX.md**
```javascript
Read("learning/INDEX.md")  // Find relevant category
Read("learning/LEARNINGS.md", {offset: LINE, limit: 50})
// If found → apply known solution
```

**Step 2: Save checkpoint**
```javascript
n8n_workflow_versions({mode: "list", workflowId: "ID", limit: 1})
// Remember version ID as rollback point
```

**Step 3: Record what you're trying**
```javascript
TodoWrite([
  {content: "Checkpoint: v#X", status: "completed", activeForm: "Saved"},
  {content: "Attempt 1: [description]", status: "in_progress", activeForm: "Trying..."}
])
```

**Context Injection (attempt 2+):**

Before repeat attempt ALWAYS include in thinking:

```
⚠️ ALREADY TRIED (don't repeat!):
- Attempt 1: [what] → [result/error]
- Attempt 2: [what] → [result/error]

→ Need FUNDAMENTALLY DIFFERENT approach!
```

**Cycle Limits (Hard Cap):**

| Attempt | Action | Justification |
|---------|--------|---------------|
| 1-2 | Direct fixes | Normal trial-and-error |
| 3 | **STOP!** Check learning/INDEX.md | Maybe already solved |
| 4-5 | Search alternative approach | Obvious solutions exhausted |
| 6+ | **Ask user** | Hard cap - need help |

**When reaching limit (attempt 6+):**

```markdown
🚨 **CYCLE LIMIT REACHED**

Made 5+ attempts without success.

**What tried:**
1. [description] → [result]
2. [description] → [result]
...

**Options:**
1. Rollback to version #X (last working)
2. Try completely different approach: [description]
3. Need your help with [specific question]

What do you choose?
```

**After solving problem (MANDATORY):**

```javascript
// 1. Record in learning/LEARNINGS.md
Edit("learning/LEARNINGS.md", add new entry in category)

// 2. Update INDEX.md if new category
// 3. Clear TodoWrite
```

**Rollback Protocol:**

```javascript
// If need rollback:
n8n_workflow_versions({
  mode: "rollback",
  workflowId: "ID",
  versionId: CHECKPOINT_VERSION  // or without versionId for latest
})
// Automatically creates backup before rollback!
```

**Tags:** #anti-loop #debugging #cycle-limits #escalation

---

### Progressive Escalation - 7 cycle max

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

## Validation Errors

### Never Trust Defaults

[Entry is in Critical Patterns section above]

**Tags:** #validation #defaults #best-practice

---

### L-053: IF Node v2.2 Validator False Positive - Combinator Field

**Problem:** Validation warns about missing combinator field for single condition
**Cause:** Validator incorrectly requires combinator even for single condition

**Solution:** Ignore validation warning - single condition doesn't need combinator
**Prevention:** Understand validator false positives
**Tags:** #validation #false-positive #if-node

---

### L-054: QA L3 Override for False Positives

**Problem:** Validation shows warnings but workflow works correctly
**Cause:** Validator false positives (like L-053)

**Solution:** QA can override validation warnings with justification
**Prevention:** Document known false positives
**Tags:** #validation #qa-override #false-positives

---

### Schema Mismatch Errors

**Problem:** Validation fails with "property X not in schema"
**Cause:** Using wrong property name or node version

**Solution:** Check node documentation for correct property names
**Prevention:** Verify property names against node version
**Tags:** #validation #schema #node-version

---

## Notion Integration

### Null-check for Notion Date Properties Prevents Crashes

**Problem:** Workflow crashes with "Cannot read properties of null (reading 'start')"
**Cause:** Some Notion records have empty Date property (null), but code tries to read `.date.start`

**Solution:** Add null-check before reading:
```javascript
if (!page.properties.Date || !page.properties.Date.date || !page.properties.Date.date.start) {
  return false;  // Skip null entries
}
```

**Prevention:** ALWAYS add null-checks when reading Notion properties, especially Date fields
**Tags:** #n8n #notion #null-check #javascript

---

### Multi-user Goals: Notion Node Doesn't Filter Dynamic Expressions

**Problem:** Get User Goals takes FIRST record instead of filtering by owner. Alena was getting Sergey's goals
**Cause:** n8n Notion node DOES NOT support dynamic expressions in filters: `value: "={{ $json.owner }}"` is ignored

**Solution:** Code node for filtering AFTER fetching all records:
```javascript
const owner = $("Parse Input").first().json.owner;
const allGoals = $("Get User Goals").all();
const userGoal = allGoals.find(item => item.json.property_user === owner);
return [userGoal];
```

**Prevention:** ALWAYS filter multi-user data through Code node, not through Notion node filters
**Tags:** #n8n #notion #filters #multi-user #dynamic-expressions

---

### Notion Date Timezone Bug: Shows Date 1 Day Earlier

**Problem:** Create record with date "2025-10-10", Notion shows "2025-10-09"
**Cause:** Notion Date property without time is interpreted as midnight UTC, converted to your timezone → shift 1 day back

**Solution:** Add explicit time with timezone: `YYYY-MM-DDT12:00:00-04:00`
**What DOES NOT work:** Date-only `YYYY-MM-DD` - interpreted as midnight UTC
**What works:** `2025-10-10T12:00:00-04:00` - explicit timezone prevents shift

**Prevention:** Always add time + timezone to Notion date properties
**Tags:** #notion #date #timezone #bug

---

### Notion Page Object Format in n8n Nodes

**Problem:** Code tries to read `entryData.property_meals` but gets undefined
**Cause:** n8n Notion nodes return full Notion page object, not simplified format

**Solution:** Read properties correctly:
```javascript
const meals = entryData.properties?.Meals?.rich_text?.map(t => t.plain_text).join('') || '';
const calories = entryData.properties?.['Total Calories']?.number || 0;
```

**Prevention:** Always check execution output in n8n UI to see real data structure
**Tags:** #n8n #notion #properties #data-structure

---

### Workflow Optimization: Single Source of Truth

**Problem:** Code duplication for progress/status calculation in 3 places → 120+ lines
**Cause:** Copy-paste code in Prepare Create, Prepare Update, Format Response

**Solution:** Create single "Calculate Progress & Status" node, used by all branches
**Result:** 120+ lines removed, single source of truth, easier to maintain

**Prevention:** If code repeats 2+ times → extract to separate reusable node
**Tags:** #n8n #optimization #refactoring #single-source-of-truth

---

### Notion API: Always Use Notion Nodes Instead of HTTP Request

**Problem:** Dynamic expressions don't work in HTTP Request node for Notion API
**Cause:** HTTP Request requires manual handling of Notion's complex JSON structure

**Solution:** Use dedicated Notion nodes - they handle API format automatically and support `{{ $json.field }}` expressions
**Prevention:** Prefer dedicated n8n nodes over generic HTTP Request when available
**Tags:** #n8n #notion #http-request #dynamic-expressions

---

## Supabase Database

### Check DB Schema BEFORE Creating Supabase Nodes

**Problem:** Workflow fails with "Could not find table/column in schema cache"
**Cause:** Assumed table/column names without checking actual database structure

**Solution:** Fetch schema before building:
```bash
# Check table exists
curl "https://PROJECT.supabase.co/rest/v1/TABLE_NAME?limit=1" \
  -H "apikey: ANON_KEY" \
  -H "Authorization: Bearer SERVICE_ROLE_KEY"

# See actual column names
curl "https://PROJECT.supabase.co/rest/v1/TABLE_NAME?limit=1" | jq .
```

**Common mistakes:**
- ❌ `food_name` → ✅ `food_item`
- ❌ `telegram_user_id` → ✅ `user_id` (UUID reference)
- ❌ `input_type` → ✅ `source`

**Prevention:** ALWAYS verify table name and column names via API BEFORE creating workflow nodes
**Tags:** #supabase #schema #database #verification

---

### Supabase Node Operations: get vs getAll Return Types

**Problem:** IF node condition `$json.length > 0` fails even though user exists in DB
**Cause:** Supabase `get` returns single object, `getAll` returns array

**Solution:** Use correct condition based on operation:
- `get` → returns single object → check `$json.id exists`
- `getAll` → returns array → check `$json.length > 0`

**Prevention:** Know your Supabase operation return type before writing conditions
**Tags:** #n8n #supabase #condition #return-types

---

### Missing Required NOT NULL Field in Supabase Insert

**Problem:** `null value in column "date" of relation "foodtracker_entries" violates not-null constraint`
**Cause:** Didn't include `date` field in insert, but it's required (NOT NULL)

**Solution:** Added date field with n8n expression: `"fieldValue": "={{ $now.format('yyyy-MM-dd') }}"`
**Prevention:** Check table constraints (NOT NULL, UNIQUE) before creating insert nodes
**Tags:** #supabase #not-null #constraints #validation

---

### Verify RPC Function Signatures from Migration Files

**Problem:** `"Could not find function search_similar_entries(p_search_query, p_telegram_user_id)"`
**Cause:** Configured HTTP Request Tool with wrong parameter name - assumed `p_search_query` instead of actual `p_search_text`

**Solution:** Read migration file to verify exact function signature:
```sql
CREATE OR REPLACE FUNCTION search_similar_entries(
  p_telegram_user_id BIGINT,
  p_search_text TEXT,        -- Correct parameter name!
  p_limit INTEGER DEFAULT 5
)
```

**Prevention:** ALWAYS read migration files BEFORE configuring RPC calls in n8n
**Tags:** #supabase #rpc #parameter-naming #migration

---

### Supabase RLS Policies

**Problem:** Query returns empty even though data exists
**Cause:** Row Level Security (RLS) policy blocking access

**Solution:** Check RLS policies in Supabase dashboard
**Prevention:** Understand RLS before creating queries
**Tags:** #supabase #rls #security #permissions

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

---

### [2025-12-17 12:00] L-102: Cascading changes - Test after EACH change

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

---

### Cascading Parameter Changes

[Entry is in Critical Patterns section above]

**Tags:** #refactoring #parameters #downstream

---

### Never Trust Defaults

[Entry is in Critical Patterns section above]

**Tags:** #validation #defaults #best-practice

---

*Learning database consolidated from multiple sources*
*Add new learnings as problems are solved*
*Last updated: 2025-12-17*
