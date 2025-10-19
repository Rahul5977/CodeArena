# 📊 LeetLab Dashboard Documentation

## Overview

The Dashboard is the main hub for users to view their coding progress, recent activity, and personalized recommendations. It provides a comprehensive, data-driven view similar to LeetCode/Codeforces dashboards.

## Features

### 1. **Welcome Header**

- Personalized greeting with user's name
- Gradient background (primary to secondary colors)
- Manual refresh button for updating data

### 2. **Quick Actions**

Four quick-access buttons for common tasks:

- 🧩 Browse Problems → `/problems`
- 📋 Study Sheets → `/sheets`
- 📚 Practice Playlists → `/playlists`
- 🏆 Join Contest → `/contests`

### 3. **Statistics Cards**

Four stat cards with animated hover effects:

- ✅ **Problems Solved** - Total unique problems solved (Accepted submissions)
- 🔥 **Current Streak** - Consecutive days with submissions
- ⏱️ **Total Submissions** - All submission attempts
- 🏅 **Global Rank** - User's platform ranking (placeholder for now)

### 4. **Recent Submissions**

- Shows last 10 submissions
- Color-coded verdict badges:
  - 🟢 Green: Accepted
  - 🔴 Red: Wrong Answer
  - 🟡 Yellow: Time Limit Exceeded
- Displays: Problem title, language, execution time, relative timestamp
- Clickable to navigate to problem page
- Empty state with "Solve Problem" CTA

### 5. **Activity Heatmap**

- GitHub-style contribution graph
- Last 90 days of coding activity
- Color intensity based on problems solved per day
- Tooltip on hover showing exact count and date
- Summary stats: Total Solved, Active Days
- Legend showing color intensity scale

### 6. **Recommended Problems**

- Displays up to 6 recommended problems
- Shows: Title, difficulty badge, top tags, "Solve Now" button
- Currently shows unsolved problems (can be enhanced with ML recommendations)
- Grid layout (1 column on mobile, 2 on tablet, 3 on desktop)
- Empty state with "Browse Problems" CTA

## Components Structure

```
/frontend/src/
├── pages/
│   └── Dashboard.jsx           # Main dashboard page
└── components/dashboard/
    ├── StatsCard.jsx            # Individual stat card
    ├── QuickActions.jsx         # Quick action buttons
    ├── RecentSubmissions.jsx    # Recent submissions list
    ├── RecommendedProblems.jsx  # Recommended problems grid
    └── ActivityHeatmap.jsx      # Activity calendar heatmap
```

## API Endpoints Used

### Current Implementation

- `GET /api/v1/submissions` - Fetches user submissions
- `GET /api/v1/problem` - Fetches all problems

### Stats Calculation (Client-Side)

- **Solved Count**: Unique `problemId` from Accepted submissions
- **Total Submissions**: Total count of all submissions
- **Streak**: Consecutive days with submissions (calculated from `createdAt`)
- **Activity Data**: Aggregated submissions by date

### Future Enhancements

These endpoints could be added to the backend for better performance:

```javascript
// Recommended backend endpoints
GET /api/v1/user/stats
Response: {
  solvedCount: 128,
  totalSubmissions: 540,
  streak: 7,
  rank: 152
}

GET /api/v1/submissions/recent?limit=10
Response: {
  submissions: [...]
}

GET /api/v1/problems/recommended?limit=6
Response: {
  problems: [...]
}

GET /api/v1/user/activity?days=90
Response: {
  activity: [
    { date: "2025-10-10", count: 2 },
    { date: "2025-10-11", count: 0 },
    { date: "2025-10-12", count: 3 }
  ]
}
```

## Styling & Theme

### Design System

- **Framework**: DaisyUI (Tailwind CSS)
- **Animations**: Framer Motion
- **Icons**: React Icons (Feather Icons)
- **Dark/Light Mode**: Automatic support via DaisyUI themes

### Color Coding

- **Success/Accepted**: `badge-success` (Green)
- **Warning/TLE**: `badge-warning` (Yellow)
- **Error/Wrong Answer**: `badge-error` (Red)
- **Primary Actions**: `btn-primary`
- **Secondary Actions**: `btn-secondary`

### Responsive Design

- **Mobile** (< 768px): Single column layout
- **Tablet** (768px - 1024px): 2-column grids
- **Desktop** (> 1024px): 3-4 column grids

## State Management

```javascript
const [dashboardData, setDashboardData] = useState({
  stats: {
    solvedCount: 0,
    totalSubmissions: 0,
    streak: 0,
    rank: 0,
  },
  submissions: [],
  recommendedProblems: [],
  activity: [],
});
```

## Loading States

All components support loading states with skeleton placeholders:

- Stats Cards: Show "..." while loading
- Submissions: Animated skeleton cards
- Problems: Animated skeleton cards
- Heatmap: Skeleton stats and grid

## Error Handling

- Failed API calls use `Promise.allSettled` to prevent complete failure
- Fallback to empty arrays `[]` if endpoints fail
- Toast notifications for critical errors
- Graceful degradation: Shows what data is available

## Future Enhancements

1. **Backend Optimization**

   - Create dedicated `/dashboard` endpoint returning all data
   - Add caching (Redis) for frequently accessed stats
   - Implement recommendation algorithm (ML-based or tag-based)

2. **Additional Features**

   - Weekly performance chart (Recharts line chart)
   - Problem of the Day (POTD) card
   - Achievement badges
   - Global rank chart
   - Motivational quotes
   - Study goals tracker
   - Contest schedule preview

3. **Real-time Updates**

   - WebSocket for live leaderboard updates
   - Real-time submission status
   - Live contest countdowns

4. **Performance**
   - Implement React Query for caching & refetching
   - Lazy load heavy components
   - Virtual scrolling for long lists

## Usage

```jsx
import Dashboard from "./pages/Dashboard";

// Protected route
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>;
```

## Dependencies

```json
{
  "framer-motion": "^10.x",
  "react-router-dom": "^6.x",
  "react-icons": "^4.x",
  "date-fns": "^2.x",
  "prop-types": "^15.x"
}
```

## Testing Checklist

- [ ] All stats display correctly
- [ ] Submissions list is clickable and navigates correctly
- [ ] Activity heatmap shows last 90 days
- [ ] Recommended problems link to correct pages
- [ ] Quick actions navigate to correct routes
- [ ] Refresh button works without errors
- [ ] Loading states display properly
- [ ] Empty states show when no data
- [ ] Responsive on mobile, tablet, and desktop
- [ ] Dark/light mode works correctly
- [ ] Animations are smooth
- [ ] Error handling works (try with network offline)

## Accessibility

- ✅ Semantic HTML structure
- ✅ ARIA labels for icons
- ✅ Keyboard navigation support
- ✅ Focus states on interactive elements
- ✅ Color contrast meets WCAG AA standards
- ✅ Loading states announced to screen readers

---

Built with ❤️ for LeetLab
