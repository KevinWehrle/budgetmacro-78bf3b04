-- Add missing DELETE policies for user_goals, user_settings, and day_history

CREATE POLICY "Users can delete own goals"
  ON public.user_goals FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings"
  ON public.user_settings FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own history"
  ON public.day_history FOR DELETE
  USING (auth.uid() = user_id);

-- Create a rate limiting table for tracking API usage
CREATE TABLE public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS on rate limits table
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow users to see/manage their own rate limit records
CREATE POLICY "Users can view own rate limits"
  ON public.api_rate_limits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rate limits"
  ON public.api_rate_limits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rate limits"
  ON public.api_rate_limits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rate limits"
  ON public.api_rate_limits FOR DELETE
  USING (auth.uid() = user_id);