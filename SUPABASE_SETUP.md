# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in your project details:
   - Project name: "go-and-tell" (or your preferred name)
   - Database password: (create a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"

## Step 2: Create Database Tables

1. In your Supabase dashboard, go to the **SQL Editor** (left sidebar)
2. Click "New Query"
3. Copy the entire content from `supabase-setup.sql` file
4. Paste it into the SQL editor
5. Click "Run" to execute the SQL commands

This will create:
- `witness_profiles` table - stores user profile information
- `testimonies` table - stores testimony data linked to profiles
- `souls` table - stores souls won/added by users
- `witness_cards` table - stores generated witness cards
- `user_points` table - tracks points and statistics for each user
- `point_transactions` table - logs all point-earning actions
- Indexes for better query performance
- Triggers to automatically update `updated_at` timestamps
- Row Level Security policies (currently set to allow all operations)

## Step 3: Get Your API Keys

1. In your Supabase dashboard, go to **Project Settings** (gear icon in left sidebar)
2. Click on **API** in the Configuration section
3. You'll see three important values:

   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public key**: (long string starting with `eyJ...`)
   - **service_role key**: (long string starting with `eyJ...`)

## Step 4: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **IMPORTANT**: Never commit the `.env` file to version control!

## Step 5: Verify Setup

1. Restart your development server
2. The backend should now connect to Supabase
3. Check the backend console for any connection errors

## Updating Existing Database

If you already have an existing database and need to add the new columns to the `testimonies` table, run this SQL in the SQL Editor:

```sql
-- Add new columns to testimonies table
ALTER TABLE testimonies ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE testimonies ADD COLUMN IF NOT EXISTS original_message TEXT;
ALTER TABLE testimonies ADD COLUMN IF NOT EXISTS enhanced_message TEXT;
```

This will add the required columns without affecting existing data.

## Database Schema

### witness_profiles
Stores user profile information
- `id` (UUID, Primary Key)
- `name` (TEXT)
- `contact` (TEXT)
- `role` (TEXT)
- `photo_uri` (TEXT, optional)
- `country` (TEXT, optional)
- `district` (TEXT, optional)
- `assembly` (TEXT, optional)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### testimonies
Stores testimony data linked to profiles
- `id` (UUID, Primary Key)
- `witness_profile_id` (UUID, Foreign Key → witness_profiles.id)
- `category` (TEXT, optional) - Type of testimony: "seen", "heard", "experienced"
- `original_message` (TEXT, optional) - Original testimony message
- `enhanced_message` (TEXT, optional) - AI-enhanced testimony message
- `tell_online` (BOOLEAN)
- `tell_in_person` (BOOLEAN)
- `go_workplace` (BOOLEAN)
- `go_school` (BOOLEAN)
- `go_neighborhood` (BOOLEAN)
- `heard` (TEXT[])
- `seen` (TEXT[])
- `experienced` (TEXT[])
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### souls
Stores souls won/added by users
- `id` (UUID, Primary Key)
- `witness_profile_id` (UUID, Foreign Key → witness_profiles.id)
- `name` (TEXT)
- `contact` (TEXT, optional)
- `location` (TEXT, optional)
- `latitude` (DOUBLE PRECISION, optional)
- `longitude` (DOUBLE PRECISION, optional)
- `notes` (TEXT, optional)
- `handed_to` (TEXT, optional) - Who you handed them to
- `date` (DATE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### witness_cards
Stores generated witness cards
- `id` (UUID, Primary Key)
- `witness_profile_id` (UUID, Foreign Key → witness_profiles.id)
- `card_data` (JSONB) - Stores card configuration
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### user_points
Tracks points and statistics for each user (leaderboard)
- `id` (UUID, Primary Key)
- `witness_profile_id` (UUID, Foreign Key → witness_profiles.id, UNIQUE)
- `total_points` (INTEGER) - Total points earned
- `testimonies_count` (INTEGER) - Total testimonies added
- `testimonies_seen_count` (INTEGER) - "What I've seen" testimonies
- `testimonies_heard_count` (INTEGER) - "What I've heard" testimonies
- `testimonies_experienced_count` (INTEGER) - "What I've experienced" testimonies
- `souls_count` (INTEGER) - Total souls added
- `shares_count` (INTEGER) - Total shares made
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### point_transactions
Logs all point-earning actions
- `id` (UUID, Primary Key)
- `witness_profile_id` (UUID, Foreign Key → witness_profiles.id)
- `action_type` (TEXT) - Type of action: "testimony_seen", "testimony_heard", "testimony_experienced", "soul_added", "share"
- `points` (INTEGER) - Points awarded for this action
- `description` (TEXT, optional) - Description of the action
- `metadata` (JSONB, optional) - Additional data about the action
- `created_at` (TIMESTAMP)

## Points System

Points are awarded for the following actions:
1. **Creating a Testimony:**
   - "What I've seen": 3 points
   - "What I've heard": 2 points
   - "What I've experienced": 5 points
2. **Adding a Soul:** 10 points
3. **Sharing:** 2 points (for any testimony, witness card, or content)

## API Endpoints

Your backend now has these tRPC endpoints:

### Witness Endpoints
- `witness.saveProfile` - Create a new witness profile
- `witness.saveTestimony` - Create a new testimony
- `witness.getProfile` - Get a profile by ID
- `witness.getTestimonies` - Get all testimonies for a profile
- `witness.updateTestimony` - Update a testimony
- `witness.deleteTestimony` - Delete a testimony
- `witness.enhanceTestimony` - Enhance testimony with AI
- `witness.enhanceWitnessCard` - Enhance witness card with AI

### Points Endpoints
- `points.awardPoints` - Award points for an action
- `points.getLeaderboard` - Get leaderboard with user rankings
- `points.getUserStats` - Get detailed stats for a user

## Security Notes

- The current setup uses **service_role_key** which bypasses RLS
- For production, consider implementing proper authentication
- Update RLS policies to match your security requirements
- Never expose service_role_key on the client side

## Troubleshooting

**Connection errors:**
- Verify your `.env` file has correct values
- Check that Supabase project is active
- Ensure database tables were created successfully

**Query errors:**
- Check the SQL Editor for any table creation errors
- Verify column names match the schema
- Check Supabase logs in the dashboard

**Authentication issues:**
- Make sure you're using service_role_key in the backend
- Verify API keys haven't expired
- Check project status in Supabase dashboard

**Point tracking issues:**
- Verify `user_points` record exists for the profile
- Check `point_transactions` table for transaction logs
- Ensure triggers are properly set up

## Next Steps

After setting up Supabase:
1. Test the connection by creating a profile
2. Add a testimony and verify points are awarded
3. Add a soul and check the leaderboard
4. Test sharing functionality
5. Monitor the Supabase dashboard for any errors
