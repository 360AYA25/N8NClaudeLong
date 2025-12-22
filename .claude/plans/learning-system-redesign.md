# Learning System Redesign Plan

## Цель
Создать эффективную индексную систему обучения, которая:
- Не забивает контекст (~500 tokens для индекса вместо 50K)
- Объединяет знания из всех источников
- Автоматически обновляется
- Убирает нерелевантные знания об агентской системе

## Источники для объединения

1. **`/LEARNINGS.md`** (614 строк) - текущие компактные знания
   - MCP Operations (addConnection, IF routing, Switch)
   - Node Configuration (Set, IF, HTTP, Code)
   - Validation, Execution, Telegram, AI Agent
   - ✅ ВЕСЬ контент релевантен

2. **`/learning/LEARNINGS.md`** (8,200 строк) - старая агентская система
   - 82 entries, 13 categories
   - ⚠️ Содержит агентские знания (НЕ релевантны)
   - ✅ Содержит n8n знания (релевантны)
   - Нужна фильтрация!

3. **`/learning/PATTERNS.md`** (1,956 строк) - паттерны решений
   - Universal Solution Patterns
   - Critical Quick Reference
   - ✅ Почти весь контент релевантен

4. **`/learning/N8N-RESOURCES.md`** (227 строк) - ресурсы
   - Ссылки на docs, templates, community
   - ✅ ВЕСЬ контент релевантен

## Новая структура

```
learning/
  INDEX.md                    # Главный индекс (~500 tokens)

  quick_ref/                  # Быстрая справка (~200 tokens каждый)
    critical_configs.md       # Set, IF, HTTP критические конфиги
    mcp_commands.md           # addConnection, partial updates
    anti_patterns.md          # Что НЕ делать

  nodes/                      # Детали по узлам (~300-500 tokens каждый)
    set_node.md               # Set Node v3.4+ все проблемы
    if_node.md                # IF Node routing, branch, binary data
    switch_node.md            # Switch conditions, connections, sequential eval
    code_node.md              # Variables, scope, data access
    http_request.md           # continueOnFail, credentials, errors
    telegram.md               # Reply Keyboard, webhooks, message handling
    supabase.md               # Schema, RLS, RPC
    ai_agent.md               # Memory, tools, prompts

  operations/                 # По операциям
    connections.md            # addConnection 4-param, branch, case, duplicates
    partial_updates.md        # n8n_update_partial_workflow patterns
    validation.md             # validate_node, validate_workflow
    workflow_creation.md      # Template-first approach

  debugging/                  # Отладка
    execution_analysis.md     # L-067 two-step, mode selection
    anti_loop.md              # Anti-Loop Protocol, cycle limits
    common_errors.md          # Часто встречающиеся ошибки

  patterns/                   # Паттерны
    proven_patterns.md        # Проверенные решения
    workflow_templates.md     # Шаблоны workflow архитектур

  resources/                  # Ресурсы
    n8n_resources.md          # Docs, templates, community (текущий файл)
```

## INDEX.md структура

```markdown
# Learning System Index

**Token cost:** ~500 tokens (vs 50K full files = 99% savings)

## Quick Access

### 🔴 Critical Issues (Check First!)
- Set Node v3.4+ ={{ syntax → [nodes/set_node.md](nodes/set_node.md)
- IF Node branch parameter → [nodes/if_node.md#branch-routing](nodes/if_node.md)
- Switch duplicate connections → [nodes/switch_node.md#duplicates](nodes/switch_node.md)
- HTTP Request continueOnFail → [nodes/http_request.md](nodes/http_request.md)
- Telegram Reply Keyboard → [nodes/telegram.md#reply-keyboard](nodes/telegram.md)

### 📋 By Category

| Category | Files | Key Topics |
|----------|-------|------------|
| Node Configs | [nodes/*](nodes/) | Set, IF, Switch, Code, HTTP, Telegram, Supabase |
| MCP Operations | [operations/*](operations/) | Connections, partial updates, validation |
| Debugging | [debugging/*](debugging/) | Execution analysis, anti-loop, errors |
| Patterns | [patterns/*](patterns/) | Proven solutions, templates |

### 🔍 By Topic (Tags)

- `#addConnection` → [operations/connections.md](operations/connections.md)
- `#branch` → [nodes/if_node.md](nodes/if_node.md), [nodes/switch_node.md](nodes/switch_node.md)
- `#expressions` → [nodes/set_node.md](nodes/set_node.md)
- `#telegram` → [nodes/telegram.md](nodes/telegram.md)
- `#validation` → [operations/validation.md](operations/validation.md)
- `#execution` → [debugging/execution_analysis.md](debugging/execution_analysis.md)
- `#anti-loop` → [debugging/anti_loop.md](debugging/anti_loop.md)

## Usage Protocol

### For Claude (Read)
```javascript
// Step 1: Read INDEX.md (~500 tokens)
Read("learning/INDEX.md")

// Step 2: Find relevant file by topic
// Example: Problem with addConnection
// → INDEX shows: operations/connections.md

// Step 3: Read targeted file (~300-500 tokens)
Read("learning/operations/connections.md")

// Total: ~800-1000 tokens vs 50K = 98% savings!
```

### For Claude (Write - after solving issue)
```javascript
// Step 1: Determine category
// Example: Fixed Switch Node duplicate connections
// → Category: nodes/switch_node.md

// Step 2: Read current file
Read("learning/nodes/switch_node.md")

// Step 3: Add new entry (chronological order, newest on top)
Edit("learning/nodes/switch_node.md", add entry)

// Step 4: Update INDEX.md tags if needed
// (Only if completely new topic)
```
```

## Процесс миграции

### Этап 1: Создать структуру папок
- Создать все папки: quick_ref/, nodes/, operations/, debugging/, patterns/, resources/
- Создать пустой INDEX.md

### Этап 2: Извлечь релевантный контент
**Из `/LEARNINGS.md` (текущий):**
- MCP Operations → `operations/connections.md`, `operations/partial_updates.md`
- Node Configuration → соответствующие файлы в `nodes/`
- Validation → `operations/validation.md`
- Execution & Debugging → `debugging/execution_analysis.md`
- Telegram → `nodes/telegram.md`
- AI Agent → `nodes/ai_agent.md`

**Из `/learning/LEARNINGS.md` (старый):**
- Фильтровать: ТОЛЬКО n8n-специфичные знания
- Пропустить: Agent Standardization, Claude Code, Git & GitHub (не релевантно)
- Извлечь: n8n Workflows, Notion, Supabase, Telegram, HTTP, MCP Server

**Из `/learning/PATTERNS.md`:**
- Quick Reference → `quick_ref/critical_configs.md`
- Proven Patterns → `patterns/proven_patterns.md`
- Anti-Patterns → `quick_ref/anti_patterns.md`

**Из `/learning/N8N-RESOURCES.md`:**
- Целиком → `resources/n8n_resources.md`

### Этап 3: Создать категории файлов
Для каждой категории:
1. Собрать все записи из всех источников
2. Удалить дубликаты (выбрать более детальную версию)
3. Отсортировать по дате (новые сверху)
4. Добавить теги
5. Создать файл

### Этап 4: Создать INDEX.md
- Список всех файлов
- Quick Access с критическими проблемами
- Таблица категорий
- Теги с ссылками
- Usage Protocol

### Этап 5: Обновить CLAUDE.md
Заменить секции:
- "Check LEARNINGS.md" → "Check learning/INDEX.md"
- Добавить протокол работы с индексом
- Обновить примеры

### Этап 6: Удалить старые файлы
- Архивировать `/learning/LEARNINGS.md` → `/learning/archive/`
- Архивировать `/learning/LEARNINGS-INDEX.md`
- Архивировать `/learning/PATTERNS.md`
- Удалить `/LEARNINGS.md` (объединено в новую систему)

## Auto-Update Protocol

### Когда добавлять запись
После решения любой проблемы, которая:
- Потребовала >2 попыток
- Не была задокументирована
- Имеет нетривиальное решение

### Куда добавлять
1. Определить категорию по типу проблемы:
   - Узел → `nodes/[node-name].md`
   - MCP операция → `operations/[operation].md`
   - Debugging → `debugging/[type].md`
   - Pattern → `patterns/proven_patterns.md`

2. Read файл категории
3. Edit файл: добавить запись сверху (хронологический порядок)

### Формат записи
```markdown
### [YYYY-MM-DD HH:MM] Short Title (L-XXX)

**Problem:** What went wrong
**Tried:** What didn't work (cycle 1, 2, 3...)
**Root Cause:** Why it happened
**Solution:** How to fix (code/commands)
**Prevention:** How to avoid
**Impact:** HIGH/MEDIUM/LOW
**Tags:** #tag1 #tag2 #tag3
**Reference:** Project/context
```

### Обновление INDEX.md
ТОЛЬКО если:
- Добавлена совершенно новая категория файлов
- Добавлены новые теги (не существовавшие ранее)

Иначе INDEX.md не трогать!

## Критерии успеха

- ✅ INDEX.md < 1000 tokens
- ✅ Каждый файл категории < 1000 tokens
- ✅ Read index + targeted file < 2000 tokens (vs 50K = 96% savings)
- ✅ Нет дубликатов между файлами
- ✅ Все записи имеют теги
- ✅ Протокол обновления документирован в CLAUDE.md
- ✅ Старые файлы архивированы

## Next Steps

1. Create folder structure
2. Extract & filter content from all sources
3. Create category files
4. Create INDEX.md
5. Update CLAUDE.md
6. Archive old files
7. Test with real scenario
