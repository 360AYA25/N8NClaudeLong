# Project State: FoodTracker Bot

## Workflow Info
- **ID:** sw3Qs3Fe3JahEbbW
- **Name:** FoodTracker
- **Nodes:** 56
- **Connections:** 54
- **Status:** ✅ Active (deployed)
- **Versioning:** Not enabled (0 versions tracked)

---

## Architecture Overview

### Core Components
- ✅ **Telegram Trigger** - основной вход + sub-workflow trigger
- ✅ **AI Agent** - LangChain agent с OpenAI GPT
- ✅ **15 AI Tools** - все через toolHttpRequest (Supabase API)
- ✅ **Conversation Memory** - PostgreSQL для контекста
- ✅ **Supabase** - логирование сообщений + проверка пользователей

### Input Processing (Мультимодальность)
- ✅ **Текст** → Process Text → AI Agent
- ✅ **Голос** → Download → Whisper Transcription → AI Agent
- ✅ **Фото** → 3-Level Recognition Chain:
  1. Extract Barcode (OpenAI Vision)
  2. OpenFoodFacts API → IF fail → UPC Database API
  3. IF no barcode OR all APIs fail → Vision Analysis (full photo)

### Smart Routing
- ✅ **Switch Node** (11 outputs) - роутинг по типу сообщения
- ✅ **Simple Reply** - 8 команд (/start, /help, /stats, /goal, /week, /month, /meals, /settings)
- ✅ **Route to AI?** - оптимизация: простые команды без AI → экономия токенов

### UX Features
- ✅ **Typing Indicator** - показывает "печатает..." пока AI думает
- ✅ **Custom Keyboard** - через HTTP Request (не Telegram node) - L-100
- ✅ **Strip Signature** - убирает технические метки перед отправкой

---

## What Works

### ✅ Core Functionality
- [x] Telegram trigger and message processing
- [x] User registration check (Supabase)
- [x] Message logging (Supabase)
- [x] Typing indicator

### ✅ Multimodal Input
- [x] Text message processing
- [x] Voice message → Whisper transcription
- [x] Photo processing:
  - [x] Barcode extraction (Vision)
  - [x] OpenFoodFacts API lookup
  - [x] UPC Database fallback
  - [x] Vision Analysis fallback

### ✅ AI Agent (15 Tools)
**Food Management:**
- [x] Save Food Entry
- [x] Search Food by Product
- [x] Search Similar Entries
- [x] Search Today Entries
- [x] Delete Food Entry

**Reports:**
- [x] Get Daily Summary
- [x] Get Monthly Summary

**Settings:**
- [x] Update User Goal
- [x] Update User Timezone
- [x] Update User Onboarding

**Meal Planning:**
- [x] Add User Meal
- [x] Search User Meals
- [x] Update User Meal
- [x] Delete User Meal

**Water:**
- [x] Log Water Intake

### ✅ Memory & Context
- [x] PostgreSQL Conversation Memory (LangChain)
- [x] Inject Context node - добавляет user data перед AI
- [x] Save User Message + Save AI Response

---

## Known Issues

### ⚠️ No Issues Reported
*Пока нет известных проблем в текущей версии*

---

## Что нужно проверить

### 🔍 Потенциальные улучшения
1. **Versioning** - включить n8n workflow versioning для rollback capability
2. **Error Handling** - проверить continueOnFail на критичных узлах
3. **Binary Data** - убедиться что IF nodes не теряют фото (L-068)
4. **Reply Keyboard** - проверить что используется HTTP Request (L-100), не Telegram node

---

## Checkpoints

### Current State
- **Latest:** Deployed production version (56 nodes, все функции работают)
- **No Version History:** Versioning не включен в n8n

### Рекомендация
```javascript
// Включить versioning для будущих изменений:
// n8n UI → Workflow Settings → Enable Version Control
```

---

## Technical Decisions

| Decision | Rationale | Reference |
|----------|-----------|-----------|
| HTTP Request для Telegram keyboard | Telegram node не поддерживает Reply Keyboard | L-100 |
| Code Nodes для парсинга | Гибкость обработки Vision/Barcode/UPC ответов | Architecture |
| 15 отдельных Tool nodes | Модульность - каждый инструмент = отдельный endpoint | Best Practice |
| PostgreSQL Memory | LangChain требует для Conversation Memory | LangChain Docs |
| 3-level fallback для фото | Defensive: OpenFoodFacts → UPC → Vision | Reliability |
| Strip Signature | Убирает технические метки перед ответом пользователю | UX |

---

## Session History

### 2025-12-17 (Session Init)
- ✅ Создан PROJECT_STATE.md
- ✅ Проанализирована структура workflow (56 nodes, 54 connections)
- ✅ Проверен LEARNINGS.md (15 записей)
- ✅ Версионирование: не включено (0 versions)

**Status:** Готов к работе. Workflow в production, никаких изменений не требуется unless user requests.

---

## Next Steps

*Ожидаю инструкций от пользователя:*
- Добавить новую функциональность?
- Исправить ошибку?
- Оптимизировать существующие узлы?
- Включить versioning?

---

## Quick Commands

```bash
# Проверить состояние workflow
n8n_get_workflow({id: "sw3Qs3Fe3JahEbbW", mode: "structure"})

# Включить versioning (в n8n UI)
# Settings → Version Control → Enable

# Проверить execution logs
n8n_executions({action: "list", workflowId: "sw3Qs3Fe3JahEbbW", limit: 5})

# Перед изменениями - создать snapshot
# (после включения versioning)
```

---

*Last Updated: 2025-12-17*
