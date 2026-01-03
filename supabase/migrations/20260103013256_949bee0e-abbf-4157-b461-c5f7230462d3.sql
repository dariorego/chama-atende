-- Update user role to admin so they can access the admin panel
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = 'fd8499ee-aa50-4af1-a841-7125b6671eb5';