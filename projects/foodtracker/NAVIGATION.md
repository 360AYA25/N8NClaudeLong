# FoodTracker - Navigation Guide

Quick reference: where everything is located for this project.

---

## 🗂️ Project Locations

### Main Project (Full Documentation)
```
📁 ~/Projects/MultiBOT/bots/food-tracker/
├── TODO.md                  # ⭐ Master task list (Phase 2 complete, Phase 3 next)
├── PLAN.md                  # 6.5-week timeline
├── TIMEZONE-IMPLEMENTATION.md
├── tasks/                   # Detailed specs for each task
│   ├── task-2.3-memory/
│   ├── task-2.4-ai-agent/
│   ├── task-2.5-testing/
│   └── task-2.6-ux-polish/
│       ├── PHASE_REPORT_2025-12-09.md
│       └── DAY-2-BARCODE-SCANNER.md
└── docs/                    # Architecture, specs, guides
```

### Working Project (This repo)
```
📁 ~/Projects/N8NClaudeLong/
├── CLAUDE.md                # Instructions for Claude
├── LEARNINGS.md             # Shared knowledge base
└── projects/foodtracker/    # ⭐ THIS FOLDER
    ├── PROJECT_STATE.md     # Current state (you are here)
    └── NAVIGATION.md        # This file
```

---

## 🔧 n8n Workflow

### Main Workflow
- **ID:** `sw3Qs3Fe3JahEbbW`
- **Name:** FoodTracker
- **Version:** v288 (production ready)
- **URL:** https://n8n.srv1068954.hstgr.cloud/workflow/sw3Qs3Fe3JahEbbW
- **Status:** Active, 56 nodes

### Related Workflows
- **Daily Memory Cleanup:** `MFci734AMQOTWr4N`
- **Daily Report:** `YcdWzCp5LUvz55Mi` (archived)

---

## 📚 Where to Find Things

### Current Task Status
```bash
# ⭐ ALWAYS CHECK HERE FIRST
~/Projects/MultiBOT/bots/food-tracker/TODO.md
```

### Specifications & Plans
```bash
# Task specs (detailed instructions)
~/Projects/MultiBOT/bots/food-tracker/tasks/task-2.6.5-advanced-features/

# 6.5-week plan
~/Projects/MultiBOT/bots/food-tracker/PLAN.md
```

### Technical Details
```bash
# Database schema
~/Projects/MultiBOT/supabase_schema_full.md

# Architecture docs
~/Projects/MultiBOT/bots/food-tracker/docs/

# Phase reports
~/Projects/MultiBOT/bots/food-tracker/tasks/*/COMPLETION-REPORT.md
```

### Learnings & Gotchas
```bash
# Shared knowledge (n8n, workflows, bugs)
~/Projects/N8NClaudeLong/LEARNINGS.md

# MultiBOT specific learnings
~/Projects/MultiBOT/bots/food-tracker/tasks/*/SIMPLE-INSTRUCTION.md
```

---

## 🎯 Current Task: Task 2.6.5 - Advanced Features & UX

**Status:** ✅ Mostly complete, needs testing

**What to Test:**

### 1. Timezone Management
- [ ] Test `/timezone` command
- [ ] Set timezone to different cities
- [ ] Verify local time in responses
- [ ] Check `foodtracker_users.timezone` column

### 2. Monthly Report `/month`
- [ ] Test `/month` command
- [ ] Verify 30-day summary
- [ ] Check trends and averages
- [ ] Validate macros display

### 3. Interactive Reports
- [ ] Ask AI questions about reports
- [ ] "почему я не достиг цели?"
- [ ] "какие тенденции?"
- [ ] Verify AI analyzes data

### 4. Meal Management
- [ ] Add meal: "Добавить блюдо Борщ: свекла 100г, капуста 50г"
- [ ] Break down meal: "Разобрать пиццу на ингредиенты"
- [ ] Edit meal: "Изменить блюдо Борщ: +картофель 80г"
- [ ] Check `user_meals` table in DB

### 5. Welcome Flow `/welcome`
- [ ] Test `/welcome` command
- [ ] Answer all onboarding questions
- [ ] Verify data saved to `foodtracker_users`
- [ ] Re-run to update profile

---

## 🔍 How to Debug

### Check Workflow Execution
```javascript
// Get recent executions
n8n_executions({
  action: "list",
  workflowId: "sw3Qs3Fe3JahEbbW",
  limit: 10
})

// Get execution details (2-step for >10 nodes)
n8n_executions({
  action: "get",
  id: "execution-id",
  mode: "summary"  // Step 1: overview
})

n8n_executions({
  action: "get",
  id: "execution-id",
  mode: "filtered",
  nodeNames: ["problem-node"],
  itemsLimit: -1   // Step 2: details
})
```

### Check Database
```sql
-- User data
SELECT * FROM foodtracker_users WHERE telegram_user_id = USER_ID;

-- Recent entries
SELECT * FROM foodtracker_entries WHERE user_id = USER_ID ORDER BY created_at DESC LIMIT 10;

-- User meals
SELECT * FROM user_meals WHERE user_id = USER_ID;

-- Conversation memory
SELECT * FROM n8n_chat_histories WHERE session_id = 'USER_ID' ORDER BY created_at DESC LIMIT 10;
```

### Check Telegram Bot
```bash
# Test in Telegram: @FoodTrackerBot (or your bot name)
# Commands:
/start
/help
/day
/week
/month
/timezone
/welcome
```

---

## 🚨 Common Issues & Solutions

### Issue: Command not working
**Check:**
1. Is workflow active? (`n8n_get_workflow`)
2. Recent execution errors? (`n8n_executions`)
3. AI Agent tool configured? (read workflow structure)

### Issue: Data not saving
**Check:**
1. Supabase RPC function exists?
2. User registered in `foodtracker_users`?
3. Execution logs show success?

### Issue: Wrong timezone
**Check:**
1. User's timezone in DB: `SELECT timezone FROM foodtracker_users WHERE telegram_user_id = X`
2. Inject Context node calculates correctly?
3. SYSTEM prefix includes date/time?

---

## 📋 Quick Commands

```bash
# Start work session
cd ~/Projects/N8NClaudeLong
Read projects/foodtracker/PROJECT_STATE.md
Read ~/Projects/MultiBOT/bots/food-tracker/TODO.md

# Check workflow
n8n_get_workflow({id: "sw3Qs3Fe3JahEbbW", mode: "structure"})

# Test execution
n8n_test_workflow({workflowId: "sw3Qs3Fe3JahEbbW", data: {...}})

# Update TODO after testing
Edit ~/Projects/MultiBOT/bots/food-tracker/TODO.md
```

---

## 🔗 External Resources

- **n8n Instance:** https://n8n.srv1068954.hstgr.cloud
- **Supabase Dashboard:** (check credentials)
- **Telegram Bot:** @FoodTrackerBot (or your bot)
- **OpenFoodFacts API:** https://world.openfoodfacts.org/api/v0/product/{barcode}.json

---

**Last Updated:** 2025-12-17
**Current Phase:** Testing Task 2.6.5 features
**Next:** Complete testing → Phase 3 Production Ready
