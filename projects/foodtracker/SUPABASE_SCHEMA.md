# FoodTracker Supabase Schema

**Project:** MultiBOT
**Project ID:** qyemyvplvtzpukvktkae
**URL:** https://qyemyvplvtzpukvktkae.supabase.co
**Last Updated:** 2025-12-22

---

## Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS (3)                                │
│  id (UUID) ◄─────────────────────────────────────────────────┐  │
│  telegram_user_id (bigint) ◄──────────────────────────────┐  │  │
└─────────────────────────────────────────────────────────────┼──┼─┘
                                                              │  │
    ┌──────────────────────┬──────────────────────┬──────────┼──┼────────┐
    │                      │                      │          │  │        │
    ▼                      ▼                      ▼          │  │        ▼
┌────────────┐      ┌────────────┐      ┌────────────┐       │  │  ┌────────────┐
│ water_     │      │ user_      │      │ user_      │       │  │  │ foodtrack- │
│ intake (4) │      │ meals (5)  │      │ sessions   │       │  │  │ er_entries │
│            │      │            │      │ (0)        │       │  │  │ (115)      │
│ telegram_  │      │ user_id ───┘      │ telegram_  │       │  │  │            │
│ user_id ───┘      │ (bigint)          │ user_id ───┘       │  │  │ user_id ───┘
│ (bigint)          └────────────┘      │ (bigint)           │  │  │ (UUID)
└────────────┘                          └────────────┘       │  │  └────────────┘
                                                             │  │
┌────────────────────────────────────────────────────────────┼──┼─┐
│ n8n_chat_histories (64)                                    │  │ │
│ session_id = telegram_user_id as string (NO FK)            │  │ │
└────────────────────────────────────────────────────────────┼──┼─┘
                                                             │  │
┌────────────────────────────────────────────────────────────┼──┼─┐
│ message_processing_log (905)                               │  │ │
│ user_id (UUID) ────────────────────────────────────────────┼──┘ │
│ telegram_user_id (bigint) ─────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ healthbot_health_days (0)    │ healthbot_import_logs (0)       │
│ user_id (UUID) → users.id    │ user_id (UUID) → users.id       │
│ (Not used by FoodTracker)    │ (Not used by FoodTracker)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tables

### 1. users (3 records)

**Main user table. All other tables reference this.**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key (UUID) |
| `telegram_user_id` | bigint | NO | - | Telegram user ID (unique) |
| `telegram_username` | text | YES | - | @username |
| `owner` | text | NO | - | Owner identifier |
| `name` | text | YES | - | User's name |
| `age` | integer | YES | - | User's age |
| `height_cm` | integer | YES | - | Height in cm |
| `weight_kg` | numeric | YES | - | Weight in kg |
| `goal` | text | YES | - | User's goal (lose/maintain/gain) |
| `timezone` | text | YES | 'America/Toronto' | User timezone |
| `calorie_goal` | integer | YES | 2000 | Daily calorie goal |
| `protein_goal` | integer | YES | 150 | Daily protein goal (g) |
| `fat_goal` | integer | YES | 65 | Daily fat goal (g) |
| `carbs_goal` | integer | YES | 250 | Daily carbs goal (g) |
| `fiber_goal` | integer | YES | 25 | Daily fiber goal (g) |
| `water_goal_ml` | integer | YES | 2000 | Daily water goal (ml) |
| `onboarding_completed` | boolean | YES | false | Onboarding status |
| `created_at` | timestamptz | YES | now() | Created timestamp |
| `registration_date` | timestamptz | YES | now() | Registration date |

**RLS:** `qual=false` (blocked direct access, use RPC functions)

---

### 2. foodtracker_entries (115 records)

**Food consumption log entries.**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK → users.id |
| `date` | date | NO | - | Entry date |
| `entry_time` | time | YES | - | Entry time |
| `owner` | text | NO | - | Owner identifier |
| `food_item` | text | NO | - | Food name |
| `quantity` | numeric | YES | - | Amount |
| `unit` | text | YES | - | Unit (g, ml, шт) |
| `calories` | integer | YES | 0 | Calories |
| `protein` | integer | YES | 0 | Protein (g) |
| `fats` | integer | YES | 0 | Fats (g) |
| `carbs` | integer | YES | 0 | Carbs (g) |
| `fiber` | integer | YES | 0 | Fiber (g) |
| `source` | text | YES | 'manual' | Source (ai_agent, manual, barcode) |
| `nutrition_source` | text | YES | - | Nutrition data source |
| `confidence` | text | YES | - | AI confidence level |
| `openfoodfacts_code` | text | YES | - | OpenFoodFacts barcode |
| `nutriscore` | text | YES | - | Nutri-Score (A-E) |
| `synced_to_notion` | boolean | YES | false | Notion sync status |
| `created_at` | timestamptz | YES | now() | Created timestamp |

**FK:** `user_id` → `users.id` (UUID)
**RLS:** `qual=false` (blocked direct access)

---

### 3. water_intake (4 records)

**Water consumption tracking.**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `telegram_user_id` | bigint | NO | - | FK → users.telegram_user_id |
| `amount_ml` | integer | NO | - | Amount in ml |
| `intake_date` | date | NO | CURRENT_DATE | Intake date |
| `intake_time` | time | NO | CURRENT_TIME | Intake time |
| `created_at` | timestamp | YES | now() | Created timestamp |

**FK:** `telegram_user_id` → `users.telegram_user_id` (bigint)
**RLS:** `qual=false` (blocked direct access)

---

### 4. user_meals (5 records)

**User's saved meal templates (custom foods).**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | bigint | NO | - | FK → users.telegram_user_id |
| `meal_name` | text | NO | - | Meal name |
| `slang_names` | text[] | YES | '{}' | Alternative names |
| `calories_per_100g` | integer | YES | - | Calories per 100g |
| `protein_per_100g` | numeric | YES | - | Protein per 100g |
| `carbs_per_100g` | numeric | YES | - | Carbs per 100g |
| `fat_per_100g` | numeric | YES | - | Fat per 100g |
| `fiber_per_100g` | numeric | YES | - | Fiber per 100g |
| `default_portion_g` | integer | YES | 100 | Default portion size |
| `portion_name` | text | YES | - | Portion name (чашка, порция) |
| `last_used_at` | timestamptz | YES | - | Last usage time |
| `created_at` | timestamptz | YES | now() | Created timestamp |
| `updated_at` | timestamptz | YES | now() | Updated timestamp |

**FK:** `user_id` → `users.telegram_user_id` (bigint)
**RLS:** `qual=false` (blocked direct access)

---

### 5. user_sessions (0 records)

**Active command sessions (for multi-step commands like /welcome).**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `telegram_user_id` | bigint | NO | - | PK, FK → users.telegram_user_id |
| `active_command` | text | NO | - | Current command (/welcome, /settings) |
| `command_step` | integer | YES | 1 | Current step number |
| `started_at` | timestamptz | YES | now() | Session start time |
| `expires_at` | timestamptz | YES | now() + 1 hour | Session expiry |
| `data` | jsonb | YES | '{}' | Session data (collected answers) |

**FK:** `telegram_user_id` → `users.telegram_user_id` (bigint)
**No RLS** (public access)

---

### 6. n8n_chat_histories (64 records)

**LangChain memory storage for AI Agent conversations.**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | integer | NO | serial | Primary key |
| `session_id` | varchar | NO | - | Session ID (telegram_user_id as string) |
| `message` | jsonb | NO | - | Message content {type, data} |

**No FK** (uses telegram_user_id as string in session_id)
**RLS:** `qual=false` (blocked direct access)

**Message format:**
```json
{
  "type": "human" | "ai",
  "data": {
    "content": "message text",
    "additional_kwargs": {}
  }
}
```

---

### 7. message_processing_log (905 records)

**Telegram message processing log (deduplication & tracking).**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `message_id` | bigint | NO | - | Telegram message ID |
| `user_id` | uuid | YES | - | FK → users.id |
| `telegram_user_id` | bigint | NO | - | Telegram user ID |
| `message_type` | text | YES | - | Message type (text, voice, photo) |
| `processing_status` | text | YES | 'processing' | Status (processing, completed, error) |
| `started_at` | timestamptz | YES | now() | Processing start |
| `completed_at` | timestamptz | YES | - | Processing end |
| `error_message` | text | YES | - | Error details |
| `retry_count` | integer | YES | 0 | Retry attempts |

**FK:** `user_id` → `users.id` (UUID)
**RLS:** `qual=false` (blocked direct access)

---

### 8-9. healthbot_* tables (0 records)

**Not used by FoodTracker. Reserved for HealthBot integration.**

- `healthbot_health_days` - Daily health metrics (steps, weight, sleep, HRV)
- `healthbot_import_logs` - Health data import logs

---

## Foreign Key Types

**Important:** The schema uses **mixed FK types**:

| FK Type | Tables | Notes |
|---------|--------|-------|
| UUID (users.id) | foodtracker_entries, message_processing_log, healthbot_* | Older tables |
| bigint (users.telegram_user_id) | water_intake, user_meals, user_sessions | Newer tables |

**All RPC functions use `telegram_user_id` (bigint)** for consistency.

---

## RLS Security Model

All tables with user data have RLS enabled with `qual=false`:

```sql
CREATE POLICY "Block direct access" ON table_name
  FOR ALL TO public USING (false) WITH CHECK (false);
```

**Access is only through RPC functions** with `SECURITY DEFINER`.

---

## RPC Functions (Used by Workflow)

### Food Tracking

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `save_food_entry` | p_telegram_user_id, p_food_item, p_quantity, p_unit, p_calories, p_protein, p_carbs, p_fats, p_fiber, p_source, p_date, p_time | json | Save food entry |
| `delete_food_entry` | p_telegram_user_id, p_entry_id | json | Delete entry by ID |
| `search_food_by_product` | p_telegram_user_id, p_search_text, p_start_date, p_end_date | TABLE | Search entries by product name |
| `search_similar_entries` | p_telegram_user_id, p_search_text, p_limit | json | Find similar entries |
| `search_today_entries` | p_telegram_user_id, p_date | json | Today's entries |
| `get_daily_entries` | p_telegram_user_id, p_date | TABLE | Get entries for date |

### Reports

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `get_daily_summary` | p_telegram_user_id, p_date | jsonb | Daily summary with totals |
| `get_monthly_summary` | p_telegram_user_id, p_month, p_year | jsonb | Monthly summary with trends |

### Water Tracking

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `log_water_intake` | p_telegram_user_id, p_amount_ml, p_intake_date | jsonb | Log water consumption |

### User Management

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `check_user_registered` | p_telegram_user_id | TABLE | Check if user exists |
| `get_user_profile` | p_telegram_user_id | json | Get user profile with goals |
| `update_user_goal` | p_telegram_user_id, p_goal_type, p_goal_value | json | Update single goal |
| `update_user_onboarding` | p_telegram_user_id, p_name, p_age, ... | json | Complete onboarding |
| `update_user_timezone` | p_telegram_user_id, p_timezone | json | Update timezone |

### User Meals (Templates)

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `add_user_meal` | p_user_id, p_meal_data | jsonb | Add meal template |
| `search_user_meals` | p_user_id, p_query | jsonb | Search meals |
| `update_user_meal` | p_meal_id, p_updates | jsonb | Update meal |
| `delete_user_meal` | p_meal_id | jsonb | Delete meal |

### Sessions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `start_user_session` | p_telegram_user_id, p_command | json | Start command session |
| `get_user_session` | p_telegram_user_id | json | Get active session |
| `end_user_session` | p_telegram_user_id | json | End session |

### Message Processing

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `log_message_processing` | p_message_id, p_telegram_user_id, p_message_type | uuid | Log message start |

---

## Workflow Data Flow

```
Telegram Message
      │
      ▼
┌─────────────────┐
│ log_message_    │ → message_processing_log
│ processing      │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ check_user_     │ → users (check registration)
│ registered      │
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ AI Agent        │ → n8n_chat_histories (LangChain memory)
│                 │
│ Tools:          │
│ - save_food_entry      → foodtracker_entries
│ - log_water_intake     → water_intake
│ - get_daily_summary    ← foodtracker_entries + water_intake
│ - search_user_meals    ← user_meals
│ - update_user_goal     → users
└─────────────────┘
      │
      ▼
┌─────────────────┐
│ Response to     │
│ Telegram        │
└─────────────────┘
```

---

## Notes

1. **conversation_messages** - DELETED (was duplicate of n8n_chat_histories)
2. **Weekly report** - Uses `get_daily_summary` × 7 days in Code node
3. **Monthly report** - Uses `get_monthly_summary` RPC function
4. **Mixed FK types** - Works correctly, all RPC use telegram_user_id
