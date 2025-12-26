-- Create pantry_items table for Digital Pantry feature
CREATE TABLE public.pantry_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  total_cost NUMERIC NOT NULL DEFAULT 0,
  total_servings NUMERIC NOT NULL DEFAULT 1,
  current_servings NUMERIC NOT NULL DEFAULT 1,
  protein_per_serving INTEGER NOT NULL DEFAULT 0,
  calories_per_serving INTEGER NOT NULL DEFAULT 0,
  serving_unit TEXT NOT NULL DEFAULT 'serving',
  is_out_of_stock BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pantry_items ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view own pantry items" 
ON public.pantry_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own pantry items" 
ON public.pantry_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pantry items" 
ON public.pantry_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pantry items" 
ON public.pantry_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pantry_items_updated_at
BEFORE UPDATE ON public.pantry_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();