UPDATE public.restaurants
SET theme_colors = jsonb_set(
  jsonb_set(COALESCE(theme_colors, '{}'::jsonb), '{primary}', '"43 55% 54%"'),
  '{accent}', '"43 55% 54%"'
)
WHERE theme_colors->>'primary' = '142 85% 49%'
   OR theme_colors->>'primary' IS NULL
   OR theme_colors = '{}'::jsonb
   OR theme_colors IS NULL;