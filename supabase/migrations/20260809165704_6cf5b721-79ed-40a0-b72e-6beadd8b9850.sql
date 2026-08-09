REVOKE EXECUTE ON FUNCTION public.recalc_recipe_cost(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.recalc_recipe_tree(uuid, integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.recipe_component_after() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.propagate_ingredient_price() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.recipe_after_yield_change() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.recipe_audit() FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.apply_quote_to_ingredient() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.recalc_recipe_cost(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.recalc_recipe_tree(uuid, integer) TO authenticated, service_role;