# Learning System Index

**Purpose:** Find knowledge fast without loading full file (1,326 lines)
**Token Cost:** INDEX (~500 tokens) + targeted read (~400 tokens) = ~900 tokens vs 10K+ full file

---

## 🔍 Quick Lookup

### Critical Issues (Check First!)

| Issue | Line | When to Check |
|-------|------|---------------|
| **L-113 AI Prompt Token Economy** | **34** | **BEFORE writing/editing AI_PROMPT.md** |
| **L-110 NEVER fix working systems** | **102** | **BEFORE touching ANY production workflow** |
| **L-112 DOT NOTATION for updateNode** | **280** | **BEFORE any n8n_update_partial_workflow** |
| Set Node ={{ syntax | 98 | Before any Set Node config |
| IF Node branch param | 212 | Before IF connections |
| Switch duplicates | 583 | After Switch routing changes |
| addConnection 4-param | 212 | Before any addConnection |
| L-067 two-step exec | 937 | Before analyzing >10 node workflows |
| L-009 nullable types | 869 | AI Agent tool optional params fail |
| L-008 duplicate connections | 363 | Switch routes to wrong handler |
| L-007 sequential eval | 314 | Switch fails on missing fields |
| L-006 reorder conditions | 265 | Switch routing after reorder |
| L-005 Code variables | 527 | Code node "variable not defined" |
| L-004 IF branch missing | 240 | IF connection but node doesn't execute |
| L-109 prompt over-spec | 810 | Before adding aggressive AI prompt instructions |

### By Category

| Category | Line | Entries | Key Topics |
|----------|------|---------|------------|
| **Critical Patterns** | 98 | 6 | L-113 AI Prompt Token Economy, L-110 Never Fix Working, L-112 DOT NOTATION, Never Trust Defaults, Set ={{, IF conditions |
| **MCP Operations** | 212 | 6 | addConnection (4-param, branch, case), L-004, L-006, L-007, L-008 |
| **Node Configuration** | 527 | 3 | expressions, parameters, L-005 Code variables, data access syntax |
| **Switch Node** | 583 | 3 | L-006 reorder, L-007 sequential eval, L-008 duplicates, fan-out |
| **Code Node** | 626 | 3 | L-005 variables, L-060 deprecated syntax, regex escaping |
| **HTTP Request** | 665 | 3 | continueOnFail, L-101 credentials, status codes |
| **Telegram Bot** | 705 | 5 | L-100 Reply Keyboard (HTTP), L-097 fixedCollection, webhooks, message types |
| **AI Agent** | 874 | 13 | L-111 chatInput only, L-109 prompt over-specification, L-108 Memory Detection, L-107 DB session unreliable, L-106 optimizeResponse:false, L-105 never "IGNORE", L-104 quality gates, L-103 cascading, L-098 memory, L-009 nullable |
| **Execution & Debugging** | 937 | 4 | L-067 two-step mode, anti-loop protocol, cycle limits, escalation |
| **Validation Errors** | 1107 | 4 | Never Trust Defaults, L-053 false positive, L-054 QA override, schema mismatch |
| **Notion Integration** | 1150 | 6 | Null-check dates, multi-user filters, timezone bug, page objects, Single Source of Truth |
| **Supabase Database** | 1241 | 5 | Schema verification, get vs getAll, NOT NULL fields, RPC signatures, RLS policies |
| **Common Gotchas** | 1324 | 4 | L-068 binary data, L-102 cascading changes, parameter changes, Never Trust Defaults |

### By Learning ID

| ID | Line | Title | Impact |
|----|------|-------|--------|
| L-113 | 34 | AI Agent Prompt Token Economy (4x waste) | CRITICAL |
| L-110 | 102 | NEVER Fix Working Systems | CRITICAL |
| L-112 | 280 | DOT NOTATION for updateNode | CRITICAL |
| L-004 | 240 | IF connection without branch → node never executes | HIGH |
| L-005 | 527 | Code Node variables from $input | MEDIUM |
| L-006 | 265 | Switch reorder conditions → must update connections | CRITICAL |
| L-007 | 314 | Switch sequential evaluation errors | CRITICAL |
| L-008 | 363 | Switch duplicate connections | HIGH |
| L-009 | 1156 | AI Agent tool nullable types | MEDIUM |
| L-053 | 1117 | IF Node validator false positive | LOW |
| L-054 | 1129 | QA override for false positives | LOW |
| L-060 | 640 | Code Node deprecated syntax timeout | CRITICAL |
| L-067 | 1076 | Two-step execution for large workflows | CRITICAL |
| L-068 | 1324 | IF nodes don't pass binary data | CRITICAL |
| L-097 | 768 | Telegram fixedCollection format | MEDIUM |
| L-098 | 926 | AI Agent memory caching | CRITICAL |
| L-100 | 715 | Telegram Reply Keyboard (HTTP Request) | CRITICAL |
| L-101 | 689 | HTTP Request credential expression | MEDIUM |
| L-102 | 1342 | Cascading changes - test each | HIGH |
| L-103 | 1063 | Cascading context/memory overrides | CRITICAL |
| L-104 | 1016 | Debug Quality Gates (post-mortem) | HIGH |
| L-105 | 981 | Never "COMPLETELY IGNORE" in prompts | CRITICAL |
| L-106 | 917 | toolHttpRequest optimizeResponse:false blocks AI | HIGH |
| L-107 | 874 | Session state DB unreliability | HIGH |
| L-108 | 875 | Unified SESSION DETECTION - Memory vs DB | CRITICAL |
| L-109 | 943 | Prompt over-specification breaks features | CRITICAL |
| L-111 | 876 | AI Agent only reads chatInput field | CRITICAL |

### By Tag

| Tag | Lines | Description |
|-----|-------|-------------|
| #critical | 34, 98, 102, 265, 280, 314, 363, 640, 715, 817, 937, 962, 1324, 1342 | Critical issues - check first |
| #ai-prompt | 34 | AI Agent prompt writing (L-113) |
| #token-economy | 34 | Token efficiency for prompts |
| #mcp | 212-526 | MCP operations and tools |
| #addConnection | 212, 240, 265 | Connection management |
| #branch | 212, 240 | IF/Switch branch routing |
| #case | 265, 363 | Switch case parameter |
| #expressions | 98, 527 | n8n expression syntax |
| #switch-node | 265, 314, 363, 583-625 | Switch Node issues |
| #code-node | 527, 626-664 | Code Node patterns |
| #telegram | 265, 314, 705-807 | Telegram bot issues |
| #ai-agent | 808-936 | AI Agent configuration |
| #validation | 98, 1107-1149 | Validation errors |
| #execution | 937-1106 | Execution and debugging |
| #anti-loop | 980-1079 | Anti-loop protocol |
| #binary-data | 1324 | Binary data handling |
| #debugging | 240, 314, 363, 937-1106 | Debugging techniques |
| #dot-notation | 280 | DOT NOTATION for updateNode (L-112) |
| #updateNode | 280 | n8n_update_partial_workflow updateNode |

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

1. **Set Node** → Line 98 (Critical Patterns) or Line 527 (Node Configuration)
2. **IF Node** → Line 98 (Critical Patterns) or Line 212 (MCP - branch param)
3. **Switch Node** → Line 583 (full section)
4. **Code Node** → Line 626 (full section)
5. **HTTP Request** → Line 98 (Critical Patterns) or Line 665 (full section)
6. **Telegram** → Line 705 (full section)
7. **AI Agent** → Line 808 (full section)
8. **AI Prompt Writing** → Line 34 (L-113 token economy)

### Before Debugging

1. **Execution Analysis** → Line 937 (L-067 two-step mode)
2. **Anti-Loop Protocol** → Line 980 (cycle limits)
3. **Validation Errors** → Line 1107 (false positives)

### Before Database Operations

1. **Notion** → Line 1150 (filters, dates, timezone)
2. **Supabase** → Line 1241 (schema, RPC, RLS)

---

## 📊 Statistics

- **Total Lines:** 1,886+
- **Total Entries:** 60
- **Critical Issues:** 18 (L-004, L-006, L-007, L-008, L-060, L-067, L-068, L-097, L-098, L-100, L-102, L-103, L-105, L-108, L-109, L-110, L-111, L-112, L-113)
- **Categories:** 13
- **Most Common Tags:** #critical, #ai-prompt, #token-economy, #mcp, #switch-node, #ai-agent, #debugging, #dot-notation, #updateNode
- **Last Updated:** 2025-12-23

---

**Token Savings:** Reading INDEX (~500) + targeted section (~400) = ~900 tokens
**vs Full File:** 1,326 lines ≈ 10,000+ tokens
**Savings:** ~90% reduction in tokens per query
