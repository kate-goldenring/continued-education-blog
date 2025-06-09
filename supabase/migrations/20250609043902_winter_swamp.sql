/*
  # Update Default Photographer and Copyright

  1. Changes
    - Update default photographer from "Visual Stories Blog" to "Kate Goldenring"
    - Update default copyright from "Visual Stories Blog" to "Continued Education Blog"
    - Update existing records to use new defaults where they match old defaults

  2. Security
    - No changes to existing RLS policies
    - Maintains all existing permissions
*/

-- Update the default values in the table definition
ALTER TABLE blog_images 
ALTER COLUMN photographer SET DEFAULT 'Kate Goldenring';

ALTER TABLE blog_images 
ALTER COLUMN copyright SET DEFAULT '© 2024 Continued Education Blog. All rights reserved.';

-- Update existing records that have the old default values
UPDATE blog_images 
SET photographer = 'Kate Goldenring' 
WHERE photographer = 'Visual Stories Blog';

UPDATE blog_images 
SET copyright = '© 2024 Continued Education Blog. All rights reserved.' 
WHERE copyright = '© 2024 Visual Stories Blog. All rights reserved.';