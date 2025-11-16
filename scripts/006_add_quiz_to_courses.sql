-- Add quiz questions support to courses and drafts tables

-- Add quiz_questions column to courses table
ALTER TABLE courses
ADD COLUMN IF NOT EXISTS quiz_questions JSONB DEFAULT '[]'::jsonb;

-- Add quiz_questions column to drafts table
ALTER TABLE drafts
ADD COLUMN IF NOT EXISTS quiz_questions JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the structure
COMMENT ON COLUMN courses.quiz_questions IS 'Array of quiz questions with format: [{question: string, options: string[], correct_answer: number, explanation: string}]';
COMMENT ON COLUMN drafts.quiz_questions IS 'Array of quiz questions with format: [{question: string, options: string[], correct_answer: number, explanation: string}]';
