# 🧪 Dashboard Testing Guide

## Quick Test Steps

### 1. Access the Dashboard

1. **Open your browser:**

   ```
   http://localhost:3000
   ```

2. **Login:**

   - Navigate to http://localhost:3000/login
   - Use your test credentials
   - Should redirect to `/dashboard` after successful login

3. **If not logged in:**
   - Try accessing `/dashboard` directly
   - Should redirect to `/login` (protected route)

---

## 2. Visual Verification Checklist

### Header Section

- [ ] Shows "Welcome back, [Your Name]! 👋"
- [ ] Gradient background (blue to purple-ish)
- [ ] "Refresh" button visible in top-right

### Quick Actions (4 Cards)

- [ ] Browse Problems
- [ ] Study Sheets
- [ ] Practice Playlists
- [ ] Join Contest
- [ ] All have icons and hover effects

### Stats Cards (4 Cards)

- [ ] Problems Solved (green gradient)
- [ ] Current Streak (orange gradient)
- [ ] Total Submissions (blue gradient)
- [ ] Global Rank (purple gradient)
- [ ] Each card has icon, number, and subtitle

### Recent Submissions

- [ ] Shows list of recent submissions (if any)
- [ ] Color-coded verdict badges
- [ ] Shows language and time
- [ ] OR shows "No submissions yet" with CTA button

### Activity Heatmap

- [ ] Shows calendar-style grid
- [ ] Last 90 days
- [ ] Shows "Total Solved" and "Active Days" stats
- [ ] Hover over squares shows tooltip
- [ ] OR shows "No activity yet" for new users

### Recommended Problems

- [ ] Grid of problem cards (up to 6)
- [ ] Each card has: Title, difficulty badge, tags, "Solve Now" button
- [ ] OR shows "No recommendations yet" with CTA

---

## 3. Interaction Tests

### Click Tests

```
✅ Click "Refresh" → Should show loading spinner, then reload data
✅ Click "Browse Problems" → Navigate to /problems
✅ Click "Study Sheets" → Navigate to /sheets
✅ Click "Practice Playlists" → Navigate to /playlists
✅ Click "Join Contest" → Navigate to /contests
✅ Click a submission row → Navigate to /problems/[id]
✅ Click a recommended problem → Navigate to /problems/[id]
✅ Click "Solve Problem" (empty state) → Navigate to /problems
```

### Hover Tests

```
✅ Hover over stat card → Should scale up + glow effect
✅ Hover over quick action → Should scale up
✅ Hover over submission → Should highlight + slide
✅ Hover over heatmap square → Should show tooltip
✅ Hover over problem card → Should lift + glow
```

---

## 4. Responsive Design Test

### Desktop (> 1024px)

- [ ] 4 stat cards in one row
- [ ] 4 quick actions in one row
- [ ] 2 columns for submissions + heatmap
- [ ] 3 recommended problem cards per row

### Tablet (768px - 1024px)

- [ ] 2-3 stat cards per row
- [ ] 2-4 quick actions per row
- [ ] 1-2 columns for submissions + heatmap
- [ ] 2 recommended problem cards per row

### Mobile (< 768px)

- [ ] 1-2 stat cards per row
- [ ] 2 quick actions per row
- [ ] 1 column for everything
- [ ] 1 recommended problem card per row

**Test by resizing browser window**

---

## 5. Data Verification

### If You Have Submissions

Check that the dashboard correctly shows:

- [ ] Solved count matches unique accepted problems
- [ ] Submission count is accurate
- [ ] Recent submissions list shows latest 10
- [ ] Activity heatmap has colored squares for days with submissions
- [ ] Streak calculation makes sense

### If You're a New User

- [ ] All stats show 0 or N/A
- [ ] "No submissions yet" message appears
- [ ] "No recommendations yet" OR shows unsolved problems
- [ ] Activity heatmap is mostly empty/gray
- [ ] Empty states have CTA buttons

---

## 6. Theme Test (Dark/Light Mode)

If your app supports theme toggle:

- [ ] Switch to dark mode → Dashboard adapts colors
- [ ] Switch to light mode → Dashboard adapts colors
- [ ] All text remains readable
- [ ] Gradients still look good
- [ ] Hover effects still visible

---

## 7. Loading State Test

1. **Hard refresh the page (Cmd+Shift+R or Ctrl+Shift+R)**

   - [ ] Should see skeleton loaders briefly
   - [ ] Stats cards show "..."
   - [ ] Submissions show animated placeholders
   - [ ] Problems show animated placeholders
   - [ ] Heatmap shows skeleton

2. **Click "Refresh" button**
   - [ ] Refresh icon spins
   - [ ] Data reloads
   - [ ] No errors in console

---

## 8. Error Handling Test

### Simulate Network Error

```javascript
// In browser console:
// Block network, then click refresh
// Should show toast error but not crash
```

- [ ] Page doesn't crash
- [ ] Shows error toast notification
- [ ] Displays available data
- [ ] Empty states appear where data failed

---

## 9. Browser Console Check

Open DevTools Console (F12) and verify:

- [ ] No React errors
- [ ] No network errors (except expected 404s)
- [ ] No PropTypes warnings
- [ ] No key warnings
- [ ] API calls are successful (200 OK)

---

## 10. Performance Check

### Animations

- [ ] All animations are smooth (60fps)
- [ ] No janky transitions
- [ ] Hover effects are responsive
- [ ] Page load is fast

### Loading Time

- [ ] Initial render < 1 second
- [ ] Data fetch < 2 seconds (depends on backend)
- [ ] Refresh is quick

---

## 🐛 Common Issues & Fixes

### Issue: "Page not found" when accessing /dashboard

**Fix:** Make sure you're logged in. Dashboard is a protected route.

### Issue: Stats show 0 even though you have submissions

**Fix:**

1. Check browser console for API errors
2. Verify `/api/v1/submissions` endpoint returns data
3. Check that backend is running

### Issue: "No submissions yet" but you've submitted problems

**Fix:**

1. Check that submissions have `verdict` field set
2. Verify `problemId` exists on submissions
3. Check that user ID matches between auth and submissions

### Issue: Recommended problems don't show

**Fix:**

1. Check `/api/v1/problem` endpoint
2. Verify problems exist in database
3. Check console for errors

### Issue: Heatmap is empty

**Fix:** Activity is calculated from submissions. If you have no submissions, heatmap will be empty (expected behavior).

### Issue: Theme doesn't work

**Fix:** Make sure DaisyUI is properly configured in tailwind.config.js

---

## 📊 Sample Test Data

If you need test data, you can:

1. **Solve some problems** via the platform
2. **OR use the backend API** to create test submissions:

```javascript
// Example: Create a test submission
POST /api/v1/submissions
{
  "problemId": "some-problem-id",
  "code": "console.log('test')",
  "language": "javascript",
  "verdict": "Accepted"
}
```

---

## ✅ Success Criteria

Dashboard is working if:

- ✅ All sections render without errors
- ✅ Data loads from backend APIs
- ✅ Animations are smooth
- ✅ Responsive on all devices
- ✅ No console errors
- ✅ Protected route works (redirects if not logged in)
- ✅ All links navigate correctly
- ✅ Empty states show when appropriate
- ✅ Loading states work

---

## 🎉 You're Done!

If all checks pass, your dashboard is ready for production! 🚀

**Enjoy your beautiful new dashboard!**

---

## 📞 Need Help?

- Check **DASHBOARD_README.md** for technical details
- Check **DASHBOARD_IMPLEMENTATION_COMPLETE.md** for full summary
- Review component files for inline documentation
- Check browser console for errors
