# FoodTracker - Session Brief

> **Copy-paste this to new Claude session to start with full context**

---

## 🎯 Current Task

**Task 2.6.5 - Advanced Features & UX Testing**

Testing 5 feature areas that are already implemented:
1. Timezone Management
2. Monthly Report `/month`
3. Interactive Reports (AI analyzes reports)
4. Meal Management (add/edit/breakdown meals)
5. Welcome Flow `/welcome` (onboarding)

**Status:** Implementation complete, testing in progress

---

## 📍 Quick Start

### Essential Files to Read First

```bash
# 1. Navigation guide (where everything is)
Read /Users/sergey/Projects/N8NClaudeLong/projects/foodtracker/NAVIGATION.md

# 2. Current state
Read /Users/sergey/Projects/N8NClaudeLong/projects/foodtracker/PROJECT_STATE.md

# 3. Testing checklist (18 test cases)
Read /Users/sergey/Projects/N8NClaudeLong/projects/foodtracker/TESTING_CHECKLIST.md

# 4. Master TODO (full context from MultiBOT project)
Read /Users/sergey/Projects/MultiBOT/bots/food-tracker/TODO.md
```

### Debug Log (track attempts, avoid loops)

```bash
# 5. Check what was already tried
Read /Users/sergey/Projects/N8NClaudeLong/projects/foodtracker/debug_log.md
```

---

## 🔧 Workflow Info

- **ID:** `sw3Qs3Fe3JahEbbW`
- **Name:** FoodTracker
- **Version:** v288 (production ready)
- **URL:** https://n8n.srv1068954.hstgr.cloud/workflow/sw3Qs3Fe3JahEbbW
- **Nodes:** 56

### Quick Check
```javascript
n8n_get_workflow({id: "sw3Qs3Fe3JahEbbW", mode: "structure"})
```

---

## 📚 Key Locations

### Main Documentation (MultiBOT)
- **TODO:** `/Users/sergey/Projects/MultiBOT/bots/food-tracker/TODO.md`
- **Tasks:** `/Users/sergey/Projects/MultiBOT/bots/food-tracker/tasks/`
- **DB Schema:** `/Users/sergey/Projects/MultiBOT/supabase_schema_full.md`

### Working Files (N8NClaudeLong)
- **Instructions:** `/Users/sergey/Projects/N8NClaudeLong/CLAUDE.md`
- **Learnings:** `/Users/sergey/Projects/N8NClaudeLong/LEARNINGS.md`
- **Project Folder:** `/Users/sergey/Projects/N8NClaudeLong/projects/foodtracker/`

---

## 🎓 Critical Knowledge

### Database Tables
- `foodtracker_users` - user profiles, goals, timezone
- `foodtracker_entries` - food logs
- `user_meals` - saved meals (NEW in Task 2.6.5)
- `n8n_chat_histories` - conversation memory

### AI Agent Tools (8 total)
1. Save Food Entry
2. Search Food by Product
3. Search Similar Entries
4. Search Today Entries
5. Get Daily Summary
6. Delete Food Entry
7. Log Water Intake
8. **Manage User Meals** (NEW in Task 2.6.5)

### New Features (Task 2.6.5)
- Timezone management with city selection
- Monthly report `/month` with trends
- Interactive report analysis (AI answers questions)
- Meal management (add/edit/breakdown)
- Welcome flow `/welcome` (onboarding)

---

## ⚠️ Anti-Loop Protocol

**Before making changes:**

1. **Check debug_log.md** - what was already tried?
2. **Read LEARNINGS.md** - known solutions?
3. **Record attempts** - write to debug_log.md before each try

**Cycle limits:**
- Cycles 1-2: Direct fixes
- Cycle 3: STOP → check LEARNINGS
- Cycles 4-5: Try different approach
- Cycle 6+: Ask user or rollback

---

## 🧪 Testing Strategy

### Phase 1: Manual Testing in Telegram
Test each feature in Telegram bot, document results in TESTING_CHECKLIST.md

### Phase 2: Verify Database
Check that data saves correctly in Supabase

### Phase 3: Check Workflow Executions
```javascript
n8n_executions({
  action: "list",
  workflowId: "sw3Qs3Fe3JahEbbW",
  limit: 10
})
```

### Phase 4: Document Issues
- **Critical issues** → fix immediately
- **Minor issues** → log in debug_log.md
- **New learnings** → add to LEARNINGS.md

---

## 📋 Current Testing Progress

See `TESTING_CHECKLIST.md` for detailed status.

**Summary:**
- [ ] 1. Timezone Management (3 tests)
- [ ] 2. Monthly Report (3 tests)
- [ ] 3. Interactive Reports (3 tests)
- [ ] 4. Meal Management (5 tests)
- [ ] 5. Welcome Flow (5 tests)

---

## 🚀 How to Start Testing

```bash
# Step 1: Check current state
Read projects/foodtracker/debug_log.md
Read projects/foodtracker/TESTING_CHECKLIST.md

# Step 2: Start testing
# Test in Telegram: @FoodTrackerBot
# Document results in TESTING_CHECKLIST.md

# Step 3: For each issue found:
# - Record in debug_log.md
# - Check LEARNINGS.md for solutions
# - Fix if needed
# - Update TESTING_CHECKLIST.md

# Step 4: After all tests:
# Update TODO.md in MultiBOT project
# Mark Task 2.6.5 complete or list remaining issues
```

---

## 🔗 MCP Tools Available

**n8n-mcp tools:** All 20 tools available
- Workflow management (get, update, validate)
- Executions (get, list, delete)
- Template search
- Node validation

**Supabase plugin:** Yes
**Context7 docs:** Yes

---

## 💡 Tips

1. **Always check debug_log.md first** - avoid repeating failed attempts
2. **Use TodoWrite** for progress tracking
3. **Record everything** in debug_log.md during debugging
4. **Update TESTING_CHECKLIST.md** as you test
5. **Add new learnings** to LEARNINGS.md

---

**Session Date:** 2025-12-17
**Previous Session:** Created navigation docs + testing checklist
**Next Step:** Start testing features in Telegram
