# Changelog

All notable changes to this project will be documented in this file.

## [1.2.0] - 2025-12-17

### 📁 Project Organization System

**Problem:** No structured way to manage multiple workflow projects, files scattered, hard to switch context between workflows.

**Solution:** Implemented project folder system with complete documentation and automation.

**New Directory Structure:**
```
projects/
├── README.md              # Organization guide
└── foodtracker/           # Example: FoodTracker workflow project
    ├── PROJECT_STATE.md   # Current workflow state
    ├── NAVIGATION.md      # Where everything is located
    ├── SESSION_BRIEF.md   # Quick start for new Claude sessions
    ├── TESTING_CHECKLIST.md # 18 test cases for Task 2.6.5
    ├── debug_log.md       # Debug journal (Anti-Loop tracking)
    └── README.md          # Project overview
```

**Files Created:**
- `projects/README.md` - Organization guide for all workflow projects
- `projects/foodtracker/PROJECT_STATE.md` - FoodTracker workflow state (56 nodes, v288)
- `projects/foodtracker/NAVIGATION.md` - Complete navigation guide (MultiBOT vs N8NClaudeLong, workflow info, debugging, resources)
- `projects/foodtracker/SESSION_BRIEF.md` - Copy-paste brief for new Claude sessions
- `projects/foodtracker/TESTING_CHECKLIST.md` - 18 test cases for Task 2.6.5 (Advanced Features & UX)
- `projects/foodtracker/debug_log.md` - Debug journal with Anti-Loop metrics
- `projects/foodtracker/README.md` - Project folder overview

**Files Modified:**
- `CLAUDE.md` - Added MANDATORY debug_log.md automation (+62 lines)
  - Шаг 0: Check debug_log.md FIRST (MANDATORY)
  - Шаг 3: Record start BEFORE attempting fix
  - After each attempt: Update result (✅/❌/⚠️)
  - On completion: Mark as resolved + add to LEARNINGS.md
- `Docs/SESSION_INIT_GUIDE.md` - Added Шаг 0: Create project folder (+28 lines)
  - Project folder structure
  - Benefits of isolation
  - Updated examples with projects/ path
  - Updated Quick Commands
  - Updated file tree diagram

**New Features:**

| Feature | Description |
|---------|-------------|
| **Project Isolation** | One workflow = one folder in `projects/` |
| **Automatic Debug Logging** | Claude now auto-records all debug attempts in debug_log.md |
| **Session Continuity** | SESSION_BRIEF.md transfers full context to new Claude sessions |
| **Testing Framework** | Pre-built checklist with 18 test cases for features |
| **Navigation System** | Clear mapping of MultiBOT (docs) vs N8NClaudeLong (work) |

**Anti-Loop Enhancement:**

New MANDATORY steps in Debug Session Protocol:
1. **Шаг 0:** Read `debug_log.md` FIRST (check previous attempts)
2. **Шаг 3:** Write to `debug_log.md` BEFORE attempting fix
3. **After each attempt:** Update `debug_log.md` with result
4. **On completion:** Mark as resolved, add to LEARNINGS.md if new solution

**Impact:**
- Clear project organization (no more scattered files)
- Easy context switching between workflows
- Automated debug tracking (prevents loops)
- New sessions start with full context (SESSION_BRIEF.md)
- Reproducible testing (TESTING_CHECKLIST.md)

**Example Workflow:**
```bash
# New session starts
Read projects/foodtracker/SESSION_BRIEF.md

# Claude automatically:
1. Reads debug_log.md (previous attempts)
2. Records new attempts in debug_log.md
3. Updates results after each try
4. Marks resolved when fixed
5. Adds to LEARNINGS.md if new solution
```

**Source:** FoodTracker workflow project initialization

---

## [1.1.0] - 2025-12-17

### 🔄 Anti-Loop System (from ClaudeN8N analysis)

**Problem:** При работе над длинными workflow происходит зацикливание - повторение одних и тех же решений, потеря рабочего состояния, бесконечные попытки без прогресса.

**Solution:** Внедрена система предотвращения зацикливания на основе анализа проекта ClaudeN8N (82 learnings, 7,630 строк).

**Files Created:**
- `LEARNINGS.md` - База знаний с 15 critical learnings (342 строки)

**Files Modified:**
- `CLAUDE.md` - Добавлено 286 строк (+Anti-Loop Protocol, Debug Session Protocol, Session Start Checklist, Critical Node Configurations)

**New Features:**

| Механизм | Описание |
|----------|----------|
| **Anti-Loop Protocol** | Context Injection ("ALREADY TRIED"), Cycle Limits (max 6 попыток) |
| **Debug Session Protocol** | Checkpoints через n8n_workflow_versions, изоляция изменений |
| **Session Start Checklist** | Чеклист начала работы над workflow |
| **LEARNINGS.md** | База знаний с Quick Index, Grep для поиска решений |
| **L-067 Integration** | Two-step execution для workflow >10 nodes |
| **Critical Node Configs** | Quick Reference для Set, IF, HTTP, addConnection |

**Key Learnings Included:**
- L-067: Two-step execution for large workflows
- L-068: IF nodes don't pass binary data
- L-100: Telegram node doesn't support Reply Keyboard
- L-101: Credential expression in URL not resolved
- L-102: Cascading changes - test after EACH change
- L-104: Code Node correct data access syntax
- addConnection requires 4 string params + branch for IF

**Impact:**
- Предотвращение бесконечных циклов (hard cap 6 попыток)
- Накопление решений между сессиями (LEARNINGS.md)
- Быстрый откат к рабочему состоянию (checkpoints)
- Context Injection форсирует новые подходы

**Source:** Анализ /Users/sergey/Projects/ClaudeN8N

---

## [1.0.1] - 2025-12-17

### 🔒 Security Fix

**Problem:** API credentials exposed in git repository
**Solution:** Removed .mcp.json from tracking, created template file
**Files Modified:** .gitignore, .mcp.json.example, CHANGELOG.md
**Impact:** Credentials now properly secured, users must create their own .mcp.json

**IMPORTANT:** If you cloned this repository, rotate your n8n API key immediately at your n8n instance settings.

## [1.0.0] - 2025-12-16

### 🚀 Initial Release

**Problem:** No integrated n8n-mcp solution for Claude Code CLI
**Solution:** Created wrapper project with optimized configuration
**Files Modified:** All project files
**Impact:** 543+ n8n nodes accessible via 20 MCP tools

### Features
- n8n-mcp v2.30.0 integration
- 20 MCP tools for workflow management (documentation, CRUD, execution, version control)
- Complete documentation (README.md, FEATURES.md, CLAUDE.md)
- Optimized environment configuration
- Safety guidelines and best practices
- 2,709+ workflow templates accessible
- 99% node property coverage
