# FoodTracker Project

**Workflow ID:** sw3Qs3Fe3JahEbbW
**Nodes:** 56 | **Status:** Production

---

## Files (Read-Before / Update-After Pattern)

### Critical Documentation

| File | Read BEFORE | Update AFTER confirmed |
|------|-------------|------------------------|
| **workflow_v136_canonical.json** | Rollback needed | Never (canonical snapshot) |
| **WORKFLOW_SNAPSHOT.md** | Restore workflow | Snapshot created |
| **SUPABASE_SCHEMA.md** | DB/RPC changes | Schema changes |
| **AI_PROMPT.md** | AI Agent changes | Prompt changes |
| **ARCHITECTURE.md** | Workflow structure | Structure changes |

### State & Tracking

| File | Purpose |
|------|---------|
| **PROJECT_STATE.md** | Current state, what works/doesn't |
| **debug_log.md** | Debug attempts (Anti-Loop) |
| **POST_MORTEM.md** | Analysis of past issues |

### Session Files

| File | Purpose |
|------|---------|
| **SESSION_BRIEF.md** | Copy to new Claude session |
| **NAVIGATION.md** | Where everything is |
| **TESTING_CHECKLIST.md** | Test cases |
| **COMMAND_STATUS.md** | Command implementation status |

---

## Quick Start

### New Session
```javascript
// 1. State
Read("projects/foodtracker/PROJECT_STATE.md")

// 2. Knowledge base
Read("learning/INDEX.md")  // Find relevant section
Read("learning/LEARNINGS.md", {offset: LINE, limit: 50})

// 3. Workflow versions
n8n_workflow_versions({mode: "list", workflowId: "sw3Qs3Fe3JahEbbW", limit: 3})
```

### Before Changes
```javascript
// DB/Tool changes
Read("projects/foodtracker/SUPABASE_SCHEMA.md")
Read("projects/foodtracker/ARCHITECTURE.md")

// AI Agent changes
Read("projects/foodtracker/AI_PROMPT.md")
```

### During Debug
```javascript
// Check what was tried
Read("projects/foodtracker/debug_log.md")

// Record attempts (Anti-Loop)
Edit("projects/foodtracker/debug_log.md", ...)
```

---

## Shared Knowledge

```
~/Projects/N8NClaudeLong/
├── CLAUDE.md                    # Main prompt + protocols
├── learning/
│   ├── INDEX.md                 # Quick lookup (~500 tokens)
│   └── LEARNINGS.md             # Full knowledge (1,500+ lines)
└── Docs/
    └── SESSION_INIT_GUIDE.md    # How to start sessions
```

---

## External Resources

```
~/Projects/MultiBOT/bots/food-tracker/
├── TODO.md              # Master task list
├── PLAN.md              # Development plan
└── tasks/               # Detailed specs
```

---

*Last Updated: 2025-12-22*
