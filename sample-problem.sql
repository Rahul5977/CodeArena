-- Insert a sample problem for testing
INSERT INTO "Problem" (
  id,
  title,
  description,
  difficulty,
  tags,
  "userId",
  examples,
  constraints,
  testcases,
  "codeSnippets",
  "referenceSolutions",
  "createdAt",
  "updatedAt"
) VALUES (
  '1',
  'Two Sum',
  'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.',
  'EASY',
  ARRAY['Array', 'Hash Table'],
  '24c6b58c-66ff-4eca-bc6b-9b6804ec5b18',
  '[
    {
      "input": "nums = [2,7,11,15], target = 9",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
    },
    {
      "input": "nums = [3,2,4], target = 6",
      "output": "[1,2]",
      "explanation": "Because nums[1] + nums[2] == 6, we return [1, 2]."
    },
    {
      "input": "nums = [3,3], target = 6",
      "output": "[0,1]",
      "explanation": "Because nums[0] + nums[1] == 6, we return [0, 1]."
    }
  ]'::jsonb,
  '[
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists."
  ]'::jsonb,
  '[
    {
      "input": "2 7 11 15\n9",
      "output": "0 1"
    },
    {
      "input": "3 2 4\n6",
      "output": "1 2"
    },
    {
      "input": "3 3\n6",
      "output": "0 1"
    }
  ]'::jsonb,
  '{
    "Python": "def twoSum(nums, target):\n    # Write your code here\n    pass\n\nif __name__ == \"__main__\":\n    nums = list(map(int, input().split()))\n    target = int(input())\n    result = twoSum(nums, target)\n    print(\" \".join(map(str, result)))",
    "JavaScript": "function twoSum(nums, target) {\n    // Write your code here\n}\n\nconst readline = require(\"readline\");\nconst rl = readline.createInterface({\n    input: process.stdin\n});\n\nlet lines = [];\nrl.on(\"line\", (line) => {\n    lines.push(line);\n    if (lines.length === 2) {\n        const nums = lines[0].split(\" \").map(Number);\n        const target = parseInt(lines[1]);\n        const result = twoSum(nums, target);\n        console.log(result.join(\" \"));\n        rl.close();\n    }\n});",
    "C++": "#include <iostream>\n#include <vector>\n#include <sstream>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Write your code here\n    return {};\n}\n\nint main() {\n    string line;\n    getline(cin, line);\n    istringstream iss(line);\n    vector<int> nums;\n    int num;\n    while (iss >> num) nums.push_back(num);\n    \n    int target;\n    cin >> target;\n    \n    vector<int> result = twoSum(nums, target);\n    cout << result[0] << \" \" << result[1] << endl;\n    return 0;\n}",
    "Java": "import java.util.*;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n    \n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        String[] numsStr = sc.nextLine().split(\" \");\n        int[] nums = new int[numsStr.length];\n        for (int i = 0; i < numsStr.length; i++) {\n            nums[i] = Integer.parseInt(numsStr[i]);\n        }\n        int target = sc.nextInt();\n        int[] result = twoSum(nums, target);\n        System.out.println(result[0] + \" \" + result[1]);\n    }\n}"
  }'::jsonb,
  '{}'::jsonb,
  NOW(),
  NOW()
);
