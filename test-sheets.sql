-- Insert test DSA sheets with the existing Two Sum problem

-- Sheet 1: Beginner Arrays (FREE)
INSERT INTO "Sheet" (
  id, title, description, topic, difficulty, "problemIds", price, type, "estimatedHours", prerequisites, "isActive", "createdAt", "updatedAt"
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Array Fundamentals - Beginner',
  'Master the basics of arrays with carefully curated problems. Perfect for beginners starting their DSA journey. Covers basic array operations, two pointers, and hash maps.',
  'Arrays',
  'EASY',
  ARRAY['1'],
  0,
  'FREE',
  10,
  ARRAY['Basic Programming', 'Loops'],
  true,
  NOW(),
  NOW()
);

-- Sheet 2: Hash Table Mastery (PREMIUM)
INSERT INTO "Sheet" (
  id, title, description, topic, difficulty, "problemIds", price, type, "estimatedHours", prerequisites, "isActive", "createdAt", "updatedAt"
) VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  'Hash Table Mastery',
  'Deep dive into hash tables and hash maps. Learn patterns for using hash tables to optimize time complexity. Includes problems on frequency counting, anagrams, and more.',
  'Hash Table',
  'MEDIUM',
  ARRAY['1'],
  299,
  'PREMIUM',
  15,
  ARRAY['Arrays', 'Basic Data Structures'],
  true,
  NOW(),
  NOW()
);

-- Sheet 3: Advanced Arrays (PREMIUM)
INSERT INTO "Sheet" (
  id, title, description, topic, difficulty, "problemIds", price, type, "estimatedHours", prerequisites, "isActive", "createdAt", "updatedAt"
) VALUES (
  '550e8400-e29b-41d4-a716-446655440003',
  'Advanced Array Techniques',
  'Take your array skills to the next level with advanced patterns like sliding window, kadane''s algorithm, and array manipulation tricks.',
  'Arrays',
  'HARD',
  ARRAY['1'],
  499,
  'PREMIUM',
  20,
  ARRAY['Array Fundamentals', 'Two Pointers'],
  true,
  NOW(),
  NOW()
);

-- Sheet 4: Top 50 Interview Questions (FREE)
INSERT INTO "Sheet" (
  id, title, description, topic, difficulty, "problemIds", price, type, "estimatedHours", prerequisites, "isActive", "createdAt", "updatedAt"
) VALUES (
  '550e8400-e29b-41d4-a716-446655440004',
  'Top 50 Interview Questions',
  'The most frequently asked coding interview questions from top tech companies. A must-solve collection for interview preparation.',
  'Mixed',
  'MEDIUM',
  ARRAY['1'],
  0,
  'FREE',
  25,
  ARRAY['Basic DSA Knowledge'],
  true,
  NOW(),
  NOW()
);

-- Sheet 5: Dynamic Programming Starter (PREMIUM)
INSERT INTO "Sheet" (
  id, title, description, topic, difficulty, "problemIds", price, type, "estimatedHours", prerequisites, "isActive", "createdAt", "updatedAt"
) VALUES (
  '550e8400-e29b-41d4-a716-446655440005',
  'Dynamic Programming Starter Pack',
  'Introduction to dynamic programming with beginner-friendly problems. Learn memoization, tabulation, and common DP patterns.',
  'Dynamic Programming',
  'MEDIUM',
  ARRAY['1'],
  399,
  'PREMIUM',
  30,
  ARRAY['Recursion', 'Arrays'],
  true,
  NOW(),
  NOW()
);

-- Sheet 6: Graph Theory Basics (PREMIUM)
INSERT INTO "Sheet" (
  id, title, description, topic, difficulty, "problemIds", price, type, "estimatedHours", prerequisites, "isActive", "createdAt", "updatedAt"
) VALUES (
  '550e8400-e29b-41d4-a716-446655440006',
  'Graph Theory Fundamentals',
  'Learn graph traversal, BFS, DFS, and solve fundamental graph problems. Essential for mastering graph algorithms.',
  'Graph',
  'HARD',
  ARRAY['1'],
  599,
  'PREMIUM',
  35,
  ARRAY['Trees', 'Queue', 'Stack'],
  true,
  NOW(),
  NOW()
);
