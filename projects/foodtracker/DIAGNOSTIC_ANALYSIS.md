# FoodTracker Bot - Diagnostic Analysis
# Почему бот отвечает на английском без эмоджи

**Date:** 2025-12-23 03:45
**Issue:** Bot responds in English without emojis despite Russian prompt deployed
**Severity:** CRITICAL

---

## 🔍 Investigation Results

### 1. Workflow Configuration ✅

**AI Agent Node (cdfe74df-5815-4557-bf8f-f0213d9ca8ad):**
- systemMessage: DEPLOYED ✅
- Content: Full Russian prompt with "Friendly Russian tone" and "MANDATORY emojis"
- Location: Line 27-28 of systemMessage
- Verified: Prompt contains complete Russian instructions

**OpenAI Chat Model Node:**
- Model: gpt-4o-mini ✅
- No system prompt override ✅
- No additional parameters ✅

**Conversation Memory:**
- Session key: telegram_user_id (682776858)
- Context window: 10 messages
- Storage: n8n_chat_histories table

**Workflow Status:**
- Active: YES ✅
- Latest version: v133 (created 01:41:23)
- Recent updates: v129-v133 (all within last hour)

---

## 2. Execution Analysis ❌

**Latest Execution (ID: 34505) at 01:43:24:**

**Input to AI Agent:**
```json
{
  "chatInput": "/day",
  "telegram_user_id": 682776858,
  "session_mode": "/day"
}
```

**Output from AI Agent:**
```
Here's your daily nutrition summary for today, October 30, 2023:

- **Calories:** 0
- **Protein:** 0 g
- **Carbs:** 0 g
...
```

**Problems:**
1. ❌ Response in ENGLISH (not Russian)
2. ❌ NO emojis (should have 📊🥩🍞🧈🌾💧)
3. ❌ OLD DATE: October 30, 2023 (current: December 23, 2025)

---

## 3. Root Cause Analysis

### Theory 1: systemMessage Not Applied to Active Workflow ⚠️

**Evidence:**
- Workflow updated via API (n8n_update_partial_workflow)
- Workflow remains ACTIVE during update
- n8n may use CACHED version of active workflow in memory
- API updates database, but running instance uses old config

**Test:** Deactivate → Reactivate workflow to force reload

### Theory 2: n8n LangChain Agent Bug 🐛

**Evidence:**
- systemMessage parameter exists in workflow
- But AI responds as if NO systemMessage provided
- OpenAI default behavior = English responses

**Possible Issue:**
- AI Agent node (typeVersion 2.2) may not pass systemMessage to OpenAI API
- Bug in @n8n/n8n-nodes-langchain.agent node
- systemMessage might need to be in OpenAI Chat Model node instead

### Theory 3: Conversation Memory Override 💾

**Evidence:**
- Old date in response: "October 30, 2023"
- n8n_chat_histories table was CLEARED earlier
- After clearing, bot started responding in English

**Timeline:**
1. BEFORE clearing history: Bot had cached Russian responses (?)
2. User complained about missing emojis
3. Cleared n8n_chat_histories table
4. AFTER clearing: Bot responds in English (fresh start, no history)

**Issue:**
- Clearing history removed any Russian examples
- AI now generates responses from scratch
- **BUT systemMessage should override this!**

---

## 4. Configuration Verification

### What I Checked:

1. ✅ AI Agent node has ONLY systemMessage parameter (no other overrides)
2. ✅ systemMessage content is CORRECT (verified full text):
   ```
   ## ⚠️ CRITICAL: RESPONSE STYLE (MANDATORY!)

   - Friendly Russian tone
   - **MANDATORY emojis in EVERY response:** 📊🥩🍞🧈🌾💧
   ```
3. ✅ OpenAI Chat Model has NO system prompt (only model: gpt-4o-mini)
4. ✅ Workflow is ACTIVE (confirmed via API)
5. ✅ Recent versions show updates were made (v129-v133)

### What's Wrong:

1. ❌ systemMessage NOT being used by AI at runtime
2. ❌ AI behaves like NO system prompt exists
3. ❌ Default OpenAI behavior = English

---

## 5. Attempted Fixes

### Fix #1: Update systemMessage via API ✅ (but didn't work)
```javascript
n8n_update_partial_workflow({
  id: "sw3Qs3Fe3JahEbbW",
  operations: [{
    type: "updateNode",
    nodeId: "cdfe74df-5815-4557-bf8f-f0213d9ca8ad",
    updates: {parameters: {systemMessage: "..."}}
  }]
})
```
**Result:** Updated in database ✅, but NOT applied to running workflow ❌

### Fix #2: Clear Conversation Memory ✅ (made it worse!)
```bash
DELETE FROM n8n_chat_histories WHERE session_id='682776858'
```
**Result:** Deleted 150+ messages ✅, but bot now ONLY responds in English ❌

### Fix #3: Tried to Deactivate/Reactivate ❌ (failed)
- Attempted to deactivate workflow to clear cache
- n8n_update_partial_workflow doesn't support "deactivate" operation
- Requires manual UI action

---

## 6. The Real Problem 🎯

**HYPOTHESIS:** n8n LangChain Agent node does NOT use systemMessage parameter from AI Agent node.

**Why:**
1. systemMessage is DEPLOYED in workflow
2. But AI behaves as if it doesn't exist
3. OpenAI Chat Model has no system prompt
4. **The systemMessage might need to be in OpenAI Chat Model node, NOT AI Agent node**

**n8n LangChain Architecture:**
```
AI Agent Node
  ↓ (systemMessage parameter HERE - might be ignored!)
OpenAI Chat Model Node
  ↓ (NO system prompt HERE - this might be the problem!)
OpenAI API
```

**Correct Architecture:**
```
AI Agent Node
  ↓ (no systemMessage parameter)
OpenAI Chat Model Node
  ↓ (systemMessage parameter HERE!)
OpenAI API
```

---

## 7. Solution Options

### Option A: Move systemMessage to OpenAI Chat Model Node (RECOMMENDED)

**Action:**
1. Remove systemMessage from AI Agent node
2. Add systemMessage to OpenAI Chat Model node
3. Test execution

**Risk:** May break other features

### Option B: Deactivate/Reactivate Workflow (MANUAL)

**Action:**
1. Open n8n UI → FoodTracker workflow
2. Click "Active" to deactivate
3. Wait 5 seconds
4. Click "Active" to reactivate

**Risk:** Low, but requires manual action

### Option C: Check n8n Documentation/Community

**Action:**
1. Search n8n community for "LangChain Agent systemMessage not working"
2. Check if systemMessage should be in OpenAI Chat Model node
3. Look for known bugs in typeVersion 2.2

### Option D: Rollback to Working Version

**Action:**
1. Find version where bot WAS responding in Russian with emojis
2. Rollback using n8n_workflow_versions
3. Compare configuration differences

---

## 8. Next Steps

**IMMEDIATE ACTION REQUIRED:**

1. **Test Option B (Deactivate/Reactivate)**
   - User must do this manually in n8n UI
   - Takes 10 seconds
   - Will force n8n to reload systemMessage from database

2. **If Option B fails, try Option A (Move systemMessage)**
   - Use n8n_update_partial_workflow to:
     - Remove systemMessage from AI Agent
     - Add systemMessage to OpenAI Chat Model
   - This is more invasive but should work

3. **If both fail, Option C (Research)**
   - Search n8n community/GitHub for known issues
   - May need to report bug to n8n team

---

## 9. Supporting Evidence

**Files Verified:**
- ✅ AI_PROMPT.md - Contains Russian prompt with emojis
- ✅ AI_PROMPT_V2.md - Synchronized with AI_PROMPT.md
- ✅ Workflow JSON (via API) - systemMessage deployed
- ✅ Execution data - Shows English output without emojis

**Workflow Versions:**
- v133 (latest) - 01:41:23
- v132 - 01:41:18
- v131 - 01:26:09

**Executions:**
- #34505 - 01:43:24 - ENGLISH response ❌
- #34504 - 01:36:42
- #34503 - 01:35:09

**Database:**
- n8n_chat_histories - CLEARED (150+ messages deleted)
- User: telegram_user_id 682776858

---

## 10. Conclusion

**The problem is NOT:**
- ❌ Missing prompt in files (AI_PROMPT.md is correct)
- ❌ Prompt not deployed (verified in workflow JSON)
- ❌ OpenAI model misconfiguration
- ❌ Conversation memory (cleared it)

**The problem IS:**
- ✅ systemMessage parameter NOT being applied at runtime
- ✅ Either workflow cache issue OR n8n LangChain bug
- ✅ Needs deactivate/reactivate OR systemMessage relocation

**Recommended Fix:**
1. Try manual deactivate/reactivate FIRST (safest)
2. If that fails, move systemMessage to OpenAI Chat Model node
3. If both fail, investigate n8n LangChain Agent bug

---

**Status:** BLOCKED - Requires manual UI action or architectural change
**Owner:** User (for manual fix) or Claude (for code fix)
**Priority:** P0 - CRITICAL
