-- Create food_logs table
CREATE TABLE public.food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein INTEGER NOT NULL,
  cost NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_goals table
CREATE TABLE public.user_goals (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  calories INTEGER NOT NULL DEFAULT 2000,
  protein INTEGER NOT NULL DEFAULT 150,
  budget NUMERIC(10,2) NOT NULL DEFAULT 15.00,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_settings table
CREATE TABLE public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications BOOLEAN NOT NULL DEFAULT false,
  dark_mode BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create day_history table
CREATE TABLE public.day_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  goal_calories INTEGER NOT NULL,
  goal_protein INTEGER NOT NULL,
  goal_budget NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for food_logs
CREATE POLICY "Users can view own food logs"
  ON public.food_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food logs"
  ON public.food_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own food logs"
  ON public.food_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own food logs"
  ON public.food_logs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_goals
CREATE POLICY "Users can view own goals"
  ON public.user_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON public.user_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.user_goals FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for day_history
CREATE POLICY "Users can view own history"
  ON public.day_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history"
  ON public.day_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history"
  ON public.day_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();