# FoodTracker Project Folder

Quick navigation for this workflow project.

---

## 📂 Files in This Folder

### Core Files
- **PROJECT_STATE.md** - Current workflow state, what works, what doesn't
- **NAVIGATION.md** - ⭐ Where everything is (MultiBOT vs N8NClaudeLong)
- **SESSION_BRIEF.md** - 📋 Copy-paste this to new Claude session
- **debug_log.md** - 🐛 Track debugging attempts (Anti-Loop Protocol)

### Testing
- **TESTING_CHECKLIST.md** - 18 test cases for Task 2.6.5

---

## 🚀 Quick Start

### Starting New Session

```bash
# 1. Pass this to new Claude:
Read projects/foodtracker/SESSION_BRIEF.md

# 2. Claude will read:
# - NAVIGATION.md (where things are)
# - PROJECT_STATE.md (current state)
# - TESTING_CHECKLIST.md (what to test)
# - debug_log.md (what was tried)
```

### During Work

```bash
# Check current state
Read projects/foodtracker/PROJECT_STATE.md

# Before debugging: check what was tried
Read projects/foodtracker/debug_log.md

# Track attempts (avoid loops)
Edit projects/foodtracker/debug_log.md

# Update test results
Edit projects/foodtracker/TESTING_CHECKLIST.md
```

---

## 🔗 External Resources

### Main Project
```
~/Projects/MultiBOT/bots/food-tracker/
├── TODO.md              # Master task list
├── PLAN.md              # 6.5-week plan
└── tasks/               # Detailed specs
```

### Shared Knowledge
```
~/Projects/N8NClaudeLong/
├── CLAUDE.md            # Instructions for Claude
└── LEARNINGS.md         # Shared learnings
```

---

## 📋 Current Task

**Task 2.6.5 - Advanced Features & UX Testing**

**Status:** Implementation complete, testing in progress

**Features to Test:**
1. Timezone Management
2. Monthly Report `/month`
3. Interactive Reports
4. Meal Management
5. Welcome Flow `/welcome`

See `TESTING_CHECKLIST.md` for details.

---

## 🎯 Workflow Info

- **ID:** sw3Qs3Fe3JahEbbW
- **URL:** https://n8n.srv1068954.hstgr.cloud/workflow/sw3Qs3Fe3JahEbbW
- **Version:** v288+
- **Nodes:** 56

---

**Last Updated:** 2025-12-17
**Next:** Start testing in Telegram
