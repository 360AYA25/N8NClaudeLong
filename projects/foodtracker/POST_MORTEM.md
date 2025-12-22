# Post-Mortem: /welcome Command - 18 Cycles, 2 Days

## Executive Summary

**Issue:** `/welcome` onboarding command failing to save data
**Duration:** 2 days (Dec 19-20, 2025)
**Cycles:** 18 debugging cycles
**User Frustration Level:** EXTREME ("пиздец!!!! 4 часа и нечего не работает!!!")

**Root Problem:** НЕ техническая сложность, а **системные недостатки в процессе отладки**

---

## Timeline Analysis

### Day 1 (Dec 19): Cycles 1-6
| Cycle | Problem | Fix | New Bug Introduced? |
|-------|---------|-----|---------------------|
| 1-2 | Macros not saving | Context pollution fix | - |
| 3 | RPC function missing | Create migration 012 | ❌ Function uses `updated_at` column that doesn't exist |
| 4 | AI not passing macros | Enhanced prompt | - |
| 5 | Wrong prompt deployed | Deploy correct version | - |
| 6 | Bot silence | Add `chatInput` field | ⚠️ Still passes `user_name` → leaks context |

### Day 2 Morning (Dec 20): Cycles 7-12 - Workflow Fixes
| Cycle | Problem | Fix | New Bug Introduced? |
|-------|---------|-----|---------------------|
| 7 | Bot silent | Fix `parametersBody` (12 params) | - |
| 8 | AI skipped 6 questions | Exclude `user_name` in welcome mode | ⚠️ Didn't check memory override |
| 9 | AI looped questions | Add MEMORY OVERRIDE to prompt | ❌ Override broke `chatInput` extraction |
| 10 | Bot silent (chatInput empty) | Add `$json.command` extraction | ❌ Didn't check `$json.data` path |
| 11 | Bot silent after first answer | Add `$json.data` extraction | - |
| 12 | Missing emojis/calories | UX prompt fix | - |

### Day 2 Afternoon (Dec 20): Cycles 13-15 - Database Fixes
| Cycle | Problem | Fix | New Bug Introduced? |
|-------|---------|-----|---------------------|
| 13 | RPC crash | Remove `updated_at = NOW()` | - |
| 14 | PostgREST returns `[]` | Change `SETOF JSON` → `JSON` | ❌ Typo: `calories_goal` instead of `calorie_goal` |
| 15 | Wrong column name | Fix typo | - |

### Day 2 Evening (Dec 20): Cycles 16-18 - AI Prompt Cascade
| Cycle | Problem | Fix | New Bug Introduced? |
|-------|---------|-----|---------------------|
| 16 | AI saw conflicting data | Add INPUT CONTEXT OVERRIDE | ❌ "COMPLETELY IGNORE" → too broad |
| 17 | AI forgot current session | Refine MEMORY OVERRIDE | ❌ Still ignoring `telegram_user_id` |
| 18 | Tool received `null` for telegram_user_id | Make explicit exception | ✅ FINAL FIX |

---

## Pattern Analysis: WHY 18 CYCLES?

### Pattern #1: КАСКАДНЫЕ ФИКСЫ (11 из 18 циклов)

```
Cycle N Fix → Creates Bug → Cycle N+1 Fix → Creates Bug → Cycle N+2...
```

**Примеры каскадов:**
- **Cascade A (Cycles 9-11):** Memory Override → broke chatInput → fixed command → broke data
- **Cascade B (Cycles 14-15):** PostgREST fix → typo → typo fix
- **Cascade C (Cycles 16-18):** Context override → too broad → too aggressive → missing exception

**Корневая причина:** Исправлял симптом, не понимая полную картину

---

### Pattern #2: НЕТ END-TO-END ТЕСТИРОВАНИЯ

**Что делал:**
```
1. Найти ошибку
2. Написать fix
3. Задеплоить
4. Сказать пользователю "проверяй"  ← ПРОБЛЕМА!
```

**Что должен был делать:**
```
1. Найти ошибку
2. Написать fix
3. СИМУЛИРОВАТЬ весь flow от /welcome до сохранения  ← ДОБАВИТЬ!
4. Проверить все edge cases
5. Только потом сказать "проверяй"
```

**Конкретный пример (Cycle 10-11):**
- Cycle 10: Добавил `$json.command` для `/welcome`
- НО НЕ ПРОВЕРИЛ что будет после первого ответа пользователя
- Cycle 11: Бот замолчал после "Сергей" → нужен `$json.data`

**Если бы я проследил весь flow:**
```
/welcome → Week Calculations → $json.command ✅
"Сергей" → Process Text → $json.data ❌ MISSING!
```

---

### Pattern #3: НЕТ СХЕМЫ ДАННЫХ ПЕРЕД ИЗМЕНЕНИЯМИ

**Cycle 13-15 ошибки:**
- Cycle 13: Написал `updated_at = NOW()` → колонка не существует
- Cycle 14-15: Написал `calories_goal` → колонка называется `calorie_goal`

**Что должен был сделать ПЕРЕД миграцией:**
```sql
-- ОБЯЗАТЕЛЬНО перед любой миграцией:
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users';
```

**Результат:** 2 лишних цикла из-за невнимательности к схеме

---

### Pattern #4: СЛИШКОМ ШИРОКИЕ ИНСТРУКЦИИ В ПРОМПТЕ

**Cycle 16:** "COMPLETELY IGNORE all conversation history"
- AI понял буквально → забыл данные ТЕКУЩЕЙ сессии

**Cycle 17:** "COMPLETELY IGNORE input context"
- AI понял буквально → забыл telegram_user_id

**Правило:** НИКОГДА не использовать "COMPLETELY IGNORE" без явных исключений

**Правильный формат:**
```
IGNORE: user_goals, user_profile (OLD database values)
ALWAYS USE: telegram_user_id (REQUIRED for tool)
```

---

### Pattern #5: АРХИТЕКТУРНАЯ ПРОБЛЕМА → WORKAROUND В ПРОМПТЕ

**Реальная проблема (Cycle 16):**
```javascript
// Inject Context проверяет /welcome только на ПЕРВОМ сообщении
const isWelcomeCommand = userMessage.trim().toLowerCase() === '/welcome';

// Когда пользователь отвечает "да" (confirmation):
// isWelcomeCommand = false → передаёт OLD database values!
```

**Мой workaround:**
Добавил INPUT CONTEXT OVERRIDE в AI промпт

**Правильное решение:**
```javascript
// Track session state, not just current message
const session = await getSessionState(telegram_user_id);
const isWelcomeSession = session?.mode === 'welcome';

if (isWelcomeSession) {
  // Exclude ALL context for entire /welcome flow
}
```

**Почему не сделал:** "Слишком сложно, промпт быстрее"
**Результат:** 3 лишних цикла (16-18) на исправление промпта

---

### Pattern #6: НЕТ ПРОВЕРКИ LEARNINGS.md

**В LEARNINGS.md уже было:**
- L-102: Cascading changes - test each
- L-098: AI Memory caching issues
- L-009: AI Agent tool nullable types

**Если бы прочитал ПЕРЕД Cycle 16:**
- Знал бы про cascading fix pattern
- Не использовал бы "COMPLETELY IGNORE"
- Сразу добавил бы exceptions

---

## Quantified Impact

### Time Breakdown
| Category | Cycles | Estimated Time | % of Total |
|----------|--------|----------------|------------|
| **Cascading Fixes** | 11 | ~6 hours | 55% |
| **No E2E Testing** | 4 | ~2 hours | 20% |
| **Schema Errors** | 2 | ~1 hour | 10% |
| **Prompt Overrides** | 3 | ~1.5 hours | 15% |
| **TOTAL** | 18 | ~10.5 hours | 100% |

### Avoidable Cycles
- **With E2E testing before deploy:** -4 cycles (Cycles 10, 11, 17, 18)
- **With schema verification:** -2 cycles (Cycles 13, 14-15)
- **With LEARNINGS.md check:** -3 cycles (Cycles 16, 17, 18)
- **With incremental changes:** -2 cycles (Cycles 9, 16)

**Minimum possible cycles:** 18 - 11 = **7 cycles**
**Time saved:** ~6 hours

---

## Root Causes Summary

### 1. Process Problems (70% of wasted time)
- No end-to-end flow simulation before deploy
- No schema verification before migrations
- No LEARNINGS.md consultation before debugging
- Fixing symptoms, not root causes

### 2. Technical Debt (20% of wasted time)
- Inject Context architecture flaw (checks command only once)
- Multiple data paths with different field names
- No session state tracking

### 3. Communication/UX (10% of wasted time)
- Handed off to user too early
- User frustrated ("4 часа и нечего не работает!!!")
- Multiple "проверяй" messages that failed

---

## Systemic Improvements Required

### Improvement #1: Pre-Deploy Checklist

**MANDATORY before saying "проверяй":**

```markdown
## Pre-Deploy Checklist

### 1. Schema Verification (for DB changes)
□ Ran `SELECT * FROM information_schema.columns WHERE table_name = 'X'`
□ Verified all column names in migration match schema
□ Tested RPC function manually in Supabase SQL Editor

### 2. Data Flow Tracing (for workflow changes)
□ Listed ALL Switch outputs affected
□ For each output: Identified input field name ($json.X)
□ Verified extraction logic handles ALL paths

### 3. E2E Flow Simulation
□ Traced full user journey (start to finish)
□ Identified all states (first message, answers, confirmation)
□ Tested each state manually or mentally

### 4. Cascading Impact Check
□ Listed all components touched by this change
□ Verified each component still works
□ Tested integration points

### 5. LEARNINGS.md Consultation
□ Searched for related issues (keywords)
□ Applied known solutions/patterns
□ Added new learning if novel issue
```

---

### Improvement #2: Anti-Cascade Protocol

**Before ANY fix that uses words like "IGNORE", "OVERRIDE", "DISABLE":**

```markdown
## Anti-Cascade Questions

1. **What EXACTLY should be ignored?**
   - List specific fields/values
   - NOT "everything" or "all"

2. **What should be PRESERVED?**
   - List explicit exceptions
   - Required fields, IDs, etc.

3. **Side effects?**
   - What else uses this data?
   - Will ignoring break something else?

4. **Can I test incrementally?**
   - Change ONE thing
   - Verify it works
   - Then change next thing
```

---

### Improvement #3: Execution Path Mapping

**Before modifying Code/Inject Context nodes:**

```markdown
## Switch Output → Field Mapping

| Switch Output | Node Path | Output Field | In Extraction? |
|---------------|-----------|--------------|----------------|
| 0 (Voice) | Whisper | `transcription` | ✅ |
| 1 (Photo) | Vision | `product_name` | ✅ |
| 2-9 (Commands) | Week Calc | `command` | ✅ |
| 10 (Text) | Process Text | `data` | ✅ |
| Direct | Telegram | `message.text` | ✅ |
| AI routing | Agent | `chatInput` | ✅ |

**Verify:** Each path has corresponding extraction source
```

---

### Improvement #4: Session State Architecture

**Instead of:**
```javascript
// Checking command text (breaks on subsequent messages)
const isWelcomeCommand = userMessage === '/welcome';
```

**Implement:**
```javascript
// Track session state in Redis/Database
const session = await redis.get(`session:${telegram_user_id}`);

// Set on /welcome start
if (userMessage === '/welcome') {
  await redis.set(`session:${telegram_user_id}`, {
    mode: 'welcome',
    step: 1,
    collected: {}
  }, 'EX', 3600);  // 1 hour TTL
}

// Check mode throughout conversation
if (session?.mode === 'welcome') {
  // Exclude context for ENTIRE welcome flow
}

// Clear on completion
if (session?.mode === 'welcome' && step === 'complete') {
  await redis.del(`session:${telegram_user_id}`);
}
```

---

### Improvement #5: Debug Loop Limits

**Add to CLAUDE.md:**

```markdown
## Debug Cycle Limits

| Attempts | Action Required |
|----------|-----------------|
| 1-2 | Normal debugging |
| 3 | STOP! Read LEARNINGS.md + review approach |
| 4-5 | Try fundamentally different approach |
| 6+ | Ask user for help OR rollback |

### Cascade Detection
If your fix CREATES a new bug:
1. STOP immediately
2. Revert to last working state
3. Analyze WHY fix created bug
4. Plan comprehensive fix (not incremental)
```

---

### Improvement #6: User Communication Protocol

**Instead of:**
```
"готово, проверяй"
```

**Use:**
```
"Применил fix для [конкретная проблема].

Что исправлено:
- [конкретное изменение]

Что проверил:
- [x] Schema matches
- [x] All data paths covered
- [x] E2E flow simulated

Ожидаемое поведение:
1. [step 1]
2. [step 2]
3. [expected result]

Если что-то пойдет не так, скажи мне:
- На каком шаге
- Что увидел
- Скриншот если есть"
```

---

## Updated CLAUDE.md Section

Add to `/Users/sergey/Projects/N8NClaudeLong/CLAUDE.md`:

```markdown
## Debug Quality Gates (MANDATORY)

### Before ANY Deploy

1. **Schema Check** (for DB changes)
   ```sql
   SELECT column_name FROM information_schema.columns WHERE table_name = 'X';
   ```

2. **Data Flow Map** (for workflow changes)
   - List ALL Switch outputs
   - Verify extraction for EACH

3. **E2E Simulation**
   - Trace full flow mentally/manually
   - Identify ALL states

4. **LEARNINGS.md Check**
   ```javascript
   Read("learning/INDEX.md")
   Grep({pattern: "relevant keyword", path: "learning/LEARNINGS.md"})
   ```

### Cascade Prevention

NEVER use broad overrides like:
- "COMPLETELY IGNORE"
- "ALWAYS OVERRIDE"
- "DISABLE ALL"

ALWAYS specify:
- EXACTLY what to ignore (field names)
- EXPLICIT exceptions (required fields)
- WHY (so AI understands intent)

### Cycle Limits

- **Cycle 3:** Check LEARNINGS.md
- **Cycle 5:** Different approach
- **Cycle 6+:** Ask user or rollback
```

---

## Lessons Learned (Add to LEARNINGS.md)

### L-104: Debug Quality Gates Prevent Cascading Fixes

**Problem:** 18 cycles to fix one feature due to cascading fixes
**Root Cause:** No systematic verification before deploy

**Prevention Checklist:**
1. Schema verification before migrations
2. Data flow mapping before Code node changes
3. E2E simulation before any deploy
4. LEARNINGS.md check before debugging

**Impact:** HIGH - Can reduce debug cycles by 60%+
**Tags:** #debugging #process #quality-gates #critical

---

### L-105: Never Use "COMPLETELY IGNORE" in AI Prompts

**Problem:** Broad override instructions cause AI to ignore required data
**Examples:**
- "COMPLETELY IGNORE input context" → AI ignores telegram_user_id
- "COMPLETELY IGNORE conversation history" → AI forgets current session

**Solution:** Always specify:
```
IGNORE: [specific fields] (reason)
ALWAYS USE: [required fields] (why required)
```

**Impact:** CRITICAL - Causes cascading failures
**Tags:** #ai-agent #prompt-engineering #critical

---

## Conclusion

**Этот post-mortem не о том, что я плохой отладчик.**

**Это о том, что БЕЗ СИСТЕМНОГО ПОДХОДА даже простая задача превращается в 18 циклов.**

### Action Items:

1. ✅ Add Pre-Deploy Checklist to CLAUDE.md
2. ✅ Add Anti-Cascade Protocol to CLAUDE.md
3. ✅ Add Cycle Limits to CLAUDE.md
4. ✅ Implement Session State Architecture (v1.5.0 - 2025-12-22)
5. ⏳ Add automated E2E testing (future)

---

## Нерешённые Проблемы (Technical Debt)

### 1. ✅ Архитектурная Проблема ИСПРАВЛЕНА (v1.5.0)

**Проблема (РЕШЕНА):** Inject Context проверял `/welcome` только на ПЕРВОМ сообщении
```javascript
// Текущий код (fragile workaround):
const isWelcomeCommand = userMessage.trim().toLowerCase() === '/welcome';
// Когда user отвечает "да" → isWelcomeCommand = false → старые данные
```

**Текущее решение:** AI prompt override (хрупко!)

**Правильное решение:**
```javascript
// Session state tracking (NOT IMPLEMENTED YET)
const session = await redis.get(`session:${telegram_user_id}`);

// Set on /welcome start
if (userMessage === '/welcome') {
  await redis.set(`session:${telegram_user_id}`, {
    mode: 'welcome',
    step: 1,
    startedAt: Date.now()
  }, 'EX', 3600);
}

// Check mode for ENTIRE session
if (session?.mode === 'welcome') {
  // Exclude context for ALL messages in this session
}

// Clear on completion
await redis.del(`session:${telegram_user_id}`);
```

**Оценка:** 2-4 часа на имплементацию
**Риск без фикса:** Следующее изменение в промпте может сломать /welcome снова

---

### 2. ⚠️ Нет Автоматического Тестирования

**Проблема:** Каждый fix требует ручного теста пользователем

**Решение:** E2E тест через n8n API
```javascript
// Test script: test_welcome_flow.js
async function testWelcomeFlow() {
  // 1. Trigger /welcome
  await triggerWebhook({message: '/welcome', user_id: TEST_USER});

  // 2. Answer all 11 questions
  const answers = ['Тест', '30', '175', '70', 'похудение', 'UTC', '100', '200', '50', '25', '2000'];
  for (const answer of answers) {
    await triggerWebhook({message: answer, user_id: TEST_USER});
    await sleep(1000);
  }

  // 3. Confirm
  await triggerWebhook({message: 'да', user_id: TEST_USER});

  // 4. Verify database
  const user = await supabase.from('users').select('*').eq('telegram_user_id', TEST_USER);

  assert(user.height_cm === 175);
  assert(user.protein_goal === 100);
  // etc.
}
```

**Оценка:** 4-6 часов на имплементацию
**Benefit:** Автоматическая проверка перед каждым deploy

---

### 3. ⚠️ Rollback Не Использовался

**Факт:** За 18 циклов ни разу не сделал rollback, хотя versioning включён

**Причина:** Не было четкого протокола "когда делать rollback"

**Добавить в протокол:**
```markdown
### Rollback Triggers (ОБЯЗАТЕЛЬНО)

Делать rollback НЕМЕДЛЕННО если:
1. Cycle 3+ на той же проблеме
2. Fix создал НОВУЮ критическую ошибку
3. Бот полностью молчит после deploy
4. User сообщает о regression в другой функции

Команда:
n8n_workflow_versions({mode: "rollback", workflowId: "sw3Qs3Fe3JahEbbW"})
```

---

### 4. ⚠️ Нет Мониторинга

**Проблема:** Узнаём что бот сломан только когда user жалуется

**Решение:** Health check endpoint
```javascript
// Добавить в workflow: Scheduled Trigger (каждые 5 минут)
// → HTTP Request to test endpoint
// → IF response != expected → Send Telegram alert

// Или использовать n8n Error Workflow:
// Workflow Settings → Error Workflow → Alert Workflow
```

**Оценка:** 1-2 часа на имплементацию

---

## Priority Matrix

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| Session State Architecture | HIGH | 4h | ✅ DONE (v1.5.0) |
| E2E Test Script | HIGH | 6h | P1 |
| Rollback Protocol | MEDIUM | 30min | ✅ DONE (CLAUDE.md) |
| Health Check Monitoring | MEDIUM | 2h | P2 |

---

## Рекомендация

**Immediate (P0):** ✅ Done - Quality gates в CLAUDE.md

**Next Session (P1):**
1. Implement session state tracking in Inject Context
2. Create E2E test script for /welcome

**Future (P2):**
- Health check monitoring
- Automated regression testing

---

*Created: 2025-12-22*
*Author: Claude (self-analysis)*
*Purpose: Prevent 18-cycle debugging sessions in future*
