-- Create witness_profiles table
CREATE TABLE IF NOT EXISTS witness_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  role TEXT NOT NULL,
  photo_uri TEXT,
  country TEXT,
  district TEXT,
  assembly TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create testimonies table
CREATE TABLE IF NOT EXISTS testimonies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  witness_profile_id UUID NOT NULL REFERENCES witness_profiles(id) ON DELETE CASCADE,
  tell_online BOOLEAN DEFAULT FALSE,
  tell_in_person BOOLEAN DEFAULT FALSE,
  go_workplace BOOLEAN DEFAULT FALSE,
  go_school BOOLEAN DEFAULT FALSE,
  go_neighborhood BOOLEAN DEFAULT FALSE,
  heard TEXT[] DEFAULT '{}',
  seen TEXT[] DEFAULT '{}',
  experienced TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create souls table for tracking souls won
CREATE TABLE IF NOT EXISTS souls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  witness_profile_id UUID NOT NULL REFERENCES witness_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  notes TEXT,
  handed_to TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create witness_cards table for tracking generated witness cards
CREATE TABLE IF NOT EXISTS witness_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  witness_profile_id UUID NOT NULL REFERENCES witness_profiles(id) ON DELETE CASCADE,
  card_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_points table for tracking points and actions
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  witness_profile_id UUID NOT NULL UNIQUE REFERENCES witness_profiles(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  testimonies_count INTEGER DEFAULT 0,
  testimonies_seen_count INTEGER DEFAULT 0,
  testimonies_heard_count INTEGER DEFAULT 0,
  testimonies_experienced_count INTEGER DEFAULT 0,
  souls_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create point_transactions table for tracking individual point awards
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  witness_profile_id UUID NOT NULL REFERENCES witness_profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  points INTEGER NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_testimonies_witness_profile_id ON testimonies(witness_profile_id);
CREATE INDEX IF NOT EXISTS idx_testimonies_created_at ON testimonies(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_souls_witness_profile_id ON souls(witness_profile_id);
CREATE INDEX IF NOT EXISTS idx_souls_created_at ON souls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_souls_date ON souls(date DESC);

CREATE INDEX IF NOT EXISTS idx_witness_cards_witness_profile_id ON witness_cards(witness_profile_id);
CREATE INDEX IF NOT EXISTS idx_witness_cards_created_at ON witness_cards(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_points_witness_profile_id ON user_points(witness_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total_points ON user_points(total_points DESC);

CREATE INDEX IF NOT EXISTS idx_point_transactions_witness_profile_id ON point_transactions(witness_profile_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_transactions_action_type ON point_transactions(action_type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_witness_profiles_updated_at ON witness_profiles;
CREATE TRIGGER update_witness_profiles_updated_at BEFORE UPDATE ON witness_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonies_updated_at ON testimonies;
CREATE TRIGGER update_testimonies_updated_at BEFORE UPDATE ON testimonies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_souls_updated_at ON souls;
CREATE TRIGGER update_souls_updated_at BEFORE UPDATE ON souls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_witness_cards_updated_at ON witness_cards;
CREATE TRIGGER update_witness_cards_updated_at BEFORE UPDATE ON witness_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_points_updated_at ON user_points;
CREATE TRIGGER update_user_points_updated_at BEFORE UPDATE ON user_points FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE witness_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonies ENABLE ROW LEVEL SECURITY;
ALTER TABLE souls ENABLE ROW LEVEL SECURITY;
ALTER TABLE witness_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on witness_profiles" ON witness_profiles;
DROP POLICY IF EXISTS "Allow all operations on testimonies" ON testimonies;
DROP POLICY IF EXISTS "Allow all operations on souls" ON souls;
DROP POLICY IF EXISTS "Allow all operations on witness_cards" ON witness_cards;
DROP POLICY IF EXISTS "Allow all operations on user_points" ON user_points;
DROP POLICY IF EXISTS "Allow all operations on point_transactions" ON point_transactions;

-- Create policies to allow all operations (customize these for production)
CREATE POLICY "Allow all operations on witness_profiles" ON witness_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on testimonies" ON testimonies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on souls" ON souls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on witness_cards" ON witness_cards FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on user_points" ON user_points FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on point_transactions" ON point_transactions FOR ALL USING (true) WITH CHECK (true);
