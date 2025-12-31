-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'staff');

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  restaurant_id UUID REFERENCES public.restaurants(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's restaurant_id safely
CREATE OR REPLACE FUNCTION public.get_user_restaurant_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT restaurant_id
  FROM public.profiles
  WHERE id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admins can view profiles from same restaurant"
ON public.profiles FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  AND restaurant_id = public.get_user_restaurant_id(auth.uid())
);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can view roles from same restaurant"
ON public.user_roles FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  AND EXISTS (
    SELECT 1 FROM public.profiles p1, public.profiles p2
    WHERE p1.id = user_id
    AND p2.id = auth.uid()
    AND p1.restaurant_id = p2.restaurant_id
  )
);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, restaurant_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    (NEW.raw_user_meta_data ->> 'restaurant_id')::UUID
  );
  
  -- Auto-assign 'staff' role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'staff');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();