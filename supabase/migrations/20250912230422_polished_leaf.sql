/*
  # Add INSERT policy for agents table

  1. Security
    - Add RLS policy to allow INSERT operations on agents table
    - Allow authenticated users to insert agent records
    - This resolves the "new row violates row-level security policy" error

  2. Changes
    - Create policy "Allow authenticated users to insert agents"
    - Enables system agent registration functionality
*/

CREATE POLICY "Allow authenticated users to insert agents"
  ON agents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also allow anonymous users for system operations
CREATE POLICY "Allow anonymous agent registration"
  ON agents
  FOR INSERT
  TO anon
  WITH CHECK (true);