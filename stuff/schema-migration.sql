-- Schema Migration for Prerequisites
-- 
-- This migration changes the prerequisites column from ARRAY to JSONB
-- to support structured prerequisite data with AND/OR logic.
--
-- Run this ONLY if you want to use the structured prerequisite format.
-- Back up your data first!

-- Step 1: Add new JSONB column for prerequisites
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS prerequisites_new JSONB;

-- Step 2: Migrate existing data (if any)
-- This converts array prerequisites like ['CIS 1057', 'MATH 1041'] to:
-- { "type": "AND", "children": [{"type": "course", "course": "CIS 1057"}, ...] }
UPDATE public.courses
SET prerequisites_new = CASE
  WHEN prerequisites IS NULL OR array_length(prerequisites, 1) IS NULL THEN NULL
  WHEN array_length(prerequisites, 1) = 1 THEN 
    jsonb_build_object('type', 'course', 'course', prerequisites[1])
  ELSE 
    jsonb_build_object(
      'type', 'AND',
      'children', (
        SELECT jsonb_agg(jsonb_build_object('type', 'course', 'course', prereq))
        FROM unnest(prerequisites) AS prereq
      )
    )
END
WHERE prerequisites IS NOT NULL;

-- Step 3: Drop old column and rename new one
-- WARNING: This is destructive! Make sure the migration worked first.
-- ALTER TABLE public.courses DROP COLUMN prerequisites;
-- ALTER TABLE public.courses RENAME COLUMN prerequisites_new TO prerequisites;

-- Alternative: Keep both columns during transition
-- The backend will write to the new format, frontend can read either

-- Step 4: Add index for JSONB queries (optional, improves performance)
-- CREATE INDEX IF NOT EXISTS idx_courses_prerequisites ON public.courses USING GIN (prerequisites_new);

-- Example queries with new format:

-- Find courses that require CIS 1057
-- SELECT * FROM courses 
-- WHERE prerequisites_new @> '{"type": "course", "course": "CIS 1057"}'
--    OR prerequisites_new @> '{"children": [{"type": "course", "course": "CIS 1057"}]}';

-- Find courses with any prerequisites
-- SELECT * FROM courses WHERE prerequisites_new IS NOT NULL;

-- Find courses without prerequisites
-- SELECT * FROM courses WHERE prerequisites_new IS NULL;

