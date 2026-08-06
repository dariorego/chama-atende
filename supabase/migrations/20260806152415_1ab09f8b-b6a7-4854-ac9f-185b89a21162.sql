-- Vincula os donos de cada estabelecimento como 'owner' caso o vínculo não exista
INSERT INTO public.tenant_user_roles (user_id, restaurant_id, role)
SELECT r.owner_id, r.id, 'owner'
FROM public.restaurants r
WHERE r.owner_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Garante acesso admin de robertaaraujo40@gmail.com ao Café com Dengo
INSERT INTO public.tenant_user_roles (user_id, restaurant_id, role)
SELECT p.id, r.id, 'admin'
FROM public.profiles p
CROSS JOIN public.restaurants r
WHERE p.email = 'robertaaraujo40@gmail.com' AND r.slug = 'cafecomdengo'
ON CONFLICT DO NOTHING;