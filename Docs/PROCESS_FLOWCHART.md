# CLAUDE.md Process Flowchart

**Purpose:** Visual map of when each protocol/process triggers
**Source:** CLAUDE.md (~10K tokens)

---

## Master Decision Tree

```
USER MESSAGE RECEIVED
        │
        ▼
┌───────────────────────────────────────────────────────────────┐
│                    TASK TYPE DETECTION                         │
└───────────────────────────────────────────────────────────────┘
        │
        ├─── "Build workflow" ──────────► WORKFLOW PROCESS (lines 85-155)
        │                                       │
        │                                       ├─► Templates First (MANDATORY)
        │                                       ├─► Node Discovery
        │                                       ├─► Configuration
        │                                       ├─► Validation
        │                                       └─► Deployment
        │
        ├─── "Fix bug/debug" ─────────► DEBUG SESSION PROTOCOL (lines 711-861)
        │                                       │
        │                                       ├─► Check debug_log.md
        │                                       ├─► Save checkpoint
        │                                       ├─► Check LEARNINGS.md
        │                                       ├─► Apply fix
        │                                       └─► Escalation Protocol (if fails)
        │
        ├─── "Continue work" ─────────► SESSION START CHECKLIST (lines 865-908)
        │                                       │
        │                                       ├─► Read PROJECT_STATE.md
        │                                       ├─► Check TodoWrite
        │                                       └─► Resume or restart
        │
        └─── Any multi-step task ─────► TASK TRACKING (TodoWrite)
                                               │
                                               └─► 3+ steps = MANDATORY TodoWrite

---

## Workflow Process (Building)

```
START: User wants workflow
        │
        ▼
┌─────────────────────────────────────────┐
│  1. TEMPLATE DISCOVERY (MANDATORY)       │
│     Execute 3+ searches IN PARALLEL:     │
│     - search_templates(keyword)          │
│     - search_templates(by_task)          │
│     - search_templates(by_metadata)      │
└─────────────────────────────────────────┘
        │
        ├─── Templates found? ───► YES ───► get_template() → validate → deploy
        │
        ▼ NO
┌─────────────────────────────────────────┐
│  2. NODE DISCOVERY                       │
│     - search_nodes(query)                │
│     - get_node(detail: 'standard')       │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  3. VALIDATION (Multi-level)             │
│     L1: validate_node(mode: 'minimal')   │
│     L2: validate_node(mode: 'full')      │
│     L3: validate_workflow()              │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  4. BUILDING                             │
│     - Set ALL parameters explicitly      │
│     - Never trust defaults               │
│     - Connect nodes                      │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  5. DEPLOYMENT                           │
│     - n8n_create_workflow()              │
│     - n8n_validate_workflow()            │
│     - n8n_test_workflow()                │
└─────────────────────────────────────────┘
```

---

## Debug / Fix Protocol

```
START: Bug or error reported
        │
        ▼
┌─────────────────────────────────────────┐
│  STEP 0: Check debug_log.md              │
│     Was this issue attempted before?     │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  STEP 1: Save checkpoint                 │
│     n8n_workflow_versions(mode: "list")  │
│     Remember version for rollback        │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  STEP 2: Check LEARNINGS.md              │
│     Read(learning/INDEX.md)              │
│     Read targeted section                │
└─────────────────────────────────────────┘
        │
        ├─── Solution found? ───► YES ───► Apply known solution
        │
        ▼ NO
┌─────────────────────────────────────────┐
│  STEP 3: Record attempt in debug_log.md  │
│     BEFORE attempting fix!               │
└─────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────┐
│  STEP 4: Apply fix                       │
│     - Change ONE thing at a time         │
│     - Validate after each change         │
└─────────────────────────────────────────┘
        │
        ├─── Fixed? ───► YES ───► Update debug_log.md ✅
        │                         Add to LEARNINGS.md if new
        │
        ▼ NO (Failed)
┌─────────────────────────────────────────┐
│  ESCALATION PROTOCOL (MANDATORY)         │
│                                          │
│  L1-L2 (attempts 1-3): Local search      │
│     └─► Read INDEX.md, LEARNINGS.md      │
│                                          │
│  L3 (attempt 4): WebSearch Community     │
│     └─► site:community.n8n.io            │
│                                          │
│  L4 (attempt 5): WebSearch GitHub+Docs   │
│     └─► site:github.com/n8n-io           │
│     └─► site:docs.n8n.io                 │
│                                          │
│  L5 (attempt 6): Broad WebSearch         │
│     └─► No site restriction              │
│                                          │
│  L6 (attempt 7+): Escalate to User       │
│     └─► WITH all search results          │
│     └─► OR rollback to checkpoint        │
└─────────────────────────────────────────┘
```

---

## Pre-Deploy Checklist (Debug Quality Gates)

```
BEFORE saying "готово, проверяй":
        │
        ├─► [DB changes?] ───► Schema Verification
        │       └─► Check column names exist
        │       └─► Check column types match
        │       └─► Test RPC function in SQL Editor
        │
        ├─► [Workflow changes?] ───► Data Flow Tracing
        │       └─► Map ALL execution paths
        │       └─► Verify ALL output fields
        │
        ├─► E2E Flow Simulation
        │       └─► Trace full user journey
        │       └─► Verify each state
        │
        ├─► Cascading Impact Check
        │       └─► List all touched components
        │       └─► Verify each still works
        │
        └─► LEARNINGS.md Consultation
                └─► Check for known issues
```

---

## When Each Protocol Triggers

| Trigger | Protocol | Lines in CLAUDE.md |
|---------|----------|-------------------|
| "Build workflow" | Workflow Process | 85-155 |
| "Fix bug" | Debug Session Protocol | 711-861 |
| Attempt 2+ fails | Escalation Protocol | 631-685 |
| Attempt 4+ | MANDATORY WebSearch | 639-658 |
| Before deploy | Debug Quality Gates | 448-584 |
| New session | Session Start Checklist | 865-908 |
| 3+ step task | TodoWrite | 55-83 |
| After fix | Update LEARNINGS.md | 687-695 |

---

## Critical Rules Summary

| Rule | When | Action |
|------|------|--------|
| Templates First | Building | 3+ parallel searches BEFORE scratch |
| Never Trust Defaults | Always | Set ALL parameters explicitly |
| TodoWrite | 3+ steps | Track progress |
| Silent Execution | Always | No commentary between tools |
| One Change at a Time | Debugging | Validate after EACH change |
| WebSearch at L3+ | Debugging | MANDATORY, not optional |
| Checkpoint First | Debugging | Save version BEFORE fixing |

---

*Created: 2025-12-22*
*Purpose: Quick reference for when processes trigger*
