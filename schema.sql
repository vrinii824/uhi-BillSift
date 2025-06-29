-- Create the bill_analyses table
CREATE TABLE bill_analyses (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Extracted Bill Information
  patient_name TEXT,
  bill_date TEXT,
  provider_name TEXT,
  total_amount REAL,
  account_number TEXT,
  insurance_name TEXT,

  -- Categorized Line Items
  procedures JSONB,
  tests JSONB,
  medications JSONB,

  -- AI Analysis Results
  errors_detected BOOLEAN,
  error_summary TEXT,
  detailed_report TEXT,
  appeal_letter TEXT
);

-- Enable Row Level Security
ALTER TABLE bill_analyses ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (or restrict as needed)
-- This policy allows anyone to insert data.
CREATE POLICY "Public insert" ON bill_analyses FOR INSERT WITH CHECK (true);

-- This policy allows anyone to read data. 
-- For a real application, you'd likely want to restrict this to authenticated users
-- and only allow them to see their own data, e.g., using (auth.uid() = user_id).
CREATE POLICY "Public select" ON bill_analyses FOR SELECT USING (true);
