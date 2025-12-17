# Learning System Implementation Plan

## 📊 Анализ старых файлов: Что брать, что выбросить

### ❌ АГЕНТСКИЕ ЗНАНИЯ (НЕ нужны - ~60% контента)

**Категории для УДАЛЕНИЯ:**
- `Agent Standardization` (lines 62-169) - про 22 агента, orchestrator
- `L-105, L-103, L-102, L-101, L-100` - Orchestrator, Builder, QA процессы
- `L-069 до L-096` - Agent Frontmatter, Builder MUST, QA MUST, Anti-Hallucination
- `Claude Code` категория - Task tool (не про n8n!)
- `Git & GitHub` - Monorepo, PRs (агентская специфика)
- `Methodology` - L-064, L-065, L-066 в АГЕНТСКОМ контексте

**Почему выбрасываем:**
- Контекст: Orchestrator → Builder → QA → User (роли агентов)
- Процессы: Phase 5, validation gates, escalation protocols
- Инструменты: Agent frontmatter, MCP tool verification
- **Не применимо к Claude Code** (один агент, не система)

### ✅ РЕЛЕВАНТНЫЕ ЗНАНИЯ (НУЖНЫ - ~40% контента)

**n8n технические знания:**
1. **Node Configuration** - Set v3.4, IF v2+, Switch, Code, HTTP Request
2. **MCP Operations** - addConnection (4-param + branch + case), partial updates
3. **Telegram Bot** - L-076 webhooks, L-098 memory, L-099/L-100 Reply Keyboard
4. **Supabase** - Schema, RLS, RPC
5. **Notion** - Filters, dates, properties
6. **AI Agent** - Memory, tools, prompts
7. **Execution Analysis** - L-067 two-step mode (КРИТИЧНО!)
8. **Validation** - validate_node, validate_workflow
9. **Error Handling** - continueOnFail, false positives, L-053, L-054
10. **Code Node** - L-060 deprecated syntax, L-104 data access patterns

**Принципы (переписать без агентов):**
- L-064: Validation Protocol → "Check LEARNINGS before fixing"
- L-065: Dual-Source (execution + config) → "Use both data sources"
- L-066: Search Hierarchy → "LEARNINGS → Templates → Docs → Community"
- L-102: Never Trust Defaults → уже есть в текущем LEARNINGS.md!

**Итого извлечь:**
- ~3,200 строк технических знаний (из 8,200 total)
- ~40% контента релевантен

---

## 🗂️ Новая структура (детально)

```
learning/
  INDEX.md                           # 500 tokens - главный индекс

  quick_ref/                         # 200-300 tokens каждый
    critical_configs.md              # Set ={{, IF conditions, HTTP continueOnFail
    mcp_operations.md                # addConnection 4-param, branch, case
    anti_patterns.md                 # Never Trust Defaults, NO duplicate connections

  nodes/                             # 300-500 tokens каждый
    set_node.md                      # v3.4+ ={{ syntax, manual mode
    if_node.md                       # v2+ conditions array, branch routing, L-068 binary
    switch_node.md                   # Sequential eval, duplicates, case param
    code_node.md                     # L-060 deprecated syntax, L-104 data access
    http_request.md                  # continueOnFail, credentials, L-101
    telegram.md                      # L-076 webhook, L-098 memory, L-099/L-100 keyboard
    supabase.md                      # Schema, RLS, RPC, insert/update
    notion.md                        # Filters, dates, timezone
    ai_agent.md                      # Memory, tools, system prompt

  operations/                        # 300-500 tokens каждый
    connections.md                   # addConnection, branch, case, L-008 duplicates
    partial_updates.md               # n8n_update_partial_workflow, batch ops
    validation.md                    # validate_node, validate_workflow, profiles
    workflow_creation.md             # Template-first, n8n_create_workflow

  debugging/                         # 300-500 tokens каждый
    execution_analysis.md            # L-067 two-step mode (CRITICAL!)
    anti_loop.md                     # Cycle limits, context injection, rollback
    common_errors.md                 # L-053 false positives, L-054 QA override

  patterns/                          # 500-800 tokens каждый
    proven_patterns.md               # From learning/PATTERNS.md (filtered)
    workflow_templates.md            # Template patterns, reusable blocks

  resources/
    n8n_resources.md                 # From learning/N8N-RESOURCES.md (as is)

  archive/                           # Старые файлы
    LEARNINGS_OLD.md                 # learning/LEARNINGS.md → archive
    LEARNINGS_AGENT.md               # /LEARNINGS.md → archive (если нужен backup)
    PATTERNS_OLD.md                  # learning/PATTERNS.md → archive
```

**Размеры файлов:**
- INDEX.md: ~500 tokens
- quick_ref/*: ~200-300 tokens × 3 = ~800 tokens
- nodes/*: ~400 tokens × 9 = ~3,600 tokens
- operations/*: ~400 tokens × 4 = ~1,600 tokens
- debugging/*: ~400 tokens × 3 = ~1,200 tokens
- patterns/*: ~600 tokens × 2 = ~1,200 tokens
- **ИТОГО: ~9,000 tokens** (vs 330K old = **97% reduction!**)

---

## 🔧 Команды для реализации

### Шаг 1: Создать структуру папок (1 команда)

```bash
mkdir -p learning/quick_ref learning/nodes learning/operations learning/debugging learning/patterns learning/resources learning/archive
```

### Шаг 2: Архивировать старые файлы (4 команды)

```bash
# Backup старых файлов
mv learning/LEARNINGS.md learning/archive/LEARNINGS_OLD.md
mv learning/LEARNINGS-INDEX.md learning/archive/LEARNINGS-INDEX_OLD.md
mv learning/PATTERNS.md learning/archive/PATTERNS_OLD.md
cp LEARNINGS.md learning/archive/LEARNINGS_CURRENT.md  # Backup текущего компактного
```

### Шаг 3: Создать пустые файлы структуры (1 команда)

```bash
touch learning/INDEX.md \
  learning/quick_ref/{critical_configs,mcp_operations,anti_patterns}.md \
  learning/nodes/{set_node,if_node,switch_node,code_node,http_request,telegram,supabase,notion,ai_agent}.md \
  learning/operations/{connections,partial_updates,validation,workflow_creation}.md \
  learning/debugging/{execution_analysis,anti_loop,common_errors}.md \
  learning/patterns/{proven_patterns,workflow_templates}.md
```

### Шаг 4: Копировать N8N-RESOURCES.md как есть (1 команда)

```bash
cp learning/N8N-RESOURCES.md learning/resources/n8n_resources.md
```

### Шаг 5: Извлечь контент (через Claude - НЕ bash команды)

**Для каждой категории выполнить:**

#### 5.1 quick_ref/critical_configs.md
**Источники:**
- `/LEARNINGS.md` → "Node Configuration" section
- `learning/PATTERNS.md` → "Quick Reference" section (lines 27-100)

**Команды Claude:**
```javascript
// Read источники
Read("LEARNINGS.md", {offset: 150, limit: 100})  // Node Configuration
Read("learning/archive/PATTERNS_OLD.md", {offset: 27, limit: 75})  // Quick Reference

// Write объединенный файл
Write("learning/quick_ref/critical_configs.md", content)
```

#### 5.2 quick_ref/mcp_operations.md
**Источники:**
- `/LEARNINGS.md` → "MCP Operations" section (lines 26-330)

**Команды Claude:**
```javascript
Read("LEARNINGS.md", {offset: 26, limit: 310})
Write("learning/quick_ref/mcp_operations.md", content)
```

#### 5.3 quick_ref/anti_patterns.md
**Источники:**
- `learning/archive/PATTERNS_OLD.md` → Anti-Patterns section
- `/LEARNINGS.md` → "Common Gotchas" (line 650)

**Команды Claude:**
```javascript
Grep({pattern: "Anti-Pattern", path: "learning/archive/PATTERNS_OLD.md", output_mode: "content", "-n": true})
Read("LEARNINGS.md", {offset: 650, limit: 50})
Write("learning/quick_ref/anti_patterns.md", content)
```

#### 5.4 nodes/set_node.md
**Источники:**
- `/LEARNINGS.md` → L-004, Set Node entries
- `learning/archive/LEARNINGS_OLD.md` → Set Node entries

**Команды Claude:**
```javascript
Grep({pattern: "Set Node", path: "LEARNINGS.md", output_mode: "content", "-B": 5, "-A": 20})
Grep({pattern: "Set.*v3.4", path: "learning/archive/LEARNINGS_OLD.md", output_mode: "content", "-B": 3, "-A": 15})
Write("learning/nodes/set_node.md", content)
```

#### 5.5 nodes/if_node.md
**Источники:**
- `/LEARNINGS.md` → L-004 branch, L-068 binary data (line ~430)
- `learning/archive/LEARNINGS_OLD.md` → IF Node entries

**Команды Claude:**
```javascript
Grep({pattern: "IF Node|IF node", path: "LEARNINGS.md", output_mode: "content", "-B": 5, "-A": 20})
Grep({pattern: "L-068", path: "learning/archive/LEARNINGS_OLD.md", output_mode: "content", "-B": 3, "-A": 30})
Write("learning/nodes/if_node.md", content)
```

#### 5.6 nodes/switch_node.md
**Источники:**
- `/LEARNINGS.md` → L-006, L-007, L-008 (lines 82-302)

**Команды Claude:**
```javascript
Read("LEARNINGS.md", {offset: 82, limit: 225})  // L-006, L-007, L-008
Write("learning/nodes/switch_node.md", content)
```

#### 5.7 nodes/code_node.md
**Источники:**
- `/LEARNINGS.md` → L-005 (line 304)
- `learning/archive/LEARNINGS_OLD.md` → L-060, L-104

**Команды Claude:**
```javascript
Read("LEARNINGS.md", {offset: 304, limit: 30})  // L-005
Grep({pattern: "L-060|L-104", path: "learning/archive/LEARNINGS_OLD.md", output_mode: "content", "-B": 3, "-A": 40})
Write("learning/nodes/code_node.md", content)
```

#### 5.8 nodes/http_request.md
**Источники:**
- `/LEARNINGS.md` → HTTP Request entries
- `learning/archive/LEARNINGS_OLD.md` → L-101 credentials

**Команды Claude:**
```javascript
Grep({pattern: "HTTP Request", path: "LEARNINGS.md", output_mode: "content", "-B": 3, "-A": 20})
Grep({pattern: "L-101.*HTTP", path: "learning/archive/LEARNINGS_OLD.md", output_mode: "content", "-B": 3, "-A": 30})
Write("learning/nodes/http_request.md", content)
```

#### 5.9 nodes/telegram.md
**Источники:**
- `/LEARNINGS.md` → Telegram section (line 450)
- `learning/archive/LEARNINGS_OLD.md` → L-076, L-098, L-099, L-100

**Команды Claude:**
```javascript
Read("LEARNINGS.md", {offset: 450, limit: 120})
Grep({pattern: "L-076|L-098|L-099|L-100", path: "learning/archive/LEARNINGS_OLD.md", output_mode: "content", "-B": 3, "-A": 40})
Write("learning/nodes/telegram.md", content)
```

#### 5.10 nodes/supabase.md
**Источники:**
- `learning/archive/LEARNINGS_OLD.md` → Supabase section (lines 1020-1130)

**Команды Claude:**
```javascript
Read("learning/archive/LEARNINGS_OLD.md", {offset: 1020, limit: 115})
Write("learning/nodes/supabase.md", content)
```

#### 5.11 nodes/notion.md
**Источники:**
- `learning/archive/LEARNINGS_OLD.md` → Notion section (lines 890-1020)

**Команды Claude:**
```javascript
Read("learning/archive/LEARNINGS_OLD.md", {offset: 890, limit: 135})
Write("learning/nodes/notion.md", content)
```

#### 5.12 nodes/ai_agent.md
**Источники:**
- `/LEARNINGS.md` → AI Agent section (line 550)
- `learning/archive/LEARNINGS_OLD.md` → AI Agents section (lines 1340-1440)

**Команды Claude:**
```javascript
Read("LEARNINGS.md", {offset: 550, limit: 100})
Read("learning/archive/LEARNINGS_OLD.md", {offset: 1340, limit: 105})
Write("learning/nodes/ai_agent.md", content)
```

#### 5.13 operations/connections.md
**Источники:**
- `/LEARNINGS.md` → addConnection entries, L-004, L-006, L-008

**Команды Claude:**
```javascript
Grep({pattern: "addConnection|connection", path: "LEARNINGS.md", output_mode: "content", "-B": 5, "-A": 20})
Write("learning/operations/connections.md", content)
```

#### 5.14 operations/partial_updates.md
**Источники:**
- `/LEARNINGS.md` → partial_updates section
- `learning/archive/LEARNINGS_OLD.md` → partial update entries

**Команды Claude:**
```javascript
Grep({pattern: "partial.*update|n8n_update_partial", path: "LEARNINGS.md", output_mode: "content", "-B": 3, "-A": 20})
Grep({pattern: "Partial Update", path: "learning/archive/LEARNINGS_OLD.md", output_mode: "content", "-B": 3, "-A": 20})
Write("learning/operations/partial_updates.md", content)
```

#### 5.15 operations/validation.md
**Источники:**
- `/LEARNINGS.md` → Validation section
- `learning/archive/LEARNINGS_OLD.md` → Validation entries

**Команды Claude:**
```javascript
Grep({pattern: "validation|validate_node|validate_workflow", path: "LEARNINGS.md", output_mode: "content", "-B": 3, "-A": 15})
Read("learning/archive/LEARNINGS_OLD.md", {offset: 250, limit: 100})  // Validation Errors
Write("learning/operations/validation.md", content)
```

#### 5.16 operations/workflow_creation.md
**Источники:**
- `learning/archive/LEARNINGS_OLD.md` → Workflow creation entries

**Команды Claude:**
```javascript
Grep({pattern: "n8n_create_workflow|workflow creation", path: "learning/archive/LEARNINGS_OLD.md", output_mode: "content", "-B": 3, "-A": 20})
Write("learning/operations/workflow_creation.md", content)
```

#### 5.17 debugging/execution_analysis.md
**Источники:**
- `/LEARNINGS.md` → L-067 (line 350)
- `learning/archive/LEARNINGS_OLD.md` → L-067, L-059

**Команды Claude:**
```javascript
Read("LEARNINGS.md", {offset: 350, limit: 100})  // L-067
Grep({pattern: "L-067|L-059", path: "learning/archive/LEARNINGS_OLD.md", output_mode: "content", "-B": 3, "-A": 40})
Write("learning/debugging/execution_analysis.md", content)
```

#### 5.18 debugging/anti_loop.md
**Источники:**
- `/LEARNINGS.md` → Anti-Loop Protocol section (~line 580)
- `CLAUDE.md` → Anti-Loop Protocol section

**Команды Claude:**
```javascript
Grep({pattern: "Anti-Loop|cycle.*limit", path: "LEARNINGS.md", output_mode: "content", "-B": 5, "-A": 50})
Grep({pattern: "Anti-Loop Protocol", path: "CLAUDE.md", output_mode: "content", "-B": 2, "-A": 80})
Write("learning/debugging/anti_loop.md", content)
```

#### 5.19 debugging/common_errors.md
**Источники:**
- `/LEARNINGS.md` → Common errors section
- `learning/archive/LEARNINGS_OLD.md` → L-053, L-054, L-055

**Команды Claude:**
```javascript
Grep({pattern: "L-053|L-054|L-055", path: "learning/archive/LEARNINGS_OLD.md", output_mode: "content", "-B": 3, "-A": 30})
Write("learning/debugging/common_errors.md", content)
```

#### 5.20 patterns/proven_patterns.md
**Источники:**
- `learning/archive/PATTERNS_OLD.md` → Proven Patterns section (фильтровать агентское)

**Команды Claude:**
```javascript
Read("learning/archive/PATTERNS_OLD.md", {offset: 0, limit: 200})  // Check structure
Grep({pattern: "Pattern.*:", path: "learning/archive/PATTERNS_OLD.md", output_mode: "content", "-B": 2, "-A": 40})
// Filter: Keep n8n patterns, skip agent patterns
Write("learning/patterns/proven_patterns.md", content)
```

#### 5.21 patterns/workflow_templates.md
**Источники:**
- `learning/archive/LEARNINGS_OLD.md` → L-077 Template #2465
- `learning/archive/PATTERNS_OLD.md` → Template patterns

**Команды Claude:**
```javascript
Grep({pattern: "L-077|Template.*#", path: "learning/archive/LEARNINGS_OLD.md", output_mode: "content", "-B": 3, "-A": 40})
Write("learning/patterns/workflow_templates.md", content)
```

### Шаг 6: Создать INDEX.md

**После всех файлов созданы:**

```javascript
// Scan all created files
Glob({pattern: "learning/**/*.md"})

// Create INDEX.md with:
// - Quick Access (critical issues)
// - Category table
// - Tag index
// - Usage protocol
Write("learning/INDEX.md", index_content)
```

---

## 📝 Обновление CLAUDE.md

### Секция для замены

**УДАЛИТЬ из CLAUDE.md:**
```markdown
### When starting work on a workflow

□ Read projects/[workflow-name]/PROJECT_STATE.md (or create)
□ Read LEARNINGS.md Quick Index (know what was solved before)  ← УДАЛИТЬ
□ Check n8n_workflow_versions (know versions)
```

**ЗАМЕНИТЬ на:**
```markdown
### When starting work on a workflow

□ Read projects/[workflow-name]/PROJECT_STATE.md (or create)
□ Read learning/INDEX.md (know what was solved before)  ← НОВОЕ
□ Check n8n_workflow_versions (know versions)
```

### Новая секция: Learning System Protocol

**ДОБАВИТЬ в CLAUDE.md** (после "Session Start Checklist"):

```markdown
---

## Learning System Protocol

### 📚 How to Use Learning System

**Location:** `learning/` folder with indexed knowledge base

**Token Cost:** ~500 tokens (INDEX) + ~400 tokens (targeted file) = ~900 tokens
**vs Old System:** 330K tokens = **99.7% savings!**

### Reading Protocol

```javascript
// Step 1: Read INDEX.md for overview (~500 tokens)
Read("learning/INDEX.md")

// Step 2: Find relevant topic in INDEX
// Example: Problem with Switch Node duplicate connections
// → INDEX shows: nodes/switch_node.md

// Step 3: Read targeted file (~300-500 tokens)
Read("learning/nodes/switch_node.md")

// Alternative: Grep if you know the keyword
Grep({pattern: "duplicate connection", path: "learning/nodes/switch_node.md", output_mode: "content", "-B": 3, "-A": 15})
```

### Writing Protocol (After Solving Issue)

**When to add entry:**
- Problem required >2 attempts to solve
- Solution not documented in INDEX
- Non-trivial fix with specific steps

**Steps:**

```javascript
// 1. Determine category by problem type
// - Node behavior → learning/nodes/[node-name].md
// - MCP operation → learning/operations/[operation].md
// - Debugging technique → learning/debugging/[type].md
// - Reusable pattern → learning/patterns/proven_patterns.md

// 2. Read current file to check for duplicates
Read("learning/nodes/switch_node.md")

// 3. Edit file: Add entry at TOP (chronological order, newest first)
Edit("learning/nodes/switch_node.md", add_entry)

// 4. Update INDEX.md ONLY if:
// - Completely new category added
// - New tags that didn't exist before
// Otherwise: INDEX stays unchanged!
```

### Entry Format

```markdown
### [YYYY-MM-DD HH:MM] Short Title (L-XXX)

**Problem:** What went wrong
**Tried:**
- Attempt 1: [what] → [result]
- Attempt 2: [what] → [result]
**Root Cause:** Why it happened (technical reason)
**Solution:**
\`\`\`javascript
// Code or commands
\`\`\`
**Prevention:** How to avoid in future
**Impact:** HIGH/MEDIUM/LOW - how common/severe
**Tags:** #tag1 #tag2 #tag3
**Reference:** Project name or workflow ID
```

### Quick Access (Check First!)

Before starting ANY node configuration or debugging:

1. **Set Node** → [learning/nodes/set_node.md](learning/nodes/set_node.md)
2. **IF Node** → [learning/nodes/if_node.md](learning/nodes/if_node.md)
3. **Switch Node** → [learning/nodes/switch_node.md](learning/nodes/switch_node.md)
4. **addConnection** → [learning/operations/connections.md](learning/operations/connections.md)
5. **Execution Analysis** → [learning/debugging/execution_analysis.md](learning/debugging/execution_analysis.md)

### Structure Overview

```
learning/
  INDEX.md              ← Start here (500 tokens)

  quick_ref/            ← Critical configs (200-300 tokens each)
    critical_configs.md
    mcp_operations.md
    anti_patterns.md

  nodes/                ← Node-specific knowledge (400 tokens each)
    set_node.md
    if_node.md
    switch_node.md
    code_node.md
    http_request.md
    telegram.md
    supabase.md
    notion.md
    ai_agent.md

  operations/           ← MCP operations
    connections.md
    partial_updates.md
    validation.md
    workflow_creation.md

  debugging/            ← Debug techniques
    execution_analysis.md
    anti_loop.md
    common_errors.md

  patterns/             ← Reusable solutions
    proven_patterns.md
    workflow_templates.md

  resources/
    n8n_resources.md    ← External resources
```

---
```

### Команда для обновления CLAUDE.md

```javascript
// 1. Read current CLAUDE.md
Read("CLAUDE.md")

// 2. Find "Session Start Checklist" section
Grep({pattern: "## Session Start Checklist", path: "CLAUDE.md", "-n": true, output_mode: "content"})

// 3. Edit:
// - Replace "LEARNINGS.md" references with "learning/INDEX.md"
// - Add "Learning System Protocol" section after "Session Start Checklist"
Edit("CLAUDE.md", old_string, new_string)
```

---

## ✅ Критерии успеха

После реализации должно быть:

- [ ] Структура папок создана (learning/quick_ref/, nodes/, operations/, debugging/, patterns/, resources/, archive/)
- [ ] Старые файлы архивированы (learning/archive/)
- [ ] Все 24 файла категорий созданы и заполнены
- [ ] INDEX.md создан с:
  - [ ] Quick Access (top 5 critical issues)
  - [ ] Category table
  - [ ] Tag index
  - [ ] Usage protocol
- [ ] CLAUDE.md обновлен:
  - [ ] Все ссылки на LEARNINGS.md заменены на learning/INDEX.md
  - [ ] Добавлена секция "Learning System Protocol"
- [ ] Размеры файлов:
  - [ ] INDEX.md < 1000 tokens (~500 target)
  - [ ] Каждый файл категории < 1000 tokens (~400 target)
- [ ] Нет дубликатов между файлами
- [ ] Все записи имеют теги
- [ ] Тестирование:
  - [ ] Read INDEX.md + targeted file < 2000 tokens
  - [ ] Grep поиск работает
  - [ ] Теги находят релевантные файлы

---

## 🚀 Порядок выполнения (Summary)

```bash
# 1. Create structure (1 command)
mkdir -p learning/{quick_ref,nodes,operations,debugging,patterns,resources,archive}

# 2. Archive old files (4 commands)
mv learning/LEARNINGS.md learning/archive/LEARNINGS_OLD.md
mv learning/LEARNINGS-INDEX.md learning/archive/LEARNINGS-INDEX_OLD.md
mv learning/PATTERNS.md learning/archive/PATTERNS_OLD.md
cp LEARNINGS.md learning/archive/LEARNINGS_CURRENT.md

# 3. Create empty structure (1 command)
touch learning/INDEX.md learning/quick_ref/{critical_configs,mcp_operations,anti_patterns}.md learning/nodes/{set_node,if_node,switch_node,code_node,http_request,telegram,supabase,notion,ai_agent}.md learning/operations/{connections,partial_updates,validation,workflow_creation}.md learning/debugging/{execution_analysis,anti_loop,common_errors}.md learning/patterns/{proven_patterns,workflow_templates}.md

# 4. Copy resources (1 command)
cp learning/N8N-RESOURCES.md learning/resources/n8n_resources.md

# 5. Extract content (via Claude - 21 file creations)
# See "Шаг 5" section for detailed commands per file

# 6. Create INDEX.md (via Claude)
# After all files created

# 7. Update CLAUDE.md (via Claude)
# Replace references, add Learning System Protocol section
```

**Total commands:** 7 bash + 21 file extractions + INDEX + CLAUDE.md update = **30 operations**

**Estimated time:**
- Bash commands: 2 minutes
- File extractions (Claude): 40-60 minutes (2-3 min per file)
- INDEX creation: 10 minutes
- CLAUDE.md update: 5 minutes
- **Total: ~60-80 minutes**

---

**Ready to start? Say "go" and I'll execute step by step!**
