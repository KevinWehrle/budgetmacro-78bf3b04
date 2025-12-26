-- Drop existing tables to start fresh (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.api_rate_limits CASCADE;
DROP TABLE IF EXISTS public.ai_recommendations CASCADE;
DROP TABLE IF EXISTS public.food_logs CASCADE;
DROP TABLE IF EXISTS public.pantry_items CASCADE;
DROP TABLE IF EXISTS public.day_history CASCADE;
DROP TABLE IF EXISTS public.user_goals CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;

-- Create stores table
CREATE TABLE public.stores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  location_tag TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pantry_items table with both servings and weight-based tracking
CREATE TABLE public.pantry_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  -- Weight-based tracking (per 100g)
  total_weight NUMERIC,
  protein_per_100g NUMERIC,
  calories_per_100g NUMERIC,
  current_weight NUMERIC,
  -- Servings-based tracking (existing approach)
  total_servings NUMERIC DEFAULT 1,
  current_servings NUMERIC DEFAULT 1,
  calories_per_serving INTEGER DEFAULT 0,
  protein_per_serving INTEGER DEFAULT 0,
  serving_unit TEXT DEFAULT 'serving',
  -- Common fields
  is_out_of_stock BOOLEAN NOT NULL DEFAULT false,
  expires_at DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create price_history table for tracking price changes
CREATE TABLE public.price_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pantry_item_id UUID NOT NULL REFERENCES public.pantry_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  cost_at_time NUMERIC NOT NULL,
  date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create food_logs table with pantry item reference
CREATE TABLE public.food_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pantry_item_id UUID REFERENCES public.pantry_items(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  amount_consumed NUMERIC,
  cost NUMERIC NOT NULL DEFAULT 0,
  calories INTEGER NOT NULL DEFAULT 0,
  protein INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create waste_logs table for tracking food waste
CREATE TABLE public.waste_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pantry_item_id UUID REFERENCES public.pantry_items(id) ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  amount_wasted NUMERIC NOT NULL,
  cost_lost NUMERIC NOT NULL DEFAULT 0,
  waste_reason TEXT,
  is_expired BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create day_history table for daily summaries
CREATE TABLE public.day_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  calories INTEGER NOT NULL DEFAULT 0,
  protein INTEGER NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  waste_cost NUMERIC NOT NULL DEFAULT 0,
  goal_calories INTEGER NOT NULL,
  goal_protein INTEGER NOT NULL,
  goal_budget NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create user_goals table
CREATE TABLE public.user_goals (
  user_id UUID NOT NULL PRIMARY KEY,
  calories INTEGER NOT NULL DEFAULT 2000,
  protein INTEGER NOT NULL DEFAULT 150,
  budget NUMERIC NOT NULL DEFAULT 15.00,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_settings table
CREATE TABLE public.user_settings (
  user_id UUID NOT NULL PRIMARY KEY,
  dark_mode BOOLEAN NOT NULL DEFAULT true,
  notifications BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.day_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for stores
CREATE POLICY "Users can view own stores" ON public.stores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own stores" ON public.stores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stores" ON public.stores FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stores" ON public.stores FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for pantry_items
CREATE POLICY "Users can view own pantry items" ON public.pantry_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own pantry items" ON public.pantry_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pantry items" ON public.pantry_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pantry items" ON public.pantry_items FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for price_history
CREATE POLICY "Users can view own price history" ON public.price_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own price history" ON public.price_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own price history" ON public.price_history FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for food_logs
CREATE POLICY "Users can view own food logs" ON public.food_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own food logs" ON public.food_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own food logs" ON public.food_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own food logs" ON public.food_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for waste_logs
CREATE POLICY "Users can view own waste logs" ON public.waste_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own waste logs" ON public.waste_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own waste logs" ON public.waste_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own waste logs" ON public.waste_logs FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for day_history
CREATE POLICY "Users can view own history" ON public.day_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own history" ON public.day_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own history" ON public.day_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own history" ON public.day_history FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_goals
CREATE POLICY "Users can view own goals" ON public.user_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own goals" ON public.user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goals" ON public.user_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goals" ON public.user_goals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_settings
CREATE POLICY "Users can view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own settings" ON public.user_settings FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at triggers for relevant tables
CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON public.stores FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pantry_items_updated_at BEFORE UPDATE ON public.pantry_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON public.user_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();