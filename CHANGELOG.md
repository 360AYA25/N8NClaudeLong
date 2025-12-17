# Changelog

All notable changes to this project will be documented in this file.

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
