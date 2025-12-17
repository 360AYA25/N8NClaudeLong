# Projects Folder

Эта папка содержит все материалы для работы над конкретными n8n workflows.

## Структура

```
projects/
├── README.md              # Этот файл
├── foodtracker/           # FoodTracker Telegram Bot
│   ├── PROJECT_STATE.md   # Текущее состояние workflow
│   ├── notes.md           # Заметки, идеи (опционально)
│   └── debug_log.md       # Debug сессии (опционально)
└── [другие-workflows]/    # Другие проекты
```

## Правила организации

### 1. Один workflow = одна папка
- Название папки = название workflow в lowercase (с дефисами вместо пробелов)
- Примеры: `foodtracker`, `email-automation`, `slack-notifier`

### 2. Обязательные файлы
- **PROJECT_STATE.md** - текущее состояние проекта (workflow ID, узлы, проблемы, checkpoints)

### 3. Опциональные файлы
- **notes.md** - идеи, заметки, планы на будущее
- **debug_log.md** - детальные логи debug-сессий
- **architecture.md** - описание архитектуры (для сложных workflows)
- **credentials.md** - список необходимых credentials (БЕЗ секретов!)

## Зачем отдельные папки?

✅ **Изоляция** - работа над одним workflow не мешает другим
✅ **Переключение контекста** - легко переключаться между проектами
✅ **Архивация** - завершённые проекты можно архивировать
✅ **Поиск** - все файлы по проекту в одном месте

## Как начать новый проект

```bash
# 1. Создать папку
mkdir -p projects/my-workflow

# 2. Создать PROJECT_STATE.md
# См. Docs/SESSION_INIT_GUIDE.md для шаблона

# 3. Начать работу
# Следовать SESSION_INIT_GUIDE.md
```

## Связь с другими файлами проекта

```
/N8NClaudeLong/
├── CLAUDE.md          # Глобальные инструкции для всех workflows
├── LEARNINGS.md       # Общая база знаний (все проекты)
└── projects/          # Специфичные файлы для каждого workflow
    └── [workflow]/
```

**Правило:**
- Общие learnings → `LEARNINGS.md` (корень)
- Специфичные для workflow → `projects/[workflow]/PROJECT_STATE.md`

---

*См. [Docs/SESSION_INIT_GUIDE.md](../Docs/SESSION_INIT_GUIDE.md) для полной инструкции*
