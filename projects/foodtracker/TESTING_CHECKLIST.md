# Task 2.6.5 - Testing Checklist

**Task:** Advanced Features & UX
**Status:** Implementation complete, testing in progress
**Workflow:** sw3Qs3Fe3JahEbbW v288+

---

## 🧪 Test Plan

### Pre-Test Setup
- [ ] Verify workflow active: `n8n_get_workflow({id: "sw3Qs3Fe3JahEbbW"})`
- [ ] Check recent executions for errors
- [ ] Confirm user registered in `foodtracker_users`

---

## 1️⃣ Timezone Management (1-2h estimated)

### Test Cases

#### TC-1.1: View Current Timezone
```
User: /timezone
Expected: Shows current timezone (e.g., "Europe/Moscow")
```
- [ ] Command recognized
- [ ] Current timezone displayed
- [ ] Clear instructions shown

#### TC-1.2: Set Timezone by City
```
User: установить часовой пояс Торонто
Expected: Sets timezone to America/Toronto
```
- [ ] AI understands request
- [ ] Timezone updated in DB
- [ ] Confirmation message shown
- [ ] Verify DB: `SELECT timezone FROM foodtracker_users WHERE telegram_user_id = X`

#### TC-1.3: Verify Local Time in Responses
```
User: 100г курицы
Expected: Response includes local time
```
- [ ] SYSTEM prefix has correct date
- [ ] SYSTEM prefix has correct time
- [ ] Timezone applied correctly

**Results:**
```
✅ PASS / ❌ FAIL / ⚠️ PARTIAL

Issues:


```

---

## 2️⃣ Monthly Report `/month` (2-3h estimated)

### Test Cases

#### TC-2.1: Generate Monthly Report
```
User: /month
Expected: 30-day summary with trends
```
- [ ] Command recognized
- [ ] Report generated successfully
- [ ] Shows totals for 30 days
- [ ] Includes all macros (cal, protein, carbs, fat, fiber, water)

#### TC-2.2: Verify Calculations
```
Check: Manual calculation vs report totals
```
- [ ] Calories total correct
- [ ] Protein total correct
- [ ] Carbs total correct
- [ ] Fat total correct
- [ ] Fiber total correct
- [ ] Water total correct

#### TC-2.3: Visual Indicators
```
Expected: Emoji indicators for trends
```
- [ ] 📈 Trends shown
- [ ] ⭐ Best days highlighted
- [ ] ⚠️ Problem areas noted
- [ ] Formatting clean and readable

**Results:**
```
✅ PASS / ❌ FAIL / ⚠️ PARTIAL

Issues:


```

---

## 3️⃣ Interactive Reports (2-3h estimated)

### Test Cases

#### TC-3.1: Ask About Daily Report
```
User: /day
User: почему я не достиг цели?
Expected: AI analyzes daily report and explains
```
- [ ] `/day` report generated
- [ ] AI understands follow-up question
- [ ] AI provides analysis with data
- [ ] Answer relevant and helpful

#### TC-3.2: Ask About Weekly Trends
```
User: /week
User: какие тенденции?
Expected: AI identifies patterns in weekly data
```
- [ ] `/week` report generated
- [ ] AI analyzes trends
- [ ] Identifies patterns (e.g., "protein low on weekdays")
- [ ] Provides actionable insights

#### TC-3.3: Ask About Monthly Report
```
User: /month
User: в чем моя проблема?
Expected: AI identifies issues from monthly data
```
- [ ] `/month` report generated
- [ ] AI spots problems (e.g., "low fiber all month")
- [ ] Suggests improvements
- [ ] Context-aware response

**Results:**
```
✅ PASS / ❌ FAIL / ⚠️ PARTIAL

Issues:


```

---

## 4️⃣ Meal Management (3-4h estimated)

### Test Cases

#### TC-4.1: Add Meal
```
User: Добавить блюдо Борщ: свекла 100г, капуста 50г, мясо 150г
Expected: Meal saved to user_meals table
```
- [ ] AI understands command
- [ ] Parses ingredients correctly
- [ ] Saves to `user_meals` table
- [ ] Confirmation with ingredient list
- [ ] Verify DB: `SELECT * FROM user_meals WHERE user_id = X AND meal_name = 'Борщ'`

#### TC-4.2: Use Saved Meal
```
User: я съел Борщ
Expected: AI breaks down into ingredients and logs each
```
- [ ] AI recognizes meal name
- [ ] Fetches from `user_meals`
- [ ] Logs each ingredient separately
- [ ] Calculates total macros
- [ ] Confirmation shows breakdown

#### TC-4.3: Edit Meal
```
User: Изменить блюдо Борщ: +картофель 80г, -мясо 50г
Expected: Meal updated in database
```
- [ ] AI understands edit command
- [ ] Adds new ingredient (картофель)
- [ ] Removes/reduces existing (мясо)
- [ ] Updates `user_meals` table
- [ ] Shows updated ingredient list

#### TC-4.4: Break Down Meal
```
User: Разобрать пиццу на ингредиенты
Expected: AI estimates ingredients in pizza
```
- [ ] AI understands breakdown request
- [ ] Provides estimated ingredients
- [ ] Shows grams for each
- [ ] Saves to `user_meals` if user confirms

#### TC-4.5: List User Meals
```
User: покажи мои блюда
Expected: Lists all saved meals
```
- [ ] AI fetches from `user_meals`
- [ ] Shows meal names
- [ ] Shows ingredients for each
- [ ] Clean formatting

**Results:**
```
✅ PASS / ❌ FAIL / ⚠️ PARTIAL

Issues:


```

---

## 5️⃣ Welcome Flow `/welcome` (2-3h estimated)

### Test Cases

#### TC-5.1: Start Welcome Flow
```
User: /welcome
Expected: Onboarding conversation starts
```
- [ ] Command recognized
- [ ] AI starts conversation
- [ ] Asks for name first
- [ ] Friendly tone

#### TC-5.2: Collect All Data
```
Expected: AI asks all questions and saves answers
```
- [ ] 👤 Name collected
- [ ] 🚻 Gender collected (мужчина/женщина)
- [ ] 📍 City/Timezone collected
- [ ] 🎯 Goals collected (похудеть/набрать массу/поддержать вес)
- [ ] 📊 Macros collected (calories, protein, fat, carbs)
- [ ] 💪 Activity level collected (сидячий/умеренный/активный)

#### TC-5.3: Verify Data Saved
```
Check: foodtracker_users table
```
- [ ] `name` saved correctly
- [ ] `gender` saved correctly
- [ ] `timezone` updated
- [ ] `goal_calories` updated
- [ ] `goal_protein` updated
- [ ] `goal_fat` updated
- [ ] `goal_carbs` updated
- [ ] `activity_level` saved
- [ ] Query: `SELECT * FROM foodtracker_users WHERE telegram_user_id = X`

#### TC-5.4: Auto-Calculate Macros
```
User provides: weight, height, age, goal, activity
Expected: AI calculates recommended macros
```
- [ ] AI asks for metrics
- [ ] Calculates calories (BMR + activity)
- [ ] Suggests protein (1.6-2.2g/kg)
- [ ] Suggests fat (20-30% of calories)
- [ ] Suggests carbs (remainder)
- [ ] User can accept or customize

#### TC-5.5: Re-run Welcome
```
User: /welcome (second time)
Expected: Updates existing profile
```
- [ ] AI recognizes returning user
- [ ] Offers to update profile
- [ ] Keeps existing data if not changed
- [ ] Updates only changed fields

**Results:**
```
✅ PASS / ❌ FAIL / ⚠️ PARTIAL

Issues:


```

---

## 📊 Overall Results

### Summary
- **Total Test Cases:** 18
- **Passed:** ___
- **Failed:** ___
- **Partial:** ___
- **Success Rate:** ____%

### Critical Issues
1.
2.
3.

### Minor Issues
1.
2.
3.

### Recommendations
1.
2.
3.

---

## 🎯 Next Steps

### If All Pass (✅)
- [ ] Update TODO.md: Mark Task 2.6.5 as complete
- [ ] Move to Task 2.7 (Native Barcode Scanner)
- [ ] Update PROJECT_STATE.md

### If Issues Found (❌)
- [ ] Document issues in LEARNINGS.md
- [ ] Create bug fix plan
- [ ] Fix critical issues
- [ ] Re-test failed cases

---

**Test Date:** 2025-12-17
**Tester:** Claude + Sergey
**Workflow Version:** v288+
**Status:** 🔄 In Progress
