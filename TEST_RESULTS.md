# Supabase Testing System

## Overview
A comprehensive testing system has been implemented to verify all Supabase database functions are working correctly.

## What Was Created

### 1. Test Route (`backend/trpc/routes/test/run-tests/route.ts`)
A comprehensive test procedure that tests all database operations in sequence:
- ✅ Create witness profile
- ✅ Save testimony
- ✅ Add soul
- ✅ Create witness card
- ✅ Award points (testimony_seen - 3 points)
- ✅ Award points (soul_added - 10 points)
- ✅ Award points (share - 2 points)
- ✅ Get user stats
- ✅ Get leaderboard
- ✅ Get testimonies

### 2. Test UI Page (`app/test-supabase.tsx`)
A beautiful dark-themed testing interface that:
- Shows real-time test progress
- Displays success/error status for each test
- Shows detailed results and data
- Provides a summary of test results
- Lists what will be tested before running

### 3. Navigation Integration
Added "Test Database" menu item to the dashboard side menu for easy access.

## How to Use

### Step 1: Access Test Page
1. Open the app
2. Open the side menu (hamburger icon)
3. Tap "Test Database"

### Step 2: Run Tests
1. Review what will be tested (listed on the page)
2. Tap "Run All Tests" button
3. Watch the tests run in real-time

### Step 3: Review Results
After tests complete, you'll see:
- ✅ Success indicator if all tests passed
- ❌ Error indicator if any test failed
- Summary with:
  - Test profile ID created
  - Total points awarded
  - Number of testimonies, souls, and witness cards created
- Detailed log of each test step with:
  - Status indicator (✅ success, ❌ error, 🔄 running)
  - Any error messages
  - Data returned from each operation

## What Gets Created During Tests

The test creates **ONE record each** in the following tables:

### 1. Witness Profile
```json
{
  "name": "Test User",
  "contact": "+1234567890",
  "role": "Pastor",
  "country": "Test Country",
  "district": "Test District",
  "assembly": "Test Assembly"
}
```

### 2. Testimony
```json
{
  "tell_online": true,
  "tell_in_person": false,
  "go_workplace": true,
  "go_school": false,
  "go_neighborhood": true,
  "heard": ["Test heard testimony"],
  "seen": ["Test seen testimony"],
  "experienced": ["Test experienced testimony"]
}
```

### 3. Soul
```json
{
  "name": "Test Soul",
  "contact": "+9876543210",
  "location": "123 Test Street, Test City, Test Region, Test Country",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "notes": "Test notes for soul",
  "handed_to": "Test Church",
  "date": "2025-01-23"
}
```

### 4. Witness Card
```json
{
  "card_data": {
    "testimony": "Test testimony",
    "verse": "John 3:16",
    "design": "modern"
  }
}
```

### 5. Points System
- **3 points** for testimony_seen
- **10 points** for soul_added
- **2 points** for share
- **Total: 15 points** for the test profile

## Database Tables Tested

1. ✅ `witness_profiles` - User profiles
2. ✅ `testimonies` - User testimonies
3. ✅ `souls` - Souls won/added
4. ✅ `witness_cards` - Generated witness cards
5. ✅ `user_points` - Points tracking
6. ✅ `point_transactions` - Point history

## API Endpoints Tested

### Witness Endpoints
- ✅ `witness.saveProfile`
- ✅ `witness.saveTestimony`
- ✅ `witness.getTestimonies`

### Points Endpoints
- ✅ `points.awardPoints`
- ✅ `points.getLeaderboard`
- ✅ `points.getUserStats`

## Expected Results

If everything is configured correctly, you should see:
- ✅ All 10 test steps pass
- Total points: 15
- 1 testimony created
- 1 soul added
- 1 witness card created
- Test profile visible in leaderboard

## Troubleshooting

### If Tests Fail

1. **Check Supabase Credentials**
   - Verify `SUPABASE_URL` in `.env`
   - Verify `SUPABASE_SERVICE_ROLE_KEY` in `.env`

2. **Check Database Setup**
   - Ensure you've run the SQL from `supabase-setup.sql`
   - Verify all tables exist in Supabase dashboard
   - Check RLS policies are enabled

3. **Review Error Messages**
   - Each test shows specific error messages
   - Look for connection errors, permission errors, or schema mismatches

4. **Check Console Logs**
   - Open browser/app console for detailed error logs
   - Backend will log any Supabase errors

## Next Steps

After successful tests:
1. ✅ Verify test data appears in Supabase dashboard
2. ✅ Check leaderboard shows test user
3. ✅ Confirm points are correctly calculated
4. ✅ Test actual app features (add testimony, add soul, etc.)

## Cleaning Up Test Data

Test data can be cleaned up directly in Supabase dashboard:
1. Go to Table Editor
2. Find records with "Test" in names
3. Delete test records if desired

Or run this SQL in Supabase SQL Editor:
```sql
DELETE FROM witness_profiles WHERE name = 'Test User';
-- This will cascade delete all related records due to foreign keys
```
