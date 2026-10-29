// Explicit stdin/stdout contract for each catalog problem, keyed by slug.
// Appended to the problem description (rendered as markdown) so solvers know
// exactly which line holds which value. Shared by resetProblems.js,
// addNextGreaterElement.js and applyIoFormats.js so the text never drifts.
export const IO_FORMATS = {
  "longest-substring-without-repeating-characters": {
    input: ["A single line containing the string **s**. The line may be empty, and spaces are part of the string."],
    output: ["A single integer: the length of the longest substring without repeating characters."],
    sample: "abcabcbb",
  },
  "two-sum": {
    input: [
      "**Line 1:** an integer **n**, the number of elements in the array.",
      "**Line 2:** **n** space-separated integers, the array **nums**.",
      "**Line 3:** an integer **target**.",
    ],
    output: ["Two space-separated 0-based indices **i j** (with **i < j**) such that `nums[i] + nums[j] == target`."],
    sample: "4\n2 7 11 15\n9",
  },
  "three-sum": {
    input: [
      "**Line 1:** an integer **n**, the number of elements in the array.",
      "**Line 2:** **n** space-separated integers, the array **nums**.",
    ],
    output: [
      "Each unique triplet on its own line as three space-separated integers in ascending order; lines sorted lexicographically.",
      "If no triplet exists, print `None`.",
    ],
    sample: "6\n-1 0 1 2 -1 -4",
  },
  "kth-largest-element": {
    input: [
      "**Line 1:** an integer **n**, the number of elements in the array.",
      "**Line 2:** **n** space-separated integers, the array **nums**.",
      "**Line 3:** an integer **k**.",
    ],
    output: ["A single integer: the k-th largest element."],
    sample: "6\n3 2 1 5 6 4\n2",
  },
  "fibonacci-number": {
    input: ["A single line containing the integer **n**."],
    output: ["A single integer: F(n)."],
    sample: "10",
  },
  "next-greater-element": {
    input: [
      "**Line 1:** an integer **n**, the number of elements in the array.",
      "**Line 2:** **n** space-separated integers, the array **nums**.",
    ],
    output: ["**n** space-separated integers: the next greater element for each position (or `-1`)."],
    sample: "4\n4 5 2 25",
  },
};

const MARKER = "\n\n### Input Format\n";

// Description with the Input/Output Format sections (re)applied. Idempotent:
// anything from a previous "### Input Format" heading onward is replaced.
export const withIoFormat = (slug, description) => {
  const f = IO_FORMATS[slug];
  const base = description.split(MARKER)[0];
  if (!f) return base;
  const list = (lines) => lines.map((l) => `- ${l}`).join("\n");
  return (
    `${base}${MARKER}${list(f.input)}\n\n### Output Format\n${list(f.output)}\n\n` +
    `For example, the input for Example 1 is:\n\n\`\`\`\n${f.sample}\n\`\`\``
  );
};
