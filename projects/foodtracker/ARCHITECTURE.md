# FoodTracker Workflow Architecture

**Purpose:** Map all components and their dependencies. Check before ANY change.
**Workflow ID:** sw3Qs3Fe3JahEbbW
**Nodes:** 56 | **Connections:** 54

---

## Quick Impact Check

**Before changing node X, check which rows have X in "Depends On" column**

| Component | If Changed | Impact |
|-----------|------------|--------|
| Inject Context | ALL AI features break | Check AI_PROMPT.md |
| AI Agent Prompt | Tool calls may fail | Edit AI_PROMPT.md first! |
| Check User | User identification breaks | Supabase users table |
| Any Tool Node | AI can't use that tool | Update AI_PROMPT.md |
| Any RPC Function | Tool returns error | Update Tool Node params |
| Database Column | RPC function crashes | Update RPC + Tool + Prompt |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TELEGRAM INPUT                                │
├─────────────────────────────────────────────────────────────────────┤
│  Telegram Trigger → Log Message → Check User → IF Registered?       │
│                                        │                             │
│                     ┌─────────────────┴───────────────┐             │
│                     ▼                                  ▼             │
│              [Not Registered]                   [Registered]         │
│              "Пройди /welcome"                       │               │
│                                                      ▼               │
│                                            Typing Indicator          │
│                                                      │               │
│                                            Prepare Message Data      │
│                                                      │               │
│                                                  Switch (11)         │
│                                                      │               │
├─────────────────────────────────────────────────────────────────────┤
│                          SWITCH ROUTING                              │
├─────────────────────────────────────────────────────────────────────┤
│  Output 0: Voice → Download → Transcribe → Merge → AI               │
│  Output 1: Photo → Download → Extract/Vision → AI                   │
│  Output 2-9: Commands → Week Calculations → Route to AI? → ...      │
│  Output 10: Text → Process Text → AI                                 │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        AI AGENT CORE                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐    ┌──────────────────┐                       │
│  │  Inject Context  │───▶│    AI Agent      │                       │
│  │  (adds user data)│    │  (GPT-4o-mini)   │                       │
│  └──────────────────┘    └────────┬─────────┘                       │
│                                   │                                  │
│           ┌───────────────────────┼───────────────────────┐         │
│           │                       │                       │         │
│           ▼                       ▼                       ▼         │
│   ┌──────────────┐       ┌──────────────┐       ┌──────────────┐   │
│   │ Conversation │       │  OpenAI Chat │       │  15 Tools    │   │
│   │   Memory     │       │    Model     │       │ (see below)  │   │
│   │ (PostgreSQL) │       │ (gpt-4o-mini)│       │              │   │
│   └──────────────┘       └──────────────┘       └──────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        OUTPUT PROCESSING                             │
├─────────────────────────────────────────────────────────────────────┤
│  AI Response → Strip Signature → Save AI Response → Telegram        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Tool → RPC → Database Mapping

| Tool Node | RPC Function | Tables | Key Columns |
|-----------|--------------|--------|-------------|
| Save Food Entry | save_food_entry | food_log | user_id, product_name, protein, carbs, fat, calories |
| Search Food by Product | search_food_by_product | food_log | product_name (ILIKE) |
| Search Similar Entries | search_similar_entries | food_log | product_name (similarity) |
| Search Today Entries | search_today_entries | food_log | created_at (today) |
| Delete Food Entry | delete_food_entry | food_log | id |
| Get Daily Summary | get_daily_summary | food_log | created_at, SUM macros |
| Get Monthly Summary | get_monthly_summary | food_log | created_at (month), trends |
| Update User Goal | update_user_goals_bulk | users | goal |
| Update User Timezone | update_user_timezone | users | timezone |
| **Update User Onboarding** | **update_user_onboarding** | **users** | **12 columns** (see below) |
| Add User Meal | add_user_meal_flat | user_meals | meal_name, ingredients |
| Search User Meals | search_user_meals | user_meals | meal_name (ILIKE) |
| Update User Meal | update_user_meal | user_meals | id, meal_name, ingredients |
| Delete User Meal | delete_user_meal | user_meals | id |
| Log Water Intake | log_water_intake | water_log | amount_ml, time |

---

## Critical: Update User Onboarding

**This tool caused 18 debug cycles. Full documentation:**

### Parameters (12)

| # | Parameter | Type | DB Column | Required |
|---|-----------|------|-----------|----------|
| 1 | p_telegram_user_id | number | telegram_user_id | YES |
| 2 | p_name | string | name | YES |
| 3 | p_age | number | age | YES |
| 4 | p_height_cm | number | height_cm | YES |
| 5 | p_weight_kg | number | weight_kg | YES |
| 6 | p_goal | string | goal | YES |
| 7 | p_protein_goal | number | protein_goal | YES |
| 8 | p_carbs_goal | number | carbs_goal | YES |
| 9 | p_fat_goal | number | fat_goal | YES |
| 10 | p_fiber_goal | number | fiber_goal | YES |
| 11 | p_water_goal_ml | number | water_goal_ml | YES |
| 12 | p_timezone | string | timezone | YES |

### RPC Function Signature

```sql
CREATE OR REPLACE FUNCTION update_user_onboarding(
  p_telegram_user_id BIGINT,
  p_name TEXT,
  p_age INT,
  p_height_cm INT,
  p_weight_kg NUMERIC,
  p_goal TEXT,
  p_protein_goal INT,
  p_carbs_goal INT,
  p_fat_goal INT,
  p_fiber_goal INT,
  p_water_goal_ml INT,
  p_timezone TEXT
) RETURNS JSON
```

### Data Flow

```
User answers → AI collects → AI calls tool → Tool POSTs to RPC → RPC updates users table
                                    ↓
                    telegram_user_id comes from:
                    Inject Context → input context → AI reads it
```

---

## Inject Context Node

**Purpose:** Prepares data for AI Agent

### Input Sources (6)

```javascript
const userMessage =
  $json.data ||               // Process Text (text messages)
  $json.command ||            // Week Calculations Code (commands)
  $json.message?.text ||      // Direct Telegram Trigger
  $json.chatInput ||          // AI Agent routing
  $json.transcription ||      // Voice processing
  $json.product_name ||       // Photo processing
  '';
```

### Output (depends on mode)

**Normal mode:**
```javascript
{
  chatInput: "user message",
  user_id: 123,
  telegram_user_id: 682776858,
  user_name: "Сергей",
  user_goals: { protein: 120, carbs: 90, ... },
  user_profile: { age: 45, weight_kg: 67, ... }
}
```

**Welcome mode (`/welcome`):**
```javascript
{
  chatInput: "/welcome",
  user_id: 123,
  telegram_user_id: 682776858,
  note: "Welcome mode: AI will collect fresh"
}
```

### WARNING: Single Message Detection

```javascript
const isWelcomeCommand = userMessage === '/welcome';  // ONLY first message!
```

**Problem:** When user answers "да" (confirmation), `isWelcomeCommand = false`, so OLD data passes through.
**Workaround:** AI Prompt has "INPUT CONTEXT OVERRIDE" section (see AI_PROMPT.md)
**Proper Fix:** Track session state (not implemented)

---

## Key Nodes Reference

| Node | Type | Purpose | Critical? |
|------|------|---------|-----------|
| Telegram Trigger | telegramTrigger | Entry point | YES |
| Check User | supabase | Get user from DB | YES |
| Inject Context | code | Prepare AI input | YES |
| AI Agent | langchain.agent | Core AI | YES |
| OpenAI Chat Model | langchain.lmChatOpenAi | GPT-4o-mini | YES |
| Conversation Memory | langchain.memoryPostgresChat | History | YES |
| Switch | switch | Route by message type | YES |
| Process Text | code | Extract text message | Medium |
| Strip Signature | code | Clean AI response | Low |
| Typing Indicator | telegram | UX feedback | Low |

---

## Protected Nodes (L-112)

⚠️ **CRITICAL:** These nodes require DOT NOTATION for any parameter changes. See [CLAUDE.md Node Modification Protocol](../../CLAUDE.md#-node-modification-protocol-mandatory---l-112).

### High-Risk Nodes (NEVER modify without verification)

| Node ID | Name | Protected Fields | Safe to Modify |
|---------|------|------------------|----------------|
| `cdfe74df-5815-4557-bf8f-f0213d9ca8ad` | AI Agent | ALL parameters | `"parameters.systemMessage"` ONLY via dot notation |
| `inject-context-001` | Inject Context | `parameters.jsCode` | Full replacement only, never partial |
| `18d2242f-51eb-48c9-8d1c-1fef81ce9974` | OpenAI Chat Model | Model config | `"parameters.model"`, `"parameters.temperature"` |
| `memory-buffer-node-001` | Conversation Memory | Session config | `"parameters.contextWindowLength"` |

### Medium-Risk Nodes

| Node ID | Name | Risk | Modification Rule |
|---------|------|------|-------------------|
| Switch | Route by type | Multi-output | Check ALL output connections after change |
| Check User | Supabase query | Auth | Verify user lookup still works |
| Process Text | Code node | Data extraction | Test ALL input paths |

### Modification Checklist

Before modifying ANY protected node:

```bash
# 1. Record current workflow size
n8n_get_workflow({id: "sw3Qs3Fe3JahEbbW", mode: "structure"})
# Note: beforeSize = XXX bytes

# 2. Use DOT NOTATION only
updates: { "parameters.systemMessage": "..." }  # ✅
updates: { parameters: { systemMessage: "..." } }  # ❌ NEVER!

# 3. Verify after update
# Check: afterSize >= beforeSize - 100
# If size decreased → ROLLBACK IMMEDIATELY
```

### Size History (Reference)

| Version | Size | Status | Notes |
|---------|------|--------|-------|
| v133 | 134,827 bytes | ✅ Working | Before Claude's intervention |
| v134 | 114,677 bytes | ❌ Broken | 20KB deleted by wrong updateNode |
| v136 | ~135,000 bytes | ✅ Working | Current canonical version |

---

## Database Schema (users table)

| Column | Type | Used By |
|--------|------|---------|
| id | uuid | Internal PK |
| telegram_user_id | bigint | All tools (user lookup) |
| name | text | Onboarding |
| age | int | Onboarding |
| height_cm | int | Onboarding (added Cycle 3) |
| weight_kg | numeric | Onboarding |
| goal | text | Onboarding, Update Goal |
| protein_goal | int | Onboarding |
| carbs_goal | int | Onboarding |
| fat_goal | int | Onboarding |
| fiber_goal | int | Onboarding |
| water_goal_ml | int | Onboarding |
| calorie_goal | int | Calculated (Cycle 15 typo fix) |
| timezone | text | Onboarding, Update Timezone |
| created_at | timestamp | System |

---

## Change Checklist

### Before ANY Change

1. [ ] Find component in this document
2. [ ] Check "Depends On" to see what might break
3. [ ] If changing prompt → edit AI_PROMPT.md first
4. [ ] If changing tool → update prompt AND tool node
5. [ ] If changing database → update RPC → tool → prompt

### After Change

1. [ ] Test the specific feature
2. [ ] Test related features (from dependencies)
3. [ ] Update this document if structure changed
4. [ ] Update AI_PROMPT.md if prompt changed

---

## Related Files

- [SUPABASE_SCHEMA.md](SUPABASE_SCHEMA.md) - **Full database schema** (tables, RPC, RLS)
- [AI_PROMPT.md](AI_PROMPT.md) - Full AI prompt with WHY annotations
- [PROJECT_STATE.md](PROJECT_STATE.md) - Current state and history
- [POST_MORTEM.md](POST_MORTEM.md) - Analysis of 18-cycle debugging
- [debug_log.md](debug_log.md) - Debug session tracking

---

---

## IMPLEMENTED: Session State Tracking (v1.5.0)

**Problem (SOLVED):** Inject Context detected `/welcome` only on FIRST message.
When user answered "да" → `isWelcomeCommand = false` → OLD database values leaked.

**Solution:** Automatic session tracking via Supabase RPC + Inject Context updates.

### Proposed Solution: Session State Table

```sql
-- New table in Supabase
CREATE TABLE user_sessions (
  telegram_user_id BIGINT PRIMARY KEY,
  active_command TEXT,       -- '/welcome', '/settings', etc.
  command_step INT DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  data JSONB DEFAULT '{}'    -- Collected data during session
);

-- Cleanup old sessions (hourly cron)
DELETE FROM user_sessions WHERE started_at < NOW() - INTERVAL '1 hour';
```

### Updated Inject Context Logic

```javascript
// 1. Check if user has active session
const session = await supabase
  .from('user_sessions')
  .select('*')
  .eq('telegram_user_id', userProfile.telegram_user_id)
  .single();

// 2. Detect command start
const isCommandStart = userMessage.startsWith('/');

if (isCommandStart) {
  // Start new session
  await supabase.from('user_sessions').upsert({
    telegram_user_id: userProfile.telegram_user_id,
    active_command: userMessage,
    command_step: 1,
    started_at: new Date()
  });
}

// 3. Build output based on session state
if (session?.active_command) {
  // IN SESSION MODE - exclude old data
  return {
    chatInput: userMessage,
    telegram_user_id: userProfile.telegram_user_id,
    session_mode: session.active_command,
    session_step: session.command_step
  };
} else {
  // NORMAL MODE - include all context
  return { ...fullContext };
}
```

### Benefits

1. Works for ANY command (`/welcome`, `/settings`, `/goal`, etc.)
2. No prompt hacks needed
3. Tracks progress step-by-step
4. Auto-cleanup after 1 hour

### Effort Estimate

| Task | Time |
|------|------|
| Create user_sessions table | 10 min |
| Update Inject Context | 30 min |
| Update AI Prompt (remove overrides) | 20 min |
| Test all commands | 1 hour |
| **Total** | ~2 hours |

### Status: IMPLEMENTED (v1.5.0)

Deployed 2025-12-22. AI Prompt workarounds removed. Session state handles context isolation automatically.

---

*Last Updated: 2025-12-22*
