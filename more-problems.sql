-- Insert more sample problems for testing

-- Problem 2: Add Two Numbers
INSERT INTO "Problem" (
  id, title, description, difficulty, tags, "userId", examples, constraints, testcases, "codeSnippets", "referenceSolutions", "createdAt", "updatedAt"
) VALUES (
  '2',
  'Add Two Numbers',
  'You are given two non-empty linked lists representing two non-negative integers. The digits are stored in reverse order, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.',
  'MEDIUM',
  ARRAY['Linked List', 'Math', 'Recursion'],
  '24c6b58c-66ff-4eca-bc6b-9b6804ec5b18',
  '[{"input":"l1 = [2,4,3], l2 = [5,6,4]","output":"[7,0,8]","explanation":"342 + 465 = 807."}]'::jsonb,
  '["The number of nodes in each linked list is in the range [1, 100].", "0 <= Node.val <= 9"]',
  '[{"input":"2 4 3\n5 6 4","output":"7 0 8"}]'::jsonb,
  '{"Python":"class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef addTwoNumbers(l1, l2):\n    # Write your code here\n    pass"}'::jsonb,
  '{}'::jsonb,
  NOW(), NOW()
);

-- Problem 3: Longest Substring Without Repeating Characters
INSERT INTO "Problem" (
  id, title, description, difficulty, tags, "userId", examples, constraints, testcases, "codeSnippets", "referenceSolutions", "createdAt", "updatedAt"
) VALUES (
  '3',
  'Longest Substring Without Repeating Characters',
  'Given a string s, find the length of the longest substring without repeating characters.',
  'MEDIUM',
  ARRAY['Hash Table', 'String', 'Sliding Window'],
  '24c6b58c-66ff-4eca-bc6b-9b6804ec5b18',
  '[{"input":"s = \"abcabcbb\"","output":"3","explanation":"The answer is \"abc\", with the length of 3."},{"input":"s = \"bbbbb\"","output":"1","explanation":"The answer is \"b\", with the length of 1."}]'::jsonb,
  '["0 <= s.length <= 5 * 10^4", "s consists of English letters, digits, symbols and spaces."]',
  '[{"input":"abcabcbb","output":"3"},{"input":"bbbbb","output":"1"}]'::jsonb,
  '{"Python":"def lengthOfLongestSubstring(s):\n    # Write your code here\n    pass"}'::jsonb,
  '{}'::jsonb,
  NOW(), NOW()
);

-- Problem 4: Median of Two Sorted Arrays
INSERT INTO "Problem" (
  id, title, description, difficulty, tags, "userId", examples, constraints, testcases, "codeSnippets", "referenceSolutions", "createdAt", "updatedAt"
) VALUES (
  '4',
  'Median of Two Sorted Arrays',
  'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).',
  'HARD',
  ARRAY['Array', 'Binary Search', 'Divide and Conquer'],
  '24c6b58c-66ff-4eca-bc6b-9b6804ec5b18',
  '[{"input":"nums1 = [1,3], nums2 = [2]","output":"2.00000","explanation":"merged array = [1,2,3] and median is 2."}]'::jsonb,
  '["nums1.length == m", "nums2.length == n", "0 <= m <= 1000", "0 <= n <= 1000"]',
  '[{"input":"1 3\n2","output":"2.0"}]'::jsonb,
  '{"Python":"def findMedianSortedArrays(nums1, nums2):\n    # Write your code here\n    pass"}'::jsonb,
  '{}'::jsonb,
  NOW(), NOW()
);

-- Problem 5: Valid Parentheses
INSERT INTO "Problem" (
  id, title, description, difficulty, tags, "userId", examples, constraints, testcases, "codeSnippets", "referenceSolutions", "createdAt", "updatedAt"
) VALUES (
  '5',
  'Valid Parentheses',
  'Given a string s containing just the characters ''('', '')'', ''{'', ''}'', ''['' and '']'', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets. Open brackets must be closed in the correct order.',
  'EASY',
  ARRAY['String', 'Stack'],
  '24c6b58c-66ff-4eca-bc6b-9b6804ec5b18',
  '[{"input":"s = \"()\"","output":"true"},{"input":"s = \"()[]{}\"","output":"true"},{"input":"s = \"(]\"","output":"false"}]'::jsonb,
  '["1 <= s.length <= 10^4", "s consists of parentheses only ''()[]{}''"]',
  '[{"input":"()","output":"true"},{"input":"()[]{}","output":"true"}]'::jsonb,
  '{"Python":"def isValid(s):\n    # Write your code here\n    pass"}'::jsonb,
  '{}'::jsonb,
  NOW(), NOW()
);
