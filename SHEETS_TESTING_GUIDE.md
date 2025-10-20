# DSA Sheets System - Testing Guide

## Overview
This guide covers comprehensive testing of the DSA Sheets System integrated with CodeArena's frontend (Vite + React) and backend (Node/Express + Prisma).

## Test Data
The system has been pre-populated with 6 test sheets:

### FREE Sheets:
1. **Array Fundamentals - Beginner** (EASY) - ₹0
   - ID: `550e8400-e29b-41d4-a716-446655440001`
   - Problems: Two Sum (#1)
   - Estimated: 10 hours

2. **Top 50 Interview Questions** (MEDIUM) - ₹0
   - ID: `550e8400-e29b-41d4-a716-446655440004`
   - Problems: Two Sum (#1)
   - Estimated: 25 hours

### PREMIUM Sheets:
3. **Hash Table Mastery** (MEDIUM) - ₹299
   - ID: `550e8400-e29b-41d4-a716-446655440002`
   - Problems: Two Sum (#1)
   - Estimated: 15 hours

4. **Advanced Array Techniques** (HARD) - ₹499
   - ID: `550e8400-e29b-41d4-a716-446655440003`
   - Problems: Two Sum (#1)
   - Estimated: 20 hours

5. **Dynamic Programming Starter Pack** (MEDIUM) - ₹399
   - ID: `550e8400-e29b-41d4-a716-446655440005`
   - Problems: Two Sum (#1)
   - Estimated: 30 hours

6. **Graph Theory Fundamentals** (HARD) - ₹599
   - ID: `550e8400-e29b-41d4-a716-446655440006`
   - Problems: Two Sum (#1)
   - Estimated: 35 hours

## Backend API Testing

### 1. Test User Creation
```bash
# Register a test user
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"testuser@example.com",
    "password":"Test@1234"
  }'

# Save the accessToken from the response
```

### 2. Test Sheets List API
```bash
# Get all sheets (replace TOKEN with your JWT)
TOKEN="your-access-token-here"

curl -X GET http://localhost:8080/api/v1/sheets \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Test with filters
curl -X GET "http://localhost:8080/api/v1/sheets?difficulty=EASY" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

curl -X GET "http://localhost:8080/api/v1/sheets?type=FREE" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

curl -X GET "http://localhost:8080/api/v1/sheets?topic=Arrays" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### 3. Test Sheet Detail API
```bash
# Get FREE sheet details (should have access)
curl -X GET "http://localhost:8080/api/v1/sheets/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Get PREMIUM sheet details (no access initially)
curl -X GET "http://localhost:8080/api/v1/sheets/550e8400-e29b-41d4-a716-446655440002" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### 4. Test Problem Completion Toggle
```bash
# Mark problem as complete in FREE sheet
curl -X POST "http://localhost:8080/api/v1/sheets/550e8400-e29b-41d4-a716-446655440001/problems/1/complete" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Check updated progress
curl -X GET "http://localhost:8080/api/v1/sheets/550e8400-e29b-41d4-a716-446655440001" \
  -H "Authorization: Bearer $TOKEN" | jq '.sheet.progress'

# Toggle again to unmark
curl -X POST "http://localhost:8080/api/v1/sheets/550e8400-e29b-41d4-a716-446655440001/problems/1/complete" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### 5. Test Payment Flow (Backend)
```bash
# Create payment order for a PREMIUM sheet
curl -X POST "http://localhost:8080/api/v1/sheets/create-order" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sheetId": "550e8400-e29b-41d4-a716-446655440002"
  }' | jq '.'

# Note: Actual payment verification requires Razorpay test mode
```

## Frontend Testing

### Prerequisites
1. Ensure backend and frontend containers are running:
   ```bash
   docker-compose ps
   ```

2. Access the frontend at: http://localhost:3000

3. Login with your test user credentials

### Test Case 1: Sheets List Page

**Objective**: Verify sheets listing, filters, and navigation

**Steps**:
1. Navigate to `/sheets` from the sidebar
2. Verify all 6 sheets are displayed
3. Check that FREE sheets show "Free" badge
4. Check that PREMIUM sheets show price (₹299, ₹399, etc.)
5. Verify difficulty badges (Easy/Medium/Hard) with correct colors
6. Test filtering:
   - Select "Easy" difficulty → Should show 1 sheet
   - Select "Medium" difficulty → Should show 3 sheets
   - Select "Hard" difficulty → Should show 2 sheets
   - Select "Free" type → Should show 2 sheets
   - Select "Premium" type → Should show 4 sheets
   - Clear filters → Should show all 6 sheets
7. Test search:
   - Search "Array" → Should show 2 sheets
   - Search "Graph" → Should show 1 sheet
   - Clear search → Should show all sheets
8. Check loading states work correctly
9. Click on a sheet card → Should navigate to detail page

**Expected Results**:
- ✅ All sheets displayed with correct information
- ✅ Filters work correctly and can be combined
- ✅ Search filters sheets by title/description
- ✅ Loading skeleton appears while fetching
- ✅ Navigation to detail page works

---

### Test Case 2: FREE Sheet Detail Page

**Objective**: Verify FREE sheet access and problem interaction

**Steps**:
1. Click on "Array Fundamentals - Beginner" sheet
2. Verify sheet details displayed:
   - Title: "Array Fundamentals - Beginner"
   - Difficulty: EASY (green)
   - Topic: Arrays
   - Description visible
3. Check sidebar statistics:
   - Total Problems: 1
   - Completed: 0
   - Progress: 0%
   - Est. Time: 10h
4. Verify progress bar is at 0%
5. Check prerequisites section shows: "Basic Programming", "Loops"
6. Verify problems list is visible (not locked)
7. See "Two Sum" problem listed with:
   - Problem number: #1
   - Title: "Two Sum"
   - Difficulty: EASY
   - Tags: Array, Hash Table
   - Checkbox (unchecked)
8. Click checkbox to mark complete:
   - Checkbox should turn to checkmark (green)
   - Sidebar "Completed" should update to 1
   - Progress bar should update to 100%
9. Click checkbox again to unmark:
   - Checkbox should revert
   - Stats should update back to 0
10. Click on problem title → Should navigate to `/problems/1`

**Expected Results**:
- ✅ FREE sheet shows full access
- ✅ Statistics display correctly
- ✅ Problem completion toggle works
- ✅ Progress updates dynamically
- ✅ Navigation to problem page works

---

### Test Case 3: PREMIUM Sheet Detail Page (No Access)

**Objective**: Verify PREMIUM sheet locked state and payment modal

**Steps**:
1. Navigate back to sheets list
2. Click on "Hash Table Mastery" (₹299)
3. Verify locked state:
   - Lock icon visible in header
   - Large lock icon in center
   - "Premium Sheet" heading
   - Message: "Unlock this sheet to access all 1 problems..."
   - Price displayed: ₹299
   - "One-time payment • Lifetime access" text
   - "Purchase Now" button visible
4. Check sidebar still shows stats but no progress
5. Verify problems list is NOT visible
6. Click "Purchase Now" button:
   - Payment modal should appear
   - Modal shows sheet title and description
   - Price confirmation: ₹299
   - "Proceed to Payment" button visible
7. Click "X" or outside modal → Should close
8. Click "Back to Sheets" → Should navigate to sheets list

**Expected Results**:
- ✅ PREMIUM sheet shows locked state
- ✅ Purchase button triggers payment modal
- ✅ Modal displays correct information
- ✅ Modal can be closed
- ✅ Problems list is hidden

---

### Test Case 4: Filter Combinations

**Objective**: Test multiple filter combinations

**Test Scenarios**:
1. Difficulty: EASY + Type: FREE → Should show 1 sheet
2. Difficulty: MEDIUM + Type: PREMIUM → Should show 2 sheets
3. Topic: Arrays + Difficulty: HARD → Should show 1 sheet
4. Search: "Programming" + Type: PREMIUM → Should show 1 sheet
5. All filters cleared → Should show all 6 sheets

**Expected Results**:
- ✅ Filters combine correctly
- ✅ Empty state shows when no matches
- ✅ Clear filters button resets all

---

### Test Case 5: Responsive Design

**Objective**: Verify UI works on different screen sizes

**Steps**:
1. Test on desktop (1920x1080)
2. Test on tablet (768x1024)
3. Test on mobile (375x667)

**Check**:
- ✅ Sheet cards resize appropriately
- ✅ Sidebar on detail page stacks on mobile
- ✅ Filters remain accessible
- ✅ Modal fits screen
- ✅ Navigation works on all sizes

---

### Test Case 6: Error Handling

**Objective**: Verify error states are handled gracefully

**Test Scenarios**:
1. Invalid sheet ID in URL → Should show "Sheet not found"
2. Network error (stop backend) → Should show error message
3. Unauthorized access → Should redirect to login

---

### Test Case 7: Edge Cases

**Objective**: Test boundary conditions

**Test Scenarios**:
1. Sheet with 0 problems → Should handle gracefully
2. Very long sheet description → Should not break layout
3. Many tags on problem → Should truncate or scroll
4. Rapid clicking on completion checkbox → Should debounce
5. Multiple browser tabs → Progress should sync

---

## Payment Integration Testing (Razorpay)

### Important Notes:
- Razorpay requires test API keys
- Update `.env` with test keys: `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- Use Razorpay test cards for payment

### Test Payment Flow:
1. Click "Purchase Now" on premium sheet
2. Payment modal opens
3. Click "Proceed to Payment"
4. Razorpay checkout loads
5. Use test card: `4111 1111 1111 1111`
6. CVV: any 3 digits
7. Expiry: any future date
8. Complete payment
9. Verify:
   - Success toast appears
   - Modal closes
   - Sheet unlocks (reload page)
   - Problems list becomes visible
   - Progress tracking works
   - Sheet appears in "My Sheets"

---

## Database Verification

### Check User Sheet Access:
```bash
docker exec -i leetlab-postgres-dev psql -U myuser -d postgres -c \
  "SELECT \"userId\", \"sheetId\", \"hasAccess\", \"createdAt\" FROM \"UserSheet\";"
```

### Check Problem Progress:
```bash
docker exec -i leetlab-postgres-dev psql -U myuser -d postgres -c \
  "SELECT \"userId\", \"sheetId\", \"problemId\", \"isCompleted\" FROM \"SheetProgress\";"
```

### Check Payments:
```bash
docker exec -i leetlab-postgres-dev psql -U myuser -d postgres -c \
  "SELECT \"userId\", \"sheetId\", amount, status, \"createdAt\" FROM \"Payment\";"
```

---

## Performance Testing

### Load Time Benchmarks:
- Sheets list load: < 500ms
- Sheet detail load: < 300ms
- Problem completion toggle: < 200ms
- Filter application: < 100ms (client-side)

### Test with Browser DevTools:
1. Open Network tab
2. Navigate to sheets
3. Check API response times
4. Verify no memory leaks
5. Check for console errors

---

## Common Issues & Solutions

### Issue 1: Sheets not loading
**Solution**: 
- Check backend is running: `docker ps`
- Verify JWT token is valid
- Check browser console for errors
- Verify API endpoint in `.env`: `VITE_API_URL=http://localhost:8080/api/v1`

### Issue 2: Payment not working
**Solution**:
- Verify Razorpay keys in `.env`
- Check Razorpay script loads
- Ensure using test mode keys
- Check browser console for errors

### Issue 3: Progress not updating
**Solution**:
- Check network requests succeed
- Verify WebSocket connection (if used)
- Clear browser cache
- Check database for updates

### Issue 4: Filters not working
**Solution**:
- Check Zustand store is properly connected
- Verify filter state updates
- Check API query parameters
- Clear and reapply filters

---

## Success Criteria

The DSA Sheets System is considered fully functional when:

✅ All 6 test sheets display correctly  
✅ FREE sheets grant immediate access  
✅ PREMIUM sheets show locked state  
✅ Filters work individually and in combination  
✅ Search functionality works  
✅ Problem completion toggles correctly  
✅ Progress updates in real-time  
✅ Payment modal displays correctly  
✅ Navigation between pages works smoothly  
✅ Responsive design works on all devices  
✅ Error states are handled gracefully  
✅ No console errors  
✅ API responses are fast (< 500ms)  
✅ Database records are created correctly  

---

## Next Steps After Testing

1. **Add more problems** to sheets (currently only Two Sum)
2. **Implement payment verification** with real Razorpay test keys
3. **Add sheet analytics** (views, completion rates)
4. **Implement sheet reviews** and ratings
5. **Add "My Sheets"** section to track purchased sheets
6. **Create admin panel** for sheet management
7. **Add sheet sharing** functionality
8. **Implement sheet leaderboards**

---

## Test Execution Checklist

- [ ] Backend API tests completed
- [ ] Frontend sheets list tested
- [ ] FREE sheet access verified
- [ ] PREMIUM sheet lock verified
- [ ] Filters and search tested
- [ ] Problem completion tested
- [ ] Progress tracking verified
- [ ] Payment modal tested
- [ ] Responsive design checked
- [ ] Error handling verified
- [ ] Database records confirmed
- [ ] Performance benchmarks met
- [ ] Cross-browser testing done
- [ ] Documentation updated

---

## Test Report Template

**Date**: ___________  
**Tester**: ___________  
**Environment**: Dev / Staging / Production  

**Results**:
- Sheets List: ✅ / ❌
- Sheet Detail: ✅ / ❌
- Filters: ✅ / ❌
- Progress: ✅ / ❌
- Payment: ✅ / ❌
- Responsive: ✅ / ❌

**Issues Found**:
1. 
2. 
3. 

**Notes**:


---

*Last Updated: October 20, 2025*
*Version: 1.0*
