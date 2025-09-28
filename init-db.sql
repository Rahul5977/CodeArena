-- Initialize the database with necessary extensions and basic setup
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create initial admin user (this will be handled by the application)
-- The first user to register will automatically become SUPERADMIN
