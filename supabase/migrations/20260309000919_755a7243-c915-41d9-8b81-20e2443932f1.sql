ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_tipo_check;
UPDATE profiles SET tipo = 'admin' WHERE email = 'etcsuporte889@gmail.com';