# Problem Solving Interface - Visual Guide

This document describes the visual layout and design of the Problem Solving Interface.

---

## 📐 Desktop Layout (>1024px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Navbar: LeetLab Logo | Problems | Playlists | Contests | Profile      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────┬───────────────────────────────────┐   │
│  │                             │                                   │   │
│  │  PROBLEM DESCRIPTION        │   CODE EDITOR                     │   │
│  │  (Left Panel)               │   (Right Panel)                   │   │
│  │                             │                                   │   │
│  │  ┌───────────────────────┐  │  ┌─────────────────────────────┐ │   │
│  │  │ Title: Two Sum        │  │  │ Language: [Python ▼]        │ │   │
│  │  │ Difficulty: [Easy]    │  │  └─────────────────────────────┘ │   │
│  │  │ Tags: [Array] [Hash]  │  │                                   │   │
│  │  └───────────────────────┘  │  ┌─────────────────────────────┐ │   │
│  │                             │  │ def solution():             │ │   │
│  │  Description:               │  │     # Write your code here  │ │   │
│  │  Given an array...          │  │     pass                    │ │   │
│  │                             │  │                             │ │   │
│  │  Example 1:                 │  │ if __name__ == "__main__":  │ │   │
│  │  Input: nums = [2,7,11,15]  │  │     result = solution()     │ │   │
│  │  Output: [0,1]              │  │     print(result)           │ │   │
│  │  Explanation: ...           │  │                             │ │   │
│  │                             │  └─────────────────────────────┘ │   │
│  │  Constraints:               │                                   │   │
│  │  • 2 <= nums.length <= 104  │  ┌─────────────────────────────┐ │   │
│  │  • -109 <= nums[i] <= 109   │  │ Custom Input:               │ │   │
│  │                             │  │ ┌─────────────────────────┐ │ │   │
│  │                             │  │ │ Enter input here...     │ │ │   │
│  │                             │  │ └─────────────────────────┘ │ │   │
│  │                             │  │                             │ │   │
│  │                             │  │ Output:                     │ │   │
│  │                             │  │ ┌─────────────────────────┐ │ │   │
│  │  (Scrollable)               │  │ │ Runtime: 42ms           │ │ │   │
│  │                             │  │ │ Memory: 38.5 MB         │ │ │   │
│  │                             │  │ └─────────────────────────┘ │ │   │
│  │                             │  │                             │ │   │
│  │                             │  │ [▶ Run Code] [✓ Submit]     │ │   │
│  │                             │  └─────────────────────────────┘ │   │
│  │                             │                                   │   │
│  └─────────────────────────────┴───────────────────────────────────┘   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Features:

- **Resizable Split**: Drag the divider between panels to adjust sizes
- **50/50 Default**: Panels start at equal width
- **Min Width**: Each panel maintains a minimum width of 300px
- **Scrollable**: Both panels have independent scrolling

---

## 📱 Mobile Layout (<768px)

```
┌──────────────────────────────────┐
│  Navbar (Hamburger Menu)         │
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │  PROBLEM DESCRIPTION       │  │
│  │  (Full Width)              │  │
│  │                            │  │
│  │  ┌──────────────────────┐  │  │
│  │  │ Title: Two Sum       │  │  │
│  │  │ Difficulty: [Easy]   │  │  │
│  │  │ Tags: [Array] [Hash] │  │  │
│  │  └──────────────────────┘  │  │
│  │                            │  │
│  │  Description:              │  │
│  │  Given an array...         │  │
│  │                            │  │
│  │  Example 1:                │  │
│  │  Input: nums = [2,7,...]   │  │
│  │  Output: [0,1]             │  │
│  │                            │  │
│  │  Constraints:              │  │
│  │  • 2 <= nums.length...     │  │
│  │                            │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  CODE EDITOR               │  │
│  │  (Full Width)              │  │
│  │                            │  │
│  │  Language: [Python ▼]      │  │
│  │                            │  │
│  │  ┌──────────────────────┐  │  │
│  │  │ def solution():      │  │  │
│  │  │     pass             │  │  │
│  │  │                      │  │  │
│  │  │ if __name__ ==       │  │  │
│  │  │     ...              │  │  │
│  │  └──────────────────────┘  │  │
│  │                            │  │
│  │  Custom Input:             │  │
│  │  ┌──────────────────────┐  │  │
│  │  │ Enter input...       │  │  │
│  │  └──────────────────────┘  │  │
│  │                            │  │
│  │  Output:                   │  │
│  │  ┌──────────────────────┐  │  │
│  │  │ Runtime: 42ms        │  │  │
│  │  └──────────────────────┘  │  │
│  │                            │  │
│  │  [▶ Run] [✓ Submit]        │  │
│  └────────────────────────────┘  │
│                                  │
│  (Scrollable)                    │
└──────────────────────────────────┘
```

### Features:

- **Stacked Layout**: Panels are vertically stacked
- **Full Width**: Each section uses full viewport width
- **Touch-Friendly**: Large buttons, easy to tap
- **Single Scroll**: Entire page scrolls together

---

## 🎨 Color Scheme

### Background Colors

- **Main Background**: Dark gradient (slate-900 → purple-900)
- **Panel Background**: Slate-800 with slight transparency
- **Code Editor**: VS Code Dark+ theme
- **Input/Output**: Slate-700

### Accent Colors

- **Primary**: Purple-600 (buttons, links)
- **Success**: Green-500 (Easy difficulty)
- **Warning**: Yellow-500 (Medium difficulty)
- **Danger**: Red-500 (Hard difficulty)
- **Info**: Blue-500 (tags, info text)

### Text Colors

- **Primary Text**: White/Slate-100
- **Secondary Text**: Slate-300
- **Muted Text**: Slate-400
- **Code**: Various colors (syntax highlighting)

---

## 🏷️ Component Breakdown

### 1. Problem Description (Left Panel)

```
┌────────────────────────────────┐
│ Problem Header                 │
│ ┌────────────────────────────┐ │
│ │ Two Sum                    │ │ ← Title (text-2xl, font-bold)
│ │ [Easy]                     │ │ ← Difficulty Badge
│ │ [Array] [Hash Table]       │ │ ← Tags
│ │ Accepted: 4.2M | 47.5%     │ │ ← Stats
│ └────────────────────────────┘ │
│                                │
│ Description Section            │
│ ┌────────────────────────────┐ │
│ │ Given an array of integers │ │
│ │ nums and an integer target,│ │
│ │ return indices of the two  │ │
│ │ numbers such that...       │ │
│ └────────────────────────────┘ │
│                                │
│ Examples Section               │
│ ┌────────────────────────────┐ │
│ │ Example 1:                 │ │
│ │ Input: nums = [2,7,11,15], │ │
│ │        target = 9          │ │
│ │ Output: [0,1]              │ │
│ │ Explanation: Because       │ │
│ │ nums[0] + nums[1] == 9...  │ │
│ └────────────────────────────┘ │
│                                │
│ Constraints Section            │
│ ┌────────────────────────────┐ │
│ │ • 2 <= nums.length <= 104  │ │
│ │ • -109 <= nums[i] <= 109   │ │
│ │ • Only one valid answer    │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

### 2. Code Editor (Right Panel - Top)

```
┌────────────────────────────────┐
│ Language Selector              │
│ ┌────────────────────────────┐ │
│ │ Python 3              ▼    │ │ ← Dropdown
│ └────────────────────────────┘ │
│                                │
│ Monaco Editor                  │
│ ┌────────────────────────────┐ │
│ │ 1  def solution():         │ │
│ │ 2      # Write your code   │ │
│ │ 3      pass                │ │
│ │ 4                          │ │
│ │ 5  if __name__ == ...      │ │
│ │ 6      result = solution() │ │
│ │ 7      print(result)       │ │
│ │ 8                          │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

### 3. Input/Output Section (Right Panel - Bottom)

```
┌────────────────────────────────┐
│ Custom Input                   │
│ ┌────────────────────────────┐ │
│ │ Enter your custom input    │ │
│ │ here...                    │ │
│ │                            │ │
│ └────────────────────────────┘ │
│                                │
│ Output                         │
│ ┌────────────────────────────┐ │
│ │ Executed Successfully!     │ │
│ │                            │ │
│ │ Runtime: 42ms              │ │
│ │ Memory: 38.5 MB            │ │
│ │                            │ │
│ │ Output:                    │ │
│ │ [0, 1]                     │ │
│ └────────────────────────────┘ │
│                                │
│ ┌──────────┐  ┌──────────────┐ │
│ │ ▶ Run    │  │ ✓ Submit     │ │
│ └──────────┘  └──────────────┘ │
└────────────────────────────────┘
```

---

## 🎭 States & Interactions

### Loading State

```
┌────────────────────────────────┐
│         [Spinner Icon]         │
│      Loading problem...        │
└────────────────────────────────┘
```

### Error State

```
┌────────────────────────────────┐
│         [Error Icon]           │
│    Problem not found           │
│    [⟲ Try Again]               │
└────────────────────────────────┘
```

### Running Code State

```
┌────────────────────────────────┐
│ ┌──────────┐  ┌──────────────┐ │
│ │ [⟳] Running...│  [Disabled] │ │
│ └──────────┘  └──────────────┘ │
└────────────────────────────────┘
```

### Success Output

```
┌────────────────────────────────┐
│ ✓ Executed Successfully!       │
│                                │
│ Runtime: 42ms                  │
│ Memory: 38.5 MB                │
│                                │
│ Output:                        │
│ [0, 1]                         │
└────────────────────────────────┘
```

### Error Output

```
┌────────────────────────────────┐
│ ✗ Execution Failed             │
│                                │
│ Error:                         │
│ SyntaxError: invalid syntax    │
│ Line 3: unexpected indent      │
└────────────────────────────────┘
```

---

## 🖱️ Interactive Elements

### Buttons

**Primary Button (Run Code)**

- Normal: Purple-600 background, white text
- Hover: Purple-700 background, scale slightly
- Disabled: Gray background, cursor not-allowed
- Loading: Spinner icon, "Running..." text

**Secondary Button (Submit)**

- Normal: Green-600 background, white text
- Hover: Green-700 background, scale slightly
- Disabled: Gray background, cursor not-allowed

### Dropdown (Language Selector)

- Normal: Slate-700 background, white text
- Hover: Slate-600 background
- Open: Show list of languages
- Selected: Check mark next to language

### Text Areas

- Custom Input: Slate-700 background, white text, resizable
- Output: Slate-800 background, gray text, read-only

### Split Pane Divider

- Normal: Thin gray line (2px)
- Hover: Blue highlight (4px)
- Dragging: Cursor changes to col-resize

---

## 📏 Spacing & Typography

### Spacing

- **Padding**: 4-6 units (1rem = 4 units)
- **Margin**: 2-4 units between sections
- **Gap**: 3-4 units between elements

### Typography

- **Title**: 2xl (24px), bold
- **Headings**: xl (20px), semibold
- **Body Text**: base (16px), normal
- **Code**: sm (14px), monospace
- **Labels**: sm (14px), medium

### Font Families

- **Sans-serif**: Inter, system-ui (default)
- **Monospace**: 'Fira Code', 'Courier New', monospace (code)

---

## 🎬 Animations

### Transitions

- **Button Hover**: 200ms ease-in-out
- **Panel Resize**: Smooth drag with no delay
- **Loading Spinner**: 1s linear infinite
- **Fade In**: 300ms ease-in (page load)

### Hover Effects

- **Buttons**: Scale 1.02, brightness 110%
- **Tags**: Background color change
- **Links**: Underline appears
- **Dropdown**: Background darkens

---

## 🌈 Accessibility

### Color Contrast

- **Body Text**: 7:1 ratio (AAA)
- **Headings**: 4.5:1 ratio (AA)
- **Buttons**: 3:1 ratio (AA)

### Focus States

- **Visible**: 2px outline on focus
- **Color**: Blue-500 (high contrast)
- **Tab Order**: Logical navigation

### Screen Readers

- **Alt Text**: All icons have labels
- **ARIA Labels**: Buttons and inputs
- **Semantic HTML**: Proper heading structure

---

## 📐 Responsive Breakpoints

### Desktop (>1024px)

- Split layout (50/50)
- Large fonts
- Wide code editor

### Tablet (768px - 1024px)

- Stacked layout
- Medium fonts
- Full-width editor

### Mobile (<768px)

- Stacked layout
- Smaller fonts
- Touch-optimized buttons

---

## 🎨 Design Inspiration

The interface is inspired by:

- **LeetCode**: Split layout, language selector
- **HackerRank**: Input/output section, examples
- **VS Code**: Code editor theme, syntax highlighting
- **CodePen**: Resizable panels, clean UI

---

## 📊 Visual Hierarchy

1. **Problem Title** (Largest, Bold)
2. **Difficulty & Tags** (Color-coded, Medium)
3. **Description** (Body text, Normal)
4. **Examples** (Code blocks, Monospace)
5. **Code Editor** (Prominent, Large area)
6. **Input/Output** (Secondary, Smaller area)
7. **Buttons** (Call-to-action, Bright colors)

---

This visual guide provides a complete overview of the Problem Solving Interface design and layout.
