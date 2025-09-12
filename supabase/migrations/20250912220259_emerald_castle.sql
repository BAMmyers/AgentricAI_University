/*
  # Fix Database Schema Issues

  1. Schema Changes
    - Change `agentricai_knowledge_base.id` from UUID to TEXT to support 'category:key' format
    - Add proper indexes for the new TEXT id column
  
  2. Data Integrity
    - Preserve existing data during column type change
    - Maintain all existing constraints and policies
*/

-- Fix agentricai_knowledge_base id column type
ALTER TABLE agentricai_knowledge_base 
DROP CONSTRAINT IF EXISTS agentricai_knowledge_base_pkey;

ALTER TABLE agentricai_knowledge_base 
ALTER COLUMN id TYPE TEXT;

ALTER TABLE agentricai_knowledge_base 
ADD CONSTRAINT agentricai_knowledge_base_pkey PRIMARY KEY (id);

-- Recreate index for the new TEXT id column
DROP INDEX IF EXISTS agentricai_knowledge_base_pkey;
CREATE UNIQUE INDEX agentricai_knowledge_base_pkey ON agentricai_knowledge_base USING btree (id);