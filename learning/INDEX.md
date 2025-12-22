# Learning System Index

**Purpose:** Find knowledge fast without loading full file (1,326 lines)
**Token Cost:** INDEX (~500 tokens) + targeted read (~400 tokens) = ~900 tokens vs 10K+ full file

---

## 🔍 Quick Lookup

### Critical Issues (Check First!)

| Issue | Line | When to Check |
|-------|------|---------------|
| Set Node ={{ syntax | 32 | Before any Set Node config |
| IF Node branch param | 146 | Before IF connections |
| Switch duplicates | 517 | After Switch routing changes |
| addConnection 4-param | 146 | Before any addConnection |
| L-067 two-step exec | 871 | Before analyzing >10 node workflows |
| L-009 nullable types | 803 | AI Agent tool optional params fail |
| L-008 duplicate connections | 297 | Switch routes to wrong handler |
| L-007 sequential eval | 248 | Switch fails on missing fields |
| L-006 reorder conditions | 199 | Switch routing after reorder |
| L-005 Code variables | 461 | Code node "variable not defined" |
| L-004 IF branch missing | 174 | IF connection but node doesn't execute |

### By Category

| Category | Line | Entries | Key Topics |
|----------|------|---------|------------|
| **Critical Patterns** | 32 | 5 | Never Trust Defaults, Set ={{, IF conditions, HTTP continueOnFail, Cascading changes |
| **MCP Operations** | 146 | 6 | addConnection (4-param, branch, case), L-004, L-006, L-007, L-008 |
| **Node Configuration** | 461 | 3 | expressions, parameters, L-005 Code variables, data access syntax |
| **Switch Node** | 517 | 3 | L-006 reorder, L-007 sequential eval, L-008 duplicates, fan-out |
| **Code Node** | 560 | 3 | L-005 variables, L-060 deprecated syntax, regex escaping |
| **HTTP Request** | 599 | 3 | continueOnFail, L-101 credentials, status codes |
| **Telegram Bot** | 639 | 5 | L-100 Reply Keyboard (HTTP), L-097 fixedCollection, webhooks, message types |
| **AI Agent** | 742 | 8 | L-105 never "COMPLETELY IGNORE", L-104 quality gates, L-103 cascading context, L-098 memory caching, L-009 nullable |
| **Execution & Debugging** | 871 | 4 | L-067 two-step mode, anti-loop protocol, cycle limits, escalation |
| **Validation Errors** | 1041 | 4 | Never Trust Defaults, L-053 false positive, L-054 QA override, schema mismatch |
| **Notion Integration** | 1084 | 6 | Null-check dates, multi-user filters, timezone bug, page objects, Single Source of Truth |
| **Supabase Database** | 1175 | 5 | Schema verification, get vs getAll, NOT NULL fields, RPC signatures, RLS policies |
| **Common Gotchas** | 1258 | 4 | L-068 binary data, L-102 cascading changes, parameter changes, Never Trust Defaults |

### By Learning ID

| ID | Line | Title | Impact |
|----|------|-------|--------|
| L-004 | 174 | IF connection without branch → node never executes | HIGH |
| L-005 | 461 | Code Node variables from $input | MEDIUM |
| L-006 | 199 | Switch reorder conditions → must update connections | CRITICAL |
| L-007 | 248 | Switch sequential evaluation errors | CRITICAL |
| L-008 | 297 | Switch duplicate connections | HIGH |
| L-009 | 917 | AI Agent tool nullable types | MEDIUM |
| L-103 | 824 | Cascading context/memory overrides | CRITICAL |
| L-104 | 777 | Debug Quality Gates (post-mortem) | HIGH |
| L-105 | 744 | Never "COMPLETELY IGNORE" in prompts | CRITICAL |
| L-053 | 1051 | IF Node validator false positive | LOW |
| L-054 | 1063 | QA override for false positives | LOW |
| L-060 | 574 | Code Node deprecated syntax timeout | CRITICAL |
| L-067 | 1010 | Two-step execution for large workflows | CRITICAL |
| L-068 | 1258 | IF nodes don't pass binary data | CRITICAL |
| L-097 | 702 | Telegram fixedCollection format | MEDIUM |
| L-098 | 860 | AI Agent memory caching | CRITICAL |
| L-100 | 649 | Telegram Reply Keyboard (HTTP Request) | CRITICAL |
| L-101 | 623 | HTTP Request credential expression | MEDIUM |
| L-102 | 1276 | Cascading changes - test each | HIGH |

### By Tag

| Tag | Lines | Description |
|-----|-------|-------------|
| #critical | 32, 199, 248, 297, 574, 649, 751, 871, 896, 1258, 1276 | Critical issues - check first |
| #mcp | 146-460 | MCP operations and tools |
| #addConnection | 146, 174, 199 | Connection management |
| #branch | 146, 174 | IF/Switch branch routing |
| #case | 199, 297 | Switch case parameter |
| #expressions | 32, 461 | n8n expression syntax |
| #switch-node | 199, 248, 297, 517-559 | Switch Node issues |
| #code-node | 461, 560-598 | Code Node patterns |
| #telegram | 199, 248, 639-741 | Telegram bot issues |
| #ai-agent | 742-870 | AI Agent configuration |
| #validation | 32, 1041-1083 | Validation errors |
| #execution | 871-1040 | Execution and debugging |
| #anti-loop | 914-1013 | Anti-loop protocol |
| #binary-data | 1258 | Binary data handling |
| #debugging | 174, 248, 297, 871-1040 | Debugging techniques |

---

## 📖 Usage Protocol

### Reading

```javascript
// Step 1: Read INDEX to find topic (~500 tokens)
Read("learning/INDEX.md")

// Step 2: Find line number for category
// Example: "Switch Node" → Line 517

// Step 3: Read targeted section (~300-500 tokens)
Read("learning/LEARNINGS.md", {offset: 517, limit: 80})

// Alternative: Grep for keyword
Grep({pattern: "duplicate connection", path: "learning/LEARNINGS.md",
      output_mode: "content", "-n": true, "-B": 3, "-A": 15})
```

### Writing (After Solving Issue)

```javascript
// 1. Determine category
// Example: Fixed Switch Node issue → "Switch Node" category (line 517)

// 2. Read category section to get current content
Read("learning/LEARNINGS.md", {offset: 517, limit: 50})

// 3. Add new entry at TOP of category (newest first)
Edit("learning/LEARNINGS.md",
  old_string: "## Switch Node\n\n### [2025-12-15...",
  new_string: "## Switch Node\n\n### [2025-12-17 HH:MM] New Issue Title\n\n**Problem:**...\n\n### [2025-12-15..."
)

// 4. Update INDEX.md ONLY if line numbers shifted >50 lines
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

## 🎯 Quick Access Paths

### Before Node Configuration

1. **Set Node** → Line 32 (Critical Patterns) or Line 461 (Node Configuration)
2. **IF Node** → Line 32 (Critical Patterns) or Line 146 (MCP - branch param)
3. **Switch Node** → Line 517 (full section)
4. **Code Node** → Line 560 (full section)
5. **HTTP Request** → Line 32 (Critical Patterns) or Line 599 (full section)
6. **Telegram** → Line 639 (full section)
7. **AI Agent** → Line 742 (full section)

### Before Debugging

1. **Execution Analysis** → Line 871 (L-067 two-step mode)
2. **Anti-Loop Protocol** → Line 914 (cycle limits)
3. **Validation Errors** → Line 1041 (false positives)

### Before Database Operations

1. **Notion** → Line 1084 (filters, dates, timezone)
2. **Supabase** → Line 1175 (schema, RPC, RLS)

---

## 📊 Statistics

- **Total Lines:** 1,520
- **Total Entries:** 53+
- **Critical Issues:** 13 (L-004, L-006, L-007, L-008, L-060, L-067, L-068, L-097, L-098, L-100, L-102, L-103, L-105)
- **Categories:** 13
- **Most Common Tags:** #critical, #mcp, #switch-node, #ai-agent, #debugging, #post-mortem
- **Last Updated:** 2025-12-22

---

**Token Savings:** Reading INDEX (~500) + targeted section (~400) = ~900 tokens
**vs Full File:** 1,326 lines ≈ 10,000+ tokens
**Savings:** ~90% reduction in tokens per query
