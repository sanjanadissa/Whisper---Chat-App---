-- Check if the profile_image_url column exists in the users table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'profile_image_url';

-- If the column doesn't exist, add it
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Update existing users to have a default profile image if needed
UPDATE users SET profile_image_url = NULL WHERE profile_image_url IS NULL;

-- Show the current table structure
\d users;

