# Changelog

All notable changes to this project will be documented in this file.

## [1.12.0] - 2025-12-23

### AI Agent Prompt Writing Protocol (L-113) - Token Economy

**Problem:** Claude Code writes verbose AI prompts with 4x token waste. AI_PROMPT.md was well-written (98 lines, ~2.5K tokens), but Claude's verbose version had 400+ lines (~10K+ tokens) with dialogue rehearsals, "why" explanations, human checklists, and reference data AI already knows.

**Root Cause:** No rules for writing token-efficient AI prompts. Claude treats prompts like documentation for humans, not instructions for AI.

**Solution:** Mandatory token economy protocol with writing rules and examples.

### Added

**New Section in CLAUDE.md:**
- AI Agent Prompt Writing (L-113) - after Important Rules
- The Problem: Verbose prompt patterns with 4x waste
- The Solution: 6 core rules (imperatives only, lists not paragraphs, syntax examples, no human formatting, single source, no redundant knowledge)
- Mandatory Rules table (5 rules with before/after examples)
- Good vs Bad Examples (3 comparisons: dialogue rehearsals, redundant knowledge, human checklists)
- Token Economy Reference (max sizes, test criteria)
- Writing Checklist (6 questions before saving)

**New Entry in learning/LEARNINGS.md:**
- L-113: AI Agent Prompt Token Economy (4x Waste)
- Problem with impact analysis
- 6 waste sources (dialogue rehearsals, "why" explanations, human checklists, reference data, duplicate rules, verbose examples)
- Solution: 6 token-efficient prompt rules
- Before/after examples (dialogue 15→5 lines, reference data 7→1 line)
- Prevention rules (max 400 lines, ≤3 line examples, test criteria)
- Tags: #ai-prompt #token-economy #critical

**New Section in learning/CODE_EXAMPLES.md:**
- AI Prompt Writing (L-113)
- ❌ BAD patterns: 4 examples with explanations
- ✅ GOOD patterns: 4 token-efficient alternatives
- Writing Checklist with 6 checkpoints

### Changed

**learning/INDEX.md:**
- Added L-113 to Critical Issues table (1st position - BEFORE writing AI_PROMPT.md)
- Updated By Category: Critical Patterns now 6 entries (was 5), added L-113 to topics
- Added L-113 to By Learning ID table (CRITICAL impact)
- Added new tags: #ai-prompt, #token-economy
- Updated statistics: 60 entries (was 59), 18 critical (was 17)
- Updated all line numbers (+66 shift from L-113 insertion)
- Added "AI Prompt Writing" to Quick Access Paths

### Impact

**Before:** Claude writes 400+ line prompts with dialogue examples, checklists, reference data → 4x token waste

**After:** Token-efficient prompts with imperatives, minimal examples, no redundancy → 98 lines (~2.5K tokens) ✅

### Token Savings

- **Dialogue rehearsals:** 15 lines → 5 lines (10 lines saved)
- **Reference data:** 7 lines → 1 line (6 lines saved)
- **Checklists:** 5 lines → 1 line (4 lines saved)
- **Total reduction:** ~400 lines → ~100 lines (75% token reduction)

### Writing Rules

1. **Imperatives ONLY** - Use MUST/NEVER/ALWAYS
2. **Lists not paragraphs** - Bullet points only
3. **Syntax examples** - 1-3 lines, no dialogues
4. **No human formatting** - Skip checklists/tables
5. **Single source** - Don't repeat rules
6. **No redundant knowledge** - AI knows common facts

---

## [1.11.0] - 2025-12-23

### Node Modification Protocol (L-112) - DOT NOTATION Enforcement

**Problem:** Claude's `updateNode` with nested objects caused catastrophic 20KB data loss (v134: 134KB → 114KB). Using `updates: { parameters: { field: "..." } }` REPLACES entire parameters object instead of merging.

**Root Cause:** Shallow merge behavior in `n8n_update_partial_workflow`. Nested objects replace, don't merge.

**Solution:** Mandatory DOT NOTATION protocol with pre/post size verification.

### Added

**New Section in CLAUDE.md:**
- 🔴 Node Modification Protocol (MANDATORY - L-112) - after Batch Operations
- The Problem: Nested objects example with 20KB loss
- The Solution: DOT NOTATION examples
- Mandatory Rules table (DOT NOTATION, size checks, rollback triggers)
- Pre-Update Checklist (get size, record, use dot notation)
- Post-Update Verification (size check, rollback if decreased)
- DOT NOTATION Examples table (5 common cases)
- Reference to Protected Nodes in ARCHITECTURE.md

**New Entry in learning/LEARNINGS.md:**
- L-112: DOT NOTATION Required for updateNode (Catastrophic Fix)
- Problem description with code example
- Root cause explanation
- DOT NOTATION solution with examples table
- Mandatory verification steps (4-step checklist)
- Prevention rules
- Tags: #critical #mcp #updateNode #dot-notation #catastrophic #data-loss

**New Section in projects/foodtracker/ARCHITECTURE.md:**
- Protected Nodes (L-112)
- High-Risk Nodes table (AI Agent, Inject Context, OpenAI Model, Memory)
- Medium-Risk Nodes table (Switch, Check User, Process Text)
- Modification Checklist (size check workflow)
- Size History reference table (v133→v134→v136)

**New Section in learning/CODE_EXAMPLES.md:**
- DOT NOTATION for updateNode (L-112 CRITICAL)
- Wrong (CATASTROPHIC) example with warning
- Correct (DOT NOTATION) example
- 5 common field examples (AI prompt, HTTP URL, options, code, multiple fields)

### Changed

**learning/INDEX.md:**
- Added L-112 to Critical Issues table (2nd position after L-110)
- Added L-112 to By Learning ID table
- Added new tags: #dot-notation, #updateNode
- Updated statistics: 59 entries (was 58), 17 critical (was 16)
- Updated #critical tag line numbers to include 214

### Impact

**Before:** Nested objects in `updates` → 20KB data deletion → bot completely broken → manual rollback at 3AM

**After:** DOT NOTATION mandatory → size verification → automatic rollback → isolated field changes only

### Protection Layers

1. **CLAUDE.md** - Protocol with mandatory rules and examples
2. **LEARNINGS.md** - L-112 entry with detailed explanation
3. **ARCHITECTURE.md** - Protected Nodes list with size history
4. **CODE_EXAMPLES.md** - Copy-paste DOT NOTATION examples
5. **INDEX.md** - Quick lookup (line 214, critical issue #2)

---

## [1.10.0] - 2025-12-22

### debug_log.md Protocol - MANDATORY Enforcement

**Problem:** Claude not reading/updating debug_log.md despite having rules. Last entry was 3 days ago. User working since 03:00 on same issues with nothing recorded.

**Root Cause:** Rules existed but not prominent - easy to skip during session start.

**Solution:** Made debug_log.md IMPOSSIBLE to miss.

### Added

**New Section in CLAUDE.md (Line 3):**
- 🔴 MANDATORY: Debug Log Protocol - placed BEFORE Core Principles
- Session Start (ALWAYS): Read debug_log.md first
- Before EVERY Fix: Record attempt in debug_log.md
- After EVERY Change: Update with ✅/❌/⚠️ result
- "Why This Exists" explanation (18 cycles, 2 days example)

**Session Start Checklist:**
- 🔴 Read debug_log.md FIRST - added as first row in both columns
- CRITICAL warning: "shows what was already tried"

### Changed

- **CLAUDE.md:**
  - Project structure: debug_log.md changed from "Optional" to "🔴 MANDATORY"
  - Moved to TOP of file list (before PROJECT_STATE.md)

- **SESSION_INIT_GUIDE.md:**
  - New Шаг 1: "Read debug_log.md ПЕРВЫМ ДЕЛОМ" (was Шаг 2)
  - All subsequent steps renumbered (2→3, 3→4, etc.)
  - Added "Why This Exists" section with memory loss explanation

- **projects/foodtracker/debug_log.md:**
  - Added entry for 2025-12-22 session (schema system + debug_log enforcement)

### Impact

**Before:** Easy to skip debug_log.md → repeat same mistakes → hours wasted
**After:** FIRST thing in checklist → impossible to miss → track all attempts

---

## [1.9.0] - 2025-12-22

### AI Prompt Documentation System

**Problem:** AI Agent prompts were modified without understanding WHY each section exists, leading to cascading errors and broken tool calls.

**Solution:** Added AI_PROMPT.md to mandatory read/update workflow alongside SUPABASE_SCHEMA.md.

### Added

**New Rules in CLAUDE.md:**
- **AI_PROMPT.md to Workflow Modification Rule** - Read before AI Agent changes
- **AI_PROMPT.md to Pre-Deploy Checklist** - Check WHY annotations
- Same read-before/update-after pattern as SUPABASE_SCHEMA.md

### Changed

- **Docs/SESSION_INIT_GUIDE.md** - Complete rewrite:
  - Added Learning System section (INDEX.md + LEARNINGS.md)
  - Added SUPABASE_SCHEMA.md verification step
  - Added AI_PROMPT.md verification step
  - Added "Key Documentation Files" table (when to read/update)
  - Updated Quick Commands with new workflow
  - Added file structure diagram with all current files

### Documentation Files Pattern

| File | Read Before | Update After Confirmed |
|------|-------------|------------------------|
| SUPABASE_SCHEMA.md | DB changes | DB schema changes |
| AI_PROMPT.md | AI Agent changes | Prompt changes |
| ARCHITECTURE.md | Workflow structure | Structure changes |

---

## [1.8.0] - 2025-12-22

### Project-Specific Database Schema System

**Problem:** Claude didn't have access to project-specific database schema when working on workflow changes. This caused errors when modifying tools/RPC functions without knowing actual DB structure.

**Solution:** Added mandatory schema verification workflow with project-specific documentation.

### Added

**New File:**
- `projects/foodtracker/SUPABASE_SCHEMA.md` - Complete database schema
  - All 9 tables with columns, types, defaults
  - Foreign key relationships diagram
  - RLS security model
  - All RPC functions with signatures
  - Workflow data flow diagram

**New Rules in CLAUDE.md:**
- **Workflow Modification Rule** - 5 steps BEFORE + update rules AFTER
- **Pre-Deploy Checklist** - Added "Dependencies" check with schema reference
- Schema updates ONLY after fix is CONFIRMED working

### Changed

- **CLAUDE.md Pre-Deploy Checklist:**
  - Added Dependencies row: `Read(SUPABASE_SCHEMA.md)` + `ARCHITECTURE.md`
  - Schema check now references specific file

- **projects/foodtracker/ARCHITECTURE.md:**
  - Added SUPABASE_SCHEMA.md to Related Files (first position)

### Workflow Modification Rule

```
BEFORE adding/changing Tool or Command:
1. Read SUPABASE_SCHEMA.md - полная схема БД
2. Read ARCHITECTURE.md - связи workflow
3. Check RPC functions table
4. Verify table + columns exist
5. Check what depends on it

AFTER fix CONFIRMED:
- Update SUPABASE_SCHEMA.md if DB changed
- Update ARCHITECTURE.md if workflow changed
```

### Impact

- **Prevents schema mismatch errors** - Claude verifies DB structure before changes
- **Single source of truth** - One file per project with complete schema
- **Update discipline** - Schema docs only updated after verified fixes

---

## [1.7.0] - 2025-12-22

### ⚠️ MAJOR: CLAUDE.md Token Optimization (47% reduction)

**Problem:** CLAUDE.md loaded ~10K tokens on EVERY request, costing ~$0.09/request in input tokens.

**Solution:** Extracted code examples to separate file, consolidated verbose sections into compact tables.

### Changed

**CLAUDE.md - MAIN PROMPT FILE MODIFIED:**
- **Before:** 1,048 lines, 33,060 chars (~10K tokens)
- **After:** 560 lines, 21,268 chars (~6K tokens)
- **Reduction:** 47% lines, 36% chars, ~40% tokens

**Sections consolidated:**
- Pre-Deploy Checklist → compact table (35 lines → 7 lines)
- Anti-Cascade Rules + Incremental Change → single-line rules
- User Communication Template → one-line format description
- addConnection Syntax → 2 examples + reference (90 lines → 15 lines)
- Debug Session steps → compact table (55 lines → 15 lines)
- Execution Analysis → decision table (30 lines → 8 lines)
- Learning System → compact protocol (50 lines → 15 lines)
- WebSearch Templates → reference to CODE_EXAMPLES.md (15 lines → 1 line)
- Entry Format → reference to CODE_EXAMPLES.md (18 lines → 1 line)

### Added

**New Files:**
- `Docs/PROCESS_FLOWCHART.md` - Visual diagram of when each protocol triggers
  - Master Decision Tree (task type → protocol mapping)
  - Workflow Process flow (building steps)
  - Debug/Fix Protocol with Escalation levels
  - Pre-Deploy Checklist diagram
  - Trigger table for quick reference

- `learning/CODE_EXAMPLES.md` - All extracted code examples
  - Template Search (3+ parallel)
  - addConnection Syntax (correct/wrong formats)
  - Batch Operations
  - Node Configurations (Set, IF, HTTP, Code, Telegram)
  - TodoWrite Structure
  - Debug Session (start steps, during debug)
  - Execution Analysis (L-067 two-step)
  - WebSearch Templates (L3-L5)
  - Debug Log Entry Format
  - Learning Entry Format

### Preserved

**All 13 sections still present in CLAUDE.md:**
1. Core Principles (Silent Execution, Parallel, Templates First, Validation, Defaults, Task Tracking)
2. Workflow Process (8 steps)
3. Critical Warnings (Never Trust Defaults, Example Availability)
4. Validation Strategy (4 levels)
5. Response Format
6. Batch Operations + Connection Syntax
7. Important Rules (Core Behavior, Attribution, Performance, Code Node, Popular Nodes)
8. Debug Quality Gates (POST-MORTEM LESSON)
9. Anti-Loop Protocol with Escalation (L1-L6)
10. Debug Session Protocol
11. Session Start Checklist
12. Learning System
13. Critical Node Configurations

### Rollback

**To restore previous version:**
```bash
git checkout 5db097c -- CLAUDE.md
```

**Previous commit:** `5db097c feat: add mandatory escalation protocol with auto WebSearch`

### Impact

- **Cost per request:** ~$0.09 → ~$0.054 (40% savings)
- **All functionality preserved** - just consolidated format
- **Better maintainability** - code examples in dedicated file
- **Visual reference** - process flowchart for quick lookup

**Source:** User request for CLAUDE.md token optimization

---

## [1.6.0] - 2025-12-22

### Mandatory Escalation Protocol - Auto WebSearch

**Problem:** Claude kept trying same approaches without searching for existing solutions online. 18 debug cycles could have been 7 with earlier internet search.

**Solution:** Replaced "Cycle Limits" with mandatory "Escalation Protocol" that FORCES WebSearch at specific attempts.

### Changed

**CLAUDE.md - Anti-Loop Protocol:**
- Replaced vague "Cycle Limits" with concrete "Escalation Protocol"
- **L1-L2 (attempts 1-3):** Local search (INDEX.md, LEARNINGS.md, N8N-RESOURCES.md)
- **L3 (attempt 4):** MANDATORY `WebSearch("site:community.n8n.io")`
- **L4 (attempt 5):** MANDATORY `WebSearch("site:github.com/n8n-io")` + `site:docs.n8n.io`
- **L5 (attempt 6):** MANDATORY broad WebSearch without site restriction
- **L6 (attempt 7+):** Escalate to user WITH search results
- Added WebSearch templates (copy-paste ready)
- Added reference to `learning/N8N-RESOURCES.md` at protocol start

### Impact

- **WebSearch is no longer optional** - it's MANDATORY at L3-L5
- **User escalation includes search results** - not just "help me"
- **Concrete commands** instead of vague "try alternative approach"
- **Prevents repeated same-approach attempts** by forcing external research

**Source:** User feedback on FoodTracker debugging session

---

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
