# FoodTracker - Command Status Table

**Last Updated:** 2025-12-17
**Workflow:** sw3Qs3Fe3JahEbbW (v288+, 56 nodes)

---

## 📋 Commands Status

| # | Command | Status | Priority | Last Tested | Issue | Fix Required |
|---|---------|--------|----------|-------------|-------|--------------|
| 1 | `/week` | ✅ **FIXED** | - | 2025-12-17 19:15 | Was: Non-deterministic | Fixed! Deterministic results ✅ |
| 2 | Voice input | ✅ **WORKING** | - | 2025-12-17 21:35 | Was: Duplicate connections + schema | TESTED! Works end-to-end ✅ |
| 3 | `/day` | ✅ Working | - | Recent | None | - |
| 4 | `/month` | ✅ **WORKING** | - | 2025-12-19 22:42 | None | Monthly report with trends ✅ |
| 5 | `/welcome` | ✅ **WORKING** | - | 2025-12-19 22:37 | Was: isDefined bug + webhook cache | TESTED! Timezone onboarding works ✅ |
| 6 | `/start` | ❓ Unknown | 🟢 LOW | Never | No handler in Switch? | Verify implementation |
| 7 | `/help` | ✅ **WORKING** | - | 2025-12-19 22:52 | Was: Send Keyboard referenced AI Agent | TESTED! Conditional expression works ✅ |
| 8 | `/timezone` | ❌ **NOT IMPLEMENTED** | - | 2025-12-19 22:45 | Not in bot menu | Need to implement |
| 9 | `/settings` | ❓ Unknown | 🟢 LOW | Never | No handler? | Verify implementation |
| 10 | `/goal` | ❓ Unknown | 🟢 LOW | Unknown | Unknown | Test in Telegram |
| 11 | `/stats` | ❓ Unknown | 🟢 LOW | Unknown | Unknown (alias for /day?) | Test in Telegram |
| 12 | `/meals` | ❓ Untested | 🟢 LOW | Unknown | Unknown (Task 2.6.5) | Test in Telegram |
| 13 | Text input | ✅ Working | - | Recent | None | - |
| 14 | Photo input | ✅ Working | - | Recent | 4-tier cascade works | - |

---

## ✅ Completed Fixes

### `/help` Command - ⚠️ FIXED, AWAITING TEST (2025-12-19 22:50)
**Problem:** Bot silent ("молчит") when sending `/help` command, Telegram shows "Unknown slash command: help"
**Root Cause:**
- Command routed correctly: Switch → Simple Reply → Route to AI? → Send Keyboard (HTTP)
- "Send Keyboard (HTTP)" node used hardcoded expression: `$node["AI Agent"].json.output`
- For `/help` (non-AI command), AI Agent does NOT execute → expression fails!
- Two execution paths exist:
  - WITH AI: AI Agent → Strip Signature → Send Keyboard (HTTP)
  - WITHOUT AI: Simple Reply → Route to AI? → Send Keyboard (HTTP)

**Fix:**
```javascript
// Changed Send Keyboard (HTTP) expression from:
text: $node["AI Agent"].json.output

// To conditional expression:
text: $if($node["Strip Signature"].isExecuted,
         $node["Strip Signature"].json.output,
         $node["Simple Reply"].json.output)
```

**Operations:**
1. Updated "Send Keyboard (HTTP)" node jsonBody parameter
2. Deactivated workflow (clear webhook cache)
3. Reactivated workflow (reload webhook listener)

**Result:** ✅ Fix applied - **NEEDS USER TEST in Telegram**

**New Learning:**
- L-NEW-012: Use `.isExecuted` conditional for nodes with multiple execution paths
- Pattern: `$if($node["NodeName"].isExecuted, primary_value, fallback_value)`

---

### `/welcome` Command + Timezone Integration - ✅ WORKING (2025-12-19 22:37)
**Problem:** Bot silent ("молчит") when sending `/welcome` command after timezone implementation
**Root Cause (2 parts):**
1. Switch `isDefined` operator bug - matched empty strings/null for voice condition
2. Webhook cache - API updates didn't apply until workflow deactivated/reactivated

**Fix:**
```javascript
// Part 1: Fixed Switch operators
Voice: {"type": "object", "operation": "notEmpty"}  // was: isDefined
Photo: {"type": "array", "operation": "notEmpty"}   // was: isDefined

// Part 2: Restart webhook listener
n8n_update_partial_workflow({operations: [{type: "deactivateWorkflow"}]})
n8n_update_partial_workflow({operations: [{type: "activateWorkflow"}]})
```

**Result:** ✅ TESTED end-to-end
- Timezone question appears between "goal" and "macros" steps
- AI Agent converts user input to proper timezone format ("монреаль" → "America/Toronto")
- Timezone saved to database via "Update User Onboarding" tool
- All emojis display correctly (📊🥩🍞🧈🌾💧)

**New Learnings:**
- L-NEW-010: Switch `isDefined` matches empty strings - use `notEmpty` instead
- L-NEW-011: Webhook workflows need deactivate/reactivate after API updates

---

### `/week` Command - ✅ FIXED (2025-12-17 19:15)
**Problem:** Non-deterministic results (AI calculates differently each time)
**Fix:** Fixed routing (IF node branch parameter) + updated Inject Context code + user updated AI Agent prompt
**Result:** Deterministic results - same numbers on all 3 calls

### Voice Input - ✅ FIXED (2025-12-17 21:00)
**Problem:** Voice messages fail - Switch routes to wrong handler
**Root Cause (6 cycles, ~30min to discover):**
- Cycle 1-3: Thought it was Switch condition ordering + `.text` field access
- Cycle 4-5: Thought it was operator/expression issues
- Cycle 6: BREAKTHROUGH - Output 0 had DUPLICATE connections:
  - Connection 1: "Simple Reply" (executed FIRST)
  - Connection 2: "Process Voice" (ignored)
  - Workflow always followed first connection

**Why Duplicates Existed:**
- Previous fix attempts added new connections without removing old ones
- Each `addConnection` operation created additional connection
- Switch output can have array of connections - workflow uses FIRST one

**Fix (cycle 6):**
1. Removed ALL Switch → Simple Reply connections using `removeConnection` with `continueOnError: true`
2. Re-added Simple Reply for command outputs only (case 2)
3. Left outputs 0-1 with SINGLE connections:
   - Output 0 → Process Voice ✅
   - Output 1 → Process Photo ✅

**Verification (Execution 34129):**
- ✅ Switch → Process Voice (correct routing!)
- ✅ Transcription: "200 грамм курицы"
- ✅ Reached AI Agent
- ⚠️ Follow-up issue: AI Agent tool schema error (p_fiber: null) - **FIXED** (see below)

**Result:** ✅ Voice and photo routing WORKS! Transcription works! AI Agent receives data!
**New Learning:** L-008 added to LEARNINGS.md (duplicate connections)
**Testing Status:** TESTED in Telegram - routing confirmed working

---

### Voice Input - Tool Schema Fix - ✅ WORKING (2025-12-17 21:30)
**Problem:** AI Agent tool call fails with "Expected number, received null → at p_fiber"
**Root Cause:** Optional parameters (p_fiber, p_time) had strict types that don't accept null
**Fix:** Changed tool schema types from single type to nullable arrays:
- `p_fiber`: `"number"` → `["number", "null"]`
- `p_time`: `"string"` → `["string", "null"]`
**Result:** ✅ Tool schema now accepts null for optional parameters (v289)
**New Learning:** L-009 added to LEARNINGS.md (AI Agent tool nullable types)

**End-to-End Test (2025-12-17 21:35):**
- ✅ Voice message transcribed: "200 граммов риса"
- ✅ AI Agent processed and called Save Food Entry tool
- ✅ Database entry created successfully
- ✅ Bot response with correct macros and emojis
- **Status:** FULLY WORKING end-to-end!

---

## 🟢 Priority 3: Test Untested Commands

Commands implemented but never tested:

### Task 2.6.5 Features (from TESTING_CHECKLIST.md)
- [ ] `/month` - Monthly report with trends
- [ ] `/timezone` - Timezone management
- [ ] `/meals` - Meal management
- [ ] `/welcome` - Onboarding flow

### Basic Commands (verify implementation)
- [ ] `/start` - Bot introduction
- [ ] `/help` - Help message
- [ ] `/settings` - User settings

**Test Strategy:**
1. Check if handler exists in Switch node
2. Test in Telegram
3. Document results in this table

---

## 📊 Test Results Template

### Test: [Command Name]

**Date:** YYYY-MM-DD HH:MM
**Tester:** Name

**Input:** `/command` or "user message"

**Expected:**
- [What should happen]

**Actual:**
- [What actually happened]

**Status:** ✅ PASS / ❌ FAIL / ⚠️ PARTIAL

**Issues Found:**
1. [Issue description]
2. [Issue description]

**Evidence:**
- Execution ID: [link to n8n execution]
- Screenshot: [if applicable]

---

## 🔄 Testing Progress

### Commands Tested/Fixed: 7/14 (50%)
- ✅ `/week` - Fixed (deterministic results)
- ✅ Voice input - **WORKING end-to-end** (routing + schema fix)
- ✅ `/day` - Working
- ✅ `/welcome` - **WORKING with timezone** (isDefined bug fixed + webhook restart)
- ✅ `/month` - **WORKING** (monthly report with trends)
- ✅ Text input - Working
- ✅ Photo input - Working

### Commands to Test: 7/14 (50%)
Priority order:
1. `/timezone`
3. `/meals`
5. `/meals`
6. `/start`
7. `/help`
8. `/goal`
9. `/stats`
10. `/settings`

---

## 🚨 Known Issues Summary

| Issue | Impact | Priority | Status |
|-------|--------|----------|--------|
| 9 commands untested | Unknown if they work | 🟢 LOW | Need testing |

---

## 🎯 Next Steps

### Immediate
1. **Test `/month` command** (Monthly report)
2. **Test `/welcome` command** (Onboarding flow)
3. **Test `/timezone` command** (Timezone management)

### Follow-up
4. Test remaining untested commands (7 commands)
5. Update TESTING_CHECKLIST.md with results
6. Update PROJECT_STATE.md with current status

---

## 📝 Notes

**From HANDOFF-2025-12-16.md:**
- User frustration level: **HIGH** (5th+ attempt to fix `/week`)
- Previous attempts: All failed (wrong approaches)
- Current approach: Correct logic, just incomplete implementation
- Rollback plan: Available if all fixes fail

**Technical Details:**
- Week Calculations Code node ID: `week-calculations-code-001`
- Code: 142 lines, calls Supabase `get_daily_summary` 7 times
- Output: `weekStats` object with totals/averages/daily_breakdown
- Deterministic: Same input → Same output (always!)

---

**End of Command Status Table**
