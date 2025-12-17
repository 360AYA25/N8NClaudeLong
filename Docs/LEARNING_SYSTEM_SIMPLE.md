# Learning System - Simplified Plan

## 🎯 Концепция: Один файл + Индекс

**Проблема со сложной структурой:**
- 20+ файлов = путаница
- Сложно найти где что
- Сложно поддерживать

**Простое решение:**
```
learning/
  INDEX.md              # Индекс с line numbers (~500 tokens)
  LEARNINGS.md          # ОДИН файл (~10,000 lines)
  N8N-RESOURCES.md      # Ресурсы (как есть)

  archive/              # Старые файлы для backup
```

## 📖 Как работает

### Чтение (Read)

```javascript
// Шаг 1: Прочитать INDEX (~500 tokens)
Read("learning/INDEX.md")

// Результат:
// | Switch Node | Line 2500 | Sequential eval, duplicates, case param |

// Шаг 2: Прочитать нужную секцию (~300-500 tokens)
Read("learning/LEARNINGS.md", {offset: 2500, limit: 80})

// Итого: ~800-1000 tokens (vs 10K для всего файла)
```

### Поиск (Grep)

```javascript
// Быстрый поиск по ключевым словам
Grep({pattern: "addConnection", path: "learning/LEARNINGS.md",
      output_mode: "content", "-n": true, "-B": 3, "-A": 15})
```

### Запись (Write/Edit)

```javascript
// 1. Прочитать категорию
Read("learning/LEARNINGS.md", {offset: 2500, limit: 50})

// 2. Добавить новую запись сверху категории
Edit("learning/LEARNINGS.md",
     old_string: "## Switch Node\n\n### [2025-12-15...",
     new_string: "## Switch Node\n\n### [2025-12-17 NEW ENTRY]\n...\n\n### [2025-12-15..."
)
```

## 🗂️ Структура LEARNINGS.md

```markdown
# N8N Learning Database

> **How to Use:**
> 1. Read INDEX.md to find topic → get line number
> 2. Read LEARNINGS.md with offset/limit
> 3. Add new entries at TOP of category (newest first)

---

## Quick Index

| Category | Line | Topics |
|----------|------|--------|
| MCP Operations | 100 | addConnection, partial updates, branch, case |
| Set Node | 500 | v3.4+ ={{, manual mode, assignments |
| IF Node | 800 | v2+ conditions, branch routing, binary data |
| Switch Node | 1200 | Sequential eval, duplicates, case param |
| Code Node | 1600 | Variables, scope, deprecated syntax |
| HTTP Request | 2000 | continueOnFail, credentials, errors |
| Telegram | 2400 | Reply Keyboard, webhooks, memory |
| Supabase | 2800 | Schema, RLS, RPC |
| Notion | 3200 | Filters, dates, timezone |
| AI Agent | 3600 | Memory, tools, system prompt, optional params |
| Execution & Debugging | 4000 | L-067 two-step, anti-loop, execution analysis |
| Validation | 4400 | validate_node, validate_workflow, profiles |
| Workflow Creation | 4800 | Template-first, n8n_create_workflow |
| Common Gotchas | 5200 | Binary data, cascading changes, defaults |
| Proven Patterns | 5600 | Reusable solutions, best practices |

**Total Entries:** 50+
**Last Updated:** 2025-12-17

---

## MCP Operations

### [2025-12-17 12:00] addConnection requires 4 string parameters

**Problem:** Error "Expected string, received object"
**Solution:** Use 4 separate params...

### [2025-12-17 19:15] IF Node connection without branch → node never executes

...

---

## Set Node

### [2025-12-17 12:00] Set Node v3.4+ requires mode="manual" and ={{ prefix

...

---

## IF Node

...

---

[Continue for all categories...]
```

## 🔧 Команды для реализации

### Шаг 1: Архивировать старые файлы (3 команды)

```bash
# Создать archive папку
mkdir -p learning/archive

# Архивировать старые файлы
mv learning/LEARNINGS.md learning/archive/LEARNINGS_OLD.md
mv learning/LEARNINGS-INDEX.md learning/archive/LEARNINGS-INDEX_OLD.md
mv learning/PATTERNS.md learning/archive/PATTERNS_OLD.md

# Backup текущего компактного файла
cp LEARNINGS.md learning/archive/LEARNINGS_CURRENT.md
```

### Шаг 2: Создать новый LEARNINGS.md (через Claude)

**Источники для объединения:**

1. **`LEARNINGS.md`** (текущий) - весь контент ✅
2. **`learning/archive/LEARNINGS_OLD.md`** - фильтровать:
   - ✅ Взять: n8n Workflows, Notion, Supabase, Telegram, HTTP, AI Agents, MCP Server
   - ❌ Пропустить: Agent Standardization, L-105 до L-096 (агентские процессы), Claude Code, Git & GitHub
3. **`learning/archive/PATTERNS_OLD.md`** - взять n8n паттерны:
   - ✅ Quick Reference (critical configs)
   - ✅ Proven Patterns (n8n-specific)
   - ❌ Пропустить: Agent patterns

**Структура нового файла:**

```markdown
# N8N Learning Database

## Quick Index (with line numbers)

## MCP Operations (line ~100)
[Current LEARNINGS.md content]

## Set Node (line ~500)
[Current + filtered OLD content]

## IF Node (line ~800)
[Current + filtered OLD content]

## Switch Node (line ~1200)
[Current content + L-006, L-007, L-008]

## Code Node (line ~1600)
[Current L-005 + OLD L-060, L-104]

## HTTP Request (line ~2000)
[Current + OLD L-101]

## Telegram (line ~2400)
[Current + OLD L-076, L-098, L-099, L-100]

## Supabase (line ~2800)
[OLD content - full category]

## Notion (line ~3200)
[OLD content - full category]

## AI Agent (line ~3600)
[Current + OLD content]

## Execution & Debugging (line ~4000)
[Current L-067 + OLD L-067, L-059]

## Validation (line ~4400)
[Current content]

## Workflow Creation (line ~4800)
[OLD content]

## Common Gotchas (line ~5200)
[Current content]

## Proven Patterns (line ~5600)
[PATTERNS_OLD.md - n8n patterns only]
```

**Команда для создания:**

```javascript
// 1. Read all sources
Read("LEARNINGS.md")  // Current compact
Read("learning/archive/LEARNINGS_OLD.md", {offset: 0, limit: 200})  // Check structure
Read("learning/archive/PATTERNS_OLD.md", {offset: 0, limit: 200})   // Check structure

// 2. Identify line numbers for OLD categories
Grep({pattern: "^## ", path: "learning/archive/LEARNINGS_OLD.md", "-n": true, output_mode: "content"})

// 3. Extract relevant sections from OLD
// n8n Workflows section:
Read("learning/archive/LEARNINGS_OLD.md", {offset: 170, limit: 150})
// Notion:
Read("learning/archive/LEARNINGS_OLD.md", {offset: 890, limit: 135})
// Supabase:
Read("learning/archive/LEARNINGS_OLD.md", {offset: 1020, limit: 115})
// Telegram:
Grep({pattern: "L-076|L-098|L-099|L-100", path: "learning/archive/LEARNINGS_OLD.md", "-B": 3, "-A": 40, output_mode: "content"})
// HTTP:
Grep({pattern: "L-101.*HTTP", path: "learning/archive/LEARNINGS_OLD.md", "-B": 3, "-A": 30, output_mode: "content"})
// Code Node:
Grep({pattern: "L-060|L-104", path: "learning/archive/LEARNINGS_OLD.md", "-B": 3, "-A": 40, output_mode: "content"})
// Execution:
Grep({pattern: "L-067", path: "learning/archive/LEARNINGS_OLD.md", "-B": 3, "-A": 40, output_mode: "content"})

// 4. Extract patterns
Grep({pattern: "Pattern.*:", path: "learning/archive/PATTERNS_OLD.md", "-B": 2, "-A": 40, output_mode: "content"})

// 5. Combine all and write new file
Write("learning/LEARNINGS.md", combined_content)
```

**Фильтры при объединении:**

❌ **Пропускать записи содержащие:**
- "Orchestrator", "Builder", "QA", "Analyst" (агентские роли)
- "Phase 5", "validation gates", "escalation protocol"
- "Agent Frontmatter", "MCP tool verification"
- "L-105", "L-103", "L-102", "L-101" (про диагнозы), "L-100" (про QA Phase)
- "L-069" до "L-096" (агентские процессы)
- "Git pull", "GitHub PR", "Monorepo" (не про n8n)

✅ **Брать записи про:**
- Node types: Set, IF, Switch, Code, HTTP Request, Telegram, Supabase, Notion
- MCP operations: addConnection, partial updates, validation
- Technical issues: L-067, L-060, L-068, L-076, L-098, L-099, L-100 (node version)
- Patterns: Never Trust Defaults, Template-first approach

### Шаг 3: Создать INDEX.md (через Claude)

**После создания LEARNINGS.md:**

```javascript
// 1. Get line numbers for all categories
Grep({pattern: "^## ", path: "learning/LEARNINGS.md", "-n": true, output_mode: "content"})

// Result example:
// 50:## MCP Operations
// 500:## Set Node
// 800:## IF Node
// ...

// 2. Count entries per category
Grep({pattern: "^### ", path: "learning/LEARNINGS.md", output_mode: "count"})

// 3. Create INDEX.md
Write("learning/INDEX.md", index_content)
```

**Структура INDEX.md:**

```markdown
# Learning System Index

**Purpose:** Find knowledge fast without loading full file
**Token Cost:** INDEX (~500) + targeted read (~400) = ~900 tokens vs 10K+ full file

---

## 🔍 Quick Lookup

### Critical Issues (Check First!)

| Issue | Line | When to Check |
|-------|------|---------------|
| Set Node ={{ syntax | 500 | Before any Set Node config |
| IF Node branch param | 800 | Before IF connections |
| Switch duplicates | 1200 | After Switch routing changes |
| addConnection 4-param | 100 | Before any addConnection |
| L-067 two-step exec | 4000 | Before analyzing >10 node workflows |

### By Category

| Category | Line | Entries | Key Topics |
|----------|------|---------|------------|
| MCP Operations | 100 | 8 | addConnection (4-param, branch, case), partial updates, L-004, L-006, L-008 |
| Set Node | 500 | 3 | v3.4+ ={{, manual mode, assignments |
| IF Node | 800 | 4 | v2+ conditions, branch routing, L-004, L-068 binary data |
| Switch Node | 1200 | 4 | Sequential eval, L-006 reorder, L-007 eval, L-008 duplicates |
| Code Node | 1600 | 4 | L-005 variables, L-060 deprecated syntax, L-104 data access |
| HTTP Request | 2000 | 3 | continueOnFail, L-101 credentials, errors |
| Telegram | 2400 | 5 | L-076 webhook, L-098 memory, L-099/L-100 Reply Keyboard |
| Supabase | 2800 | 5 | Schema checks, RLS, RPC, insert/update |
| Notion | 3200 | 6 | Filters, dates, timezone, properties |
| AI Agent | 3600 | 4 | L-098 memory, tools, system prompt, L-009 optional params |
| Execution & Debugging | 4000 | 4 | L-067 two-step mode, anti-loop, cycle limits |
| Validation | 4400 | 3 | validate_node, validate_workflow, profiles |
| Workflow Creation | 4800 | 3 | Template-first, n8n_create_workflow |
| Common Gotchas | 5200 | 4 | L-068 binary data, cascading changes, Never Trust Defaults |
| Proven Patterns | 5600 | 10+ | Reusable solutions, best practices |

### By Tag

| Tag | Categories | Lines |
|-----|-----------|-------|
| #addConnection | MCP Operations | 100-150 |
| #branch | MCP Operations, IF Node | 100-150, 800-850 |
| #expressions | Set Node | 500-550 |
| #telegram | Telegram | 2400-2800 |
| #validation | Validation, MCP Operations | 4400-4800, 100-150 |
| #execution | Execution & Debugging | 4000-4400 |
| #anti-loop | Execution & Debugging | 4000-4100 |
| #binary-data | IF Node, Common Gotchas | 800-850, 5200-5250 |
| #critical | Set, IF, Switch, HTTP, Telegram | Multiple |

---

## 📖 Usage Protocol

### Reading

```javascript
// Step 1: Read INDEX to find topic (~500 tokens)
Read("learning/INDEX.md")

// Step 2: Find line number for category
// Example: "Switch Node" → Line 1200

// Step 3: Read targeted section (~300-500 tokens)
Read("learning/LEARNINGS.md", {offset: 1200, limit: 80})

// Alternative: Grep for keyword
Grep({pattern: "duplicate connection", path: "learning/LEARNINGS.md",
      output_mode: "content", "-n": true, "-B": 3, "-A": 15})
```

### Writing (After Solving Issue)

```javascript
// 1. Determine category
// Example: Fixed Switch Node issue → "Switch Node" category

// 2. Read category section to get current content
Read("learning/LEARNINGS.md", {offset: 1200, limit: 50})

// 3. Add new entry at TOP of category (newest first)
Edit("learning/LEARNINGS.md",
  old_string: "## Switch Node\n\n### [2025-12-15...",
  new_string: "## Switch Node\n\n### [2025-12-17 HH:MM] New Issue Title\n\n**Problem:**...\n\n### [2025-12-15..."
)

// 4. Update INDEX.md ONLY if line numbers shifted significantly (>50 lines)
//    or new category added
```

### Entry Format

```markdown
### [YYYY-MM-DD HH:MM] Short Title (L-XXX)

**Problem:** What went wrong
**Tried:**
- Attempt 1: [action] → [result]
- Attempt 2: [action] → [result]
**Root Cause:** Technical reason why
**Solution:**
\`\`\`javascript
// Code or commands
\`\`\`
**Prevention:** How to avoid
**Impact:** HIGH/MEDIUM/LOW
**Tags:** #tag1 #tag2 #tag3
**Reference:** Project/workflow name
```

---

**Total Entries:** 50+
**File Size:** ~10,000 lines (~300K tokens full, ~400 tokens per targeted read)
**Last Updated:** 2025-12-17
```

### Шаг 4: Обновить CLAUDE.md

**Найти и заменить:**

```javascript
// 1. Find references to LEARNINGS.md
Grep({pattern: "LEARNINGS.md", path: "CLAUDE.md", "-n": true, output_mode: "content"})

// 2. Replace all instances:
// "LEARNINGS.md" → "learning/INDEX.md"
// "Check LEARNINGS.md" → "Check learning/INDEX.md"

Edit("CLAUDE.md",
  old_string: "□ Read LEARNINGS.md Quick Index (know what was solved before)",
  new_string: "□ Read learning/INDEX.md (know what was solved before)"
)

// 3. Update Anti-Loop Protocol section
Edit("CLAUDE.md",
  old_string: "**Шаг 1: Проверить LEARNINGS.md**\nGrep({pattern: \"ключевые слова ошибки\", path: \"LEARNINGS.md\"})",
  new_string: "**Шаг 1: Проверить learning/INDEX.md + LEARNINGS.md**\nRead(\"learning/INDEX.md\")  // Find category\nGrep({pattern: \"ключевые слова\", path: \"learning/LEARNINGS.md\", \"-n\": true})"
)

// 4. Update Debug Session Protocol
Edit("CLAUDE.md",
  old_string: "**Шаг 2: Проверить LEARNINGS.md**\nGrep({pattern: \"ключевые слова\", path: \"LEARNINGS.md\", output_mode: \"content\"})",
  new_string: "**Шаг 2: Проверить learning/INDEX.md + LEARNINGS.md**\nRead(\"learning/INDEX.md\")  // ~500 tokens\nRead(\"learning/LEARNINGS.md\", {offset: LINE, limit: 50})  // ~300 tokens"
)
```

**Добавить новую секцию после "Session Start Checklist":**

```markdown
---

## Learning System

**Location:** `learning/INDEX.md` + `learning/LEARNINGS.md`

### Structure

```
learning/
  INDEX.md           # Индекс с line numbers (~500 tokens)
  LEARNINGS.md       # Все знания в одном файле (~10K lines)
  N8N-RESOURCES.md   # Внешние ресурсы
```

### Read Protocol

```javascript
// Step 1: Read INDEX (~500 tokens)
Read("learning/INDEX.md")

// Step 2: Find category line number
// Example: "Switch Node" → Line 1200

// Step 3: Read targeted section (~300-500 tokens)
Read("learning/LEARNINGS.md", {offset: 1200, limit: 80})

// Total: ~800-1000 tokens vs 10K+ full file
```

### Write Protocol

```javascript
// After solving issue:

// 1. Determine category
// 2. Read category section
Read("learning/LEARNINGS.md", {offset: LINE, limit: 50})

// 3. Add entry at TOP of category (newest first)
Edit("learning/LEARNINGS.md", add_entry_at_top)

// 4. Update INDEX only if line numbers shifted >50 lines
```

### Quick Access

Before configuring nodes, check:
1. Set Node → Line ~500
2. IF Node → Line ~800
3. Switch Node → Line ~1200
4. addConnection → Line ~100
5. L-067 execution → Line ~4000

---
```

## ⏱️ Время реализации

- **Шаг 1:** Архивация (3 bash команды) - 2 мин
- **Шаг 2:** Создание LEARNINGS.md (Claude) - 30-40 мин
  - Read источники - 5 мин
  - Фильтрация агентского контента - 10 мин
  - Объединение и форматирование - 15-20 мин
  - Проверка структуры - 5 мин
- **Шаг 3:** Создание INDEX.md (Claude) - 10 мин
- **Шаг 4:** Обновление CLAUDE.md (Claude) - 5 мин

**Итого: 45-60 минут**

---

## ✅ Критерии успеха

- [ ] learning/LEARNINGS.md создан (~10K lines)
- [ ] Все агентские знания отфильтрованы (нет Orchestrator, Builder, QA, Phase 5, etc.)
- [ ] Все технические n8n знания сохранены
- [ ] learning/INDEX.md создан с:
  - [ ] Quick Lookup таблица
  - [ ] Category таблица с line numbers
  - [ ] Tag таблица
  - [ ] Usage protocol
- [ ] INDEX.md < 1000 tokens (~500 target)
- [ ] Read INDEX + targeted section < 1500 tokens
- [ ] CLAUDE.md обновлен:
  - [ ] Все ссылки на LEARNINGS.md заменены
  - [ ] Добавлена секция "Learning System"
- [ ] Старые файлы в learning/archive/

---

## 🚀 Ready to Execute?

**Команды:**

```bash
# Шаг 1: Архивация (3 команды)
mkdir -p learning/archive
mv learning/LEARNINGS.md learning/archive/LEARNINGS_OLD.md
mv learning/LEARNINGS-INDEX.md learning/archive/LEARNINGS-INDEX_OLD.md
mv learning/PATTERNS.md learning/archive/PATTERNS_OLD.md
cp LEARNINGS.md learning/archive/LEARNINGS_CURRENT.md
```

После этого Claude выполнит шаги 2-4.

**Скажи "go" и я запущу!**
