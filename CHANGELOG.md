# Changelog

All notable changes to this project will be documented in this file.

## [1.5.0] - 2025-12-22

### Session State Architecture - Automatic Context Isolation

**Problem:** Multi-step commands like `/welcome` suffered from input context pollution. Inject Context only detected `/welcome` on the FIRST message. When user answered "да" (confirmation), old database values leaked through, confusing the AI.

**Solution:** Implemented automatic session state tracking in Supabase + workflow.

### Added

**Database (Supabase):**
- `user_sessions` table - tracks active commands per user
- `get_user_session()` RPC - retrieves session with auto-cleanup
- `start_user_session()` RPC - creates/updates session on command start
- `end_user_session()` RPC - clears session on completion
- Auto-expiry after 1 hour

**Workflow Changes:**
- **Inject Context** - Now calls session RPC to detect active commands
  - If session exists → excludes old database values automatically
  - If new command (`/`) → starts new session
  - Works for ANY command, not just `/welcome`

**Documentation:**
- `projects/foodtracker/AI_PROMPT.md` - AI prompt with WHY annotations
- `projects/foodtracker/ARCHITECTURE.md` - Node→RPC→Database mapping

### Changed

- **AI Agent Prompt:** 13K → 5K characters (62% reduction)
  - Removed MEMORY OVERRIDE section (no longer needed)
  - Removed INPUT CONTEXT OVERRIDE section (handled by session state)
  - Added simple "Session Mode Detection" section
- **ARCHITECTURE.md:** Updated PROPOSAL section to IMPLEMENTED

### Technical Details

**Session State Flow:**
```
1. User: /welcome
   → start_user_session(telegram_id, '/welcome')
   → Output: {telegram_user_id, session_mode: '/welcome'}

2. User: "Сергей" (answer)
   → get_user_session() returns active session
   → Output: {telegram_user_id, session_mode: '/welcome'}
   → NO old database values passed

3. User: "да" (confirm)
   → Session still active
   → AI saves data successfully
   → Session auto-expires in 1 hour
```

### Impact

- **Eliminates prompt workarounds** - No more "COMPLETELY IGNORE" hacks
- **Works for all commands** - Not just `/welcome`
- **Smaller prompt** - 62% reduction in AI prompt size
- **Automatic cleanup** - Sessions expire after 1 hour

**Source:** FoodTracker Technical Debt P1 implementation

---

## [1.4.0] - 2025-12-22

### 🔍 Post-Mortem Analysis: Debug Quality Gates

**Problem:** FoodTracker `/welcome` command took 18 debugging cycles over 2 days due to systemic process failures, not technical complexity.

**Root Causes Identified:**
- 61% of cycles: Cascading fixes (each fix created new bug)
- 22% of cycles: No E2E testing before deploy
- 11% of cycles: No schema verification before migrations
- 6% of cycles: No LEARNINGS.md consultation

**Solution:** Implemented comprehensive Debug Quality Gates system.

### Added

**New Section in CLAUDE.md: Debug Quality Gates**
- Pre-Deploy Checklist (5 mandatory checks before any deploy)
- Anti-Cascade Rules (never use "COMPLETELY IGNORE" without exceptions)
- Incremental Change Protocol (one change at a time)
- User Communication Template (structured deploy message)
- Debug Cycle Hard Limits (rollback at cycle 6+)
- Rollback Triggers (4 mandatory rollback conditions)

**New Learnings:**
- **L-105:** Never Use "COMPLETELY IGNORE" in AI Prompts
  - Broad override instructions cause AI to ignore required data
  - Always specify explicit exceptions for required fields
  - Impact: CRITICAL
- **L-104:** Debug Quality Gates Prevent Cascading Fixes
  - Pre-deploy checklist can reduce debug cycles by 60%+
  - Schema verification, data flow mapping, E2E simulation
  - Impact: HIGH

**New Documentation:**
- `projects/foodtracker/POST_MORTEM.md` - Complete analysis of 18-cycle disaster
  - Timeline analysis (all 18 cycles documented)
  - Pattern analysis (5 systemic problems identified)
  - Technical debt section (4 unresolved issues)
  - Priority matrix for future improvements

### Changed

- **CLAUDE.md:** Added 100+ lines of Debug Quality Gates section
- **learning/INDEX.md:** Added L-104, L-105 entries, updated statistics (53+ entries, 13 critical issues)
- **learning/LEARNINGS.md:** Added 80+ lines for L-104, L-105 entries

### Technical Debt Identified

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| Session State Architecture | HIGH | 4h | P1 |
| E2E Test Script | HIGH | 6h | P1 |
| Health Check Monitoring | MEDIUM | 2h | P2 |

### Impact

- **Minimum cycles possible:** 7 (vs 18 actual) = 60% reduction potential
- **Time saved with quality gates:** ~6 hours per complex debugging session
- **New anti-patterns documented:** "COMPLETELY IGNORE" in AI prompts

**Source:** FoodTracker `/welcome` debugging session (Dec 19-20, 2025)

---

## [1.3.0] - 2025-12-17

### Added
- **Indexed Learning System** - Complete redesign of knowledge management
  - `learning/INDEX.md` - Index with line numbers (185 lines, ~500 tokens)
  - `learning/LEARNINGS.md` - All knowledge in one file (1,326 lines, all English)
  - `learning/N8N-RESOURCES.md` - External resources
  - `learning/archive/` - Backup of old files
- **L-009** - AI Agent tool optional parameters need nullable types (toolHttpRequest)
- Learning System section in CLAUDE.md with read/write protocols
- Quick access by line numbers (e.g., Switch Node → Line 517)
- Documentation: LEARNING_SYSTEM_SIMPLE.md and LEARNING_SYSTEM_IMPLEMENTATION.md

### Changed
- All learning system instructions now in English
- Moved from multiple files to single indexed file approach
- Updated all CLAUDE.md references: LEARNINGS.md → learning/INDEX.md
- Anti-Loop Protocol now uses learning/INDEX.md
- Debug Session Protocol now uses learning/INDEX.md

### Removed
- `/LEARNINGS.md` (root) - Merged into learning/LEARNINGS.md
- Agent-specific knowledge (~60% of old content):
  - Agent Standardization
  - L-105 to L-096 (Orchestrator, Builder, QA processes)
  - Phase 5, validation gates, escalation protocols
  - Git & GitHub agent-specific content

### Performance
- **99.7% token reduction**: 900 tokens per query vs 330K full files
- Read protocol: INDEX (500 tokens) + targeted section (400 tokens) = 900 tokens
- Write protocol: Add entries at TOP of categories (newest first)

### Technical Details
- **Sources merged**: Current LEARNINGS.md + filtered OLD file + n8n patterns
- **Filtering**: Removed Orchestrator, Builder, QA, Phase 5, agent processes
- **Structure**: One file + index with line numbers for targeted reads
- **Format**: All entries with Problem/Solution/Prevention/Tags structure

---

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
