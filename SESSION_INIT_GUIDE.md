# Session Init Guide - Длинные n8n Проекты

> Как правильно начать работу над существующим workflow который нужно доделать

---

## Шаг 1: Создать PROJECT_STATE.md

В корне проекта создать файл с текущим состоянием:

```markdown
# Project State: [Название Workflow]

## Workflow Info
- **ID:** sw3Qs3Fe3JahEbbW
- **Name:** FoodTracker Bot
- **Nodes:** 29
- **Status:** В разработке

## Что работает
- [ ] Telegram trigger
- [ ] AI Agent базовая логика
- [x] Supabase подключение

## Что нужно доделать
1. Добавить Reply Keyboard
2. Исправить memory persistence
3. Настроить error handling

## Текущая проблема
[Описание что сейчас не работает]

## Последние изменения
- 2025-12-17: Добавил X узел
- 2025-12-16: Исправил Y

## Checkpoints (рабочие версии)
- v157: Базовая версия, всё работает
- v220: После добавления keyboard (сломано)
```

---

## Шаг 2: Инициализация сессии

### 2.1 Получить текущее состояние

```javascript
// Проверить версии workflow
n8n_workflow_versions({mode: "list", workflowId: "ID", limit: 5})

// Получить структуру (безопасно для больших workflow)
n8n_get_workflow({id: "ID", mode: "structure"})
```

### 2.2 Определить checkpoint

```javascript
// Запомнить последнюю рабочую версию
TodoWrite([
  {content: "Checkpoint: v157 (рабочая)", status: "completed", activeForm: "Saved"},
  {content: "Текущая задача: [описание]", status: "in_progress", activeForm: "Working..."}
])
```

### 2.3 Проверить LEARNINGS.md

```javascript
// Поиск по ключевым словам текущей проблемы
Grep({pattern: "telegram|keyboard|reply", path: "LEARNINGS.md"})
```

---

## Шаг 3: Структура работы

### Для КАЖДОЙ задачи:

```
1. Записать в PROJECT_STATE.md что делаю
2. Сделать checkpoint (если меняю workflow)
3. Проверить LEARNINGS.md (может уже решал)
4. Сделать изменение
5. Validate
6. Если ошибка → записать в LEARNINGS.md
7. Обновить PROJECT_STATE.md
```

### При ошибке (Anti-Loop):

```
Попытка 1: ❌ → записать что пробовал
Попытка 2: ❌ → сравнить с попыткой 1, записать
Попытка 3: ❌ → СТОП! Grep LEARNINGS.md, искать альтернативу
Попытка 4-5: Другой подход
Попытка 6+: Спросить пользователя или rollback
```

---

## Шаг 4: Завершение сессии

### Обновить PROJECT_STATE.md:

```markdown
## Последние изменения
- 2025-12-17 15:30: Добавил Reply Keyboard через HTTP Request (L-100)
- 2025-12-17 14:00: Исправил binary data после IF (L-068)

## Checkpoints
- v230: После keyboard fix (РАБОТАЕТ)
- v157: Базовая версия
```

### Если решил новую проблему → добавить в LEARNINGS.md

---

## Пример: Начало работы над FoodTracker

### 1. Создаю PROJECT_STATE.md

```markdown
# Project State: FoodTracker Bot

## Workflow Info
- **ID:** sw3Qs3Fe3JahEbbW
- **Nodes:** 29
- **Status:** Keyboard не работает

## Что нужно сделать
1. Reply Keyboard кнопки не появляются
2. После IF node фото теряется

## Checkpoints
- v157: Всё кроме keyboard работает
```

### 2. Инициализирую сессию

```javascript
// Версии
n8n_workflow_versions({mode: "list", workflowId: "sw3Qs3Fe3JahEbbW", limit: 3})
// → v230 current, v220, v157

// Checkpoint
TodoWrite([{content: "Checkpoint: v157", status: "completed", activeForm: "Saved"}])

// Проверяю LEARNINGS
Grep({pattern: "keyboard|telegram", path: "LEARNINGS.md"})
// → Нашёл L-100: Telegram node не поддерживает Reply Keyboard!
```

### 3. Применяю известное решение

```javascript
// L-100 говорит: использовать HTTP Request вместо Telegram node
// Делаю изменение...
// Validate...
// Работает!
```

### 4. Обновляю PROJECT_STATE.md

```markdown
## Последние изменения
- 2025-12-17: Keyboard fix через HTTP Request (L-100)

## Checkpoints
- v235: После keyboard fix (РАБОТАЕТ)
```

---

## Quick Commands

```bash
# Начать сессию
1. Read PROJECT_STATE.md
2. n8n_workflow_versions list
3. Grep LEARNINGS.md по проблеме

# Во время работы
- TodoWrite для tracking
- Validate после каждого изменения
- Записывать что пробовал

# При ошибке
- Context Injection: "ALREADY TRIED: ..."
- На попытке 3: проверить LEARNINGS
- На попытке 6: спросить или rollback

# Завершить сессию
1. Update PROJECT_STATE.md
2. Если новое решение → Add to LEARNINGS.md
3. Commit changes
```

---

## Файлы проекта

```
/project/
├── CLAUDE.md              # Инструкции + Anti-Loop Protocol
├── LEARNINGS.md           # База знаний (растёт)
├── PROJECT_STATE.md       # Текущее состояние проекта
├── CHANGELOG.md           # История версий
└── workflow.json          # (опционально) локальная копия
```

---

*Главное: записывать что делаешь, использовать checkpoints, проверять LEARNINGS перед попытками*
