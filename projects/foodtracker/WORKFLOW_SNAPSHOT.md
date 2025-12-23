# FoodTracker Workflow Canonical Snapshot

**Version:** v136
**Date:** 2025-12-23 03:36 EST
**Status:** ✅ WORKING - Tested and verified
**File:** [workflow_v136_canonical.json](workflow_v136_canonical.json)

---

## What This Is

This is the **canonical working snapshot** of the FoodTracker n8n workflow after fixing the chatInput context issue.

## Workflow Details

- **ID:** sw3Qs3Fe3JahEbbW
- **Name:** FoodTracker
- **Nodes:** 56
- **Active:** Yes
- **Last Updated:** 2025-12-23T02:31:36.988Z

## Key Fixes in v136

### 1. AI Agent Context Fix (L-111)
**Problem:** AI Agent was showing placeholders "[Your Goal]", "[Your Weight]" instead of real values

**Root Cause:** LangChain AI Agent in n8n only reads `chatInput` field, ignores all other JSON fields

**Solution:** Inject Context node now embeds user data INSIDE chatInput:
```javascript
chatInput = userMessage + '\n\n<user_context>\ntelegram_user_id: 682776858\nname: Сергей\nage: 66\nweight_kg: 98\n...\n</user_context>';
```

### 2. Session State Tracking (v1.5.0)
- Automatic session detection for /welcome, /settings, /meals
- Database-backed session state (user_sessions table)
- Context isolation for multi-step commands

### 3. Response Format
- ✅ Russian language with emojis 📊🥩🍞🧈🌾💧
- ✅ Real user values (no placeholders)
- ✅ Proper macro formatting

## Verified Working Features

- `/welcome` - Complete onboarding (12 questions)
- `/settings` - Show current settings with real values
- `/meals` - Meal template management
- `/day` - Daily summary
- `/week` - Weekly summary
- Food logging (text, voice, photo)
- Water logging
- All 15 tools working correctly

## Critical Nodes

| Node ID | Name | Type | Critical? |
|---------|------|------|-----------|
| inject-context-001 | Inject Context | code | **YES** - Embeds user context in chatInput |
| cdfe74df-5815-4557-bf8f-f0213d9ca8ad | AI Agent | langchain.agent | **YES** - Core AI with tools |
| 18d2242f-51eb-48c9-8d1c-1fef81ce9974 | OpenAI Chat Model | langchain.lmChatOpenAi | **YES** - GPT-4o-mini |
| memory-buffer-node-001 | Conversation Memory | langchain.memoryPostgresChat | **YES** - 10 message history |

## How to Restore

```bash
# If workflow breaks, restore from this snapshot:
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -H "Content-Type: application/json" \
  -d @workflow_v136_canonical.json
```

## Related Documentation

- [debug_log.md](debug_log.md#L1096) - Full debugging history
- [LEARNINGS.md](../../learning/LEARNINGS.md#L810) - L-111: AI Agent chatInput
- [AI_PROMPT.md](AI_PROMPT.md) - Current AI prompt (13,321 chars)
- [ARCHITECTURE.md](ARCHITECTURE.md) - Workflow architecture
- [SUPABASE_SCHEMA.md](SUPABASE_SCHEMA.md) - Database schema

## Version History

- **v133:** Last working before Claude's intervention
- **v134:** ❌ BROKEN - Claude's catastrophic update (20KB deleted)
- **v125:** User's manual rollback target
- **v135:** Inject Context fix (partial - still had placeholders)
- **v136:** ✅ WORKING - chatInput context embedding fix

## Notes

- This snapshot was created after **4 debugging attempts** over 3 hours
- Root cause: AI Agent architectural limitation (only reads chatInput)
- Fix is permanent as long as Inject Context node preserves context embedding logic
- Any future changes to Inject Context must maintain `<user_context>` tags in chatInput

---

**Created:** 2025-12-23 03:36 EST
**By:** Claude (after user testing confirmed working)
**Status:** ✅ CANONICAL - Use this as reference for rollbacks
