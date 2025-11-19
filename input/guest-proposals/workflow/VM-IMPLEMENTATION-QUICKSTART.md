# Virtual Meeting System - Implementation Quick Start

**Purpose:** Get the VM system running in minimum time
**Prerequisite:** Read WORKFLOW-PASS3-FOCUSED-COMPLETION.md for complete details

---

## 30-Second Overview

Build a **single reusable popup** that shows different forms based on **custom states**. Five button-click workflows set the states, then show the popup.

---

## Step 1: Database (30 minutes)

### Create Virtual_Meeting Table

```sql
CREATE TABLE Virtual_Meeting (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES Proposal(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES User(id),
    booked_date TIMESTAMP,
    confirmedBySplitLease BOOLEAN DEFAULT FALSE,
    meeting_declined BOOLEAN DEFAULT FALSE,
    meeting_link TEXT,
    guest_notes TEXT,
    host_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vm_proposal ON Virtual_Meeting(proposal_id);
CREATE INDEX idx_vm_requested_by ON Virtual_Meeting(requested_by);
```

### Add Relationship to Proposal

```sql
ALTER TABLE Proposal
ADD COLUMN virtual_meeting_id UUID REFERENCES Virtual_Meeting(id);
```

---

## Step 2: UI Component (2 hours)

### Create Reusable Element: respond-request-cancel-vm

**Type:** Popup / Reusable Element

**Custom States:**
```
State Name: user
Type: User
Default: Current User

State Name: view
Type: Text
Default: "request"

State Name: user_is_suggesting_alternative
Type: Text
Default: ""
```

### Popup Structure

```
respond-request-cancel-vm (popup)
├── Close Button (X icon)
├── Group: Request View (visible when view = "request")
│   ├── Heading: "Request Virtual Meeting"
│   ├── Date/Time Picker
│   ├── Text Input: Notes
│   ├── Checkbox: "Suggesting alternative time" (if user_is_suggesting_alternative = "yes")
│   └── Button: Submit Request
│
├── Group: Respond View (visible when view = "respond")
│   ├── Heading: "Respond to Virtual Meeting Request"
│   ├── Text: "Proposed time: {vm.booked_date}"
│   ├── Text: "Requested by: {vm.requested_by}"
│   ├── Button: Accept
│   ├── Button: Decline
│   └── Link: "Suggest different time"
│
├── Group: Details View (visible when view = "details")
│   ├── Heading: "Virtual Meeting Details"
│   ├── Text: "Date: {vm.booked_date}"
│   ├── Text: "Meeting link: {vm.meeting_link}"
│   ├── Text: "Status: Confirmed"
│   └── Button: Close
│
└── Group: Cancel View (visible when view = "cancel")
    ├── Heading: "Cancel Virtual Meeting"
    ├── Text: "Are you sure you want to cancel?"
    ├── Dropdown: Reason for cancellation
    ├── Button: Yes, Cancel
    └── Button: No, Go Back
```

### Conditional Visibility Rules

**Request View:**
```
This element is visible when:
  This respond-request-cancel-vm's view = "request"
```

**Respond View:**
```
This element is visible when:
  This respond-request-cancel-vm's view = "respond"
```

**Details View:**
```
This element is visible when:
  This respond-request-cancel-vm's view = "details"
```

**Cancel View:**
```
This element is visible when:
  This respond-request-cancel-vm's view = "cancel"
```

---

## Step 3: Button (15 minutes)

### Add Button to Proposal Card

**Element:** Button "Request Virtual Meeting new"

**Location:** On each proposal card/repeating group item

**Dynamic Text (optional):**
```
Conditional text based on VM state:
- If VM empty: "Request Virtual Meeting"
- If VM exists, not booked: "View Request"
- If booked: "Meeting Scheduled"
- If confirmed: "View Meeting Details"
```

---

## Step 4: Workflows (1 hour each = 5 hours total)

### Workflow 1: Initial Request

**Trigger:**
```
Element: B: Request Virtual Meeting new is clicked
Only when: Parent group's Proposal's virtual meeting is empty
```

**Actions:**
1. **Display data in respond-request-cancel-vm**
   - Data source: `Parent group's Proposal`

2. **Set state**
   - Element: respond-request-cancel-vm
   - State: user
   - Value: Current User

3. **Set state**
   - Element: respond-request-cancel-vm
   - State: view
   - Value: "request"

4. **Show respond-request-cancel-vm**

### Workflow 2: Host Responds

**Trigger:**
```
Element: B: Request Virtual Meeting new is clicked
Only when:
  Parent group's Proposal's virtual meeting's requested by ≠ Current User
  AND Parent group's Proposal's virtual meeting is not empty
  AND Parent group's Proposal's virtual meeting's booked date is empty
```

**Actions:**
1. Display data (same as Workflow 1)
2. Set state user = Current User
3. **Set state view = "respond"** (KEY DIFFERENCE)
4. Show popup

### Workflow 3: View Confirmed Meeting

**Trigger:**
```
Element: B: Request Virtual Meeting new is clicked
Only when:
  Parent group's Proposal's virtual meeting's booked date is not empty
  AND Parent group's Proposal's virtual meeting's confirmedBySplitLease is yes
```

**Actions:**
1. Display data
2. Set state user = Current User
3. **Set state view = "details"** (KEY DIFFERENCE)
4. Show popup

### Workflow 4: Request Alternative

**Trigger:**
```
Element: B: Request Virtual Meeting new is clicked
Only when:
  Parent group's Proposal's virtual meeting's meeting declined is yes
```

**Actions:**
1. Display data
2. Set state user = Current User
3. Set state view = "request"
4. **Set state user_is_suggesting_alternative = "yes"** (NEW STATE)
5. Show popup

### Workflow 5: Smart Respond Button (ADVANCED)

**Trigger:**
```
Element: B: Respond to Virtual M is clicked
(No additional condition - always fires)
```

**Actions:**
1. **Display data in respond-request-cancel-vm**
   - Data source: Parent group's Proposal

2. **Set state user (CONDITIONAL)**
   - Element: respond-request-cancel-vm
   - State: user = Current User
   - State: view = "respond"
   - **Only when:**
     - Parent group's Proposal's virtual meeting's booked date is empty
     - AND requested by ≠ Current User

3. **Set state view = cancel (CONDITIONAL)**
   - Element: respond-request-cancel-vm
   - State: view = "cancel"
   - State: user = Current User
   - **Only when:**
     - Parent group's Proposal's virtual meeting's booked date is not empty

4. **Set state view = cancel (CONDITIONAL)**
   - Element: respond-request-cancel-vm
   - State: view = "cancel"
   - State: user = Current User
   - **Only when:**
     - requested by = Current User
     - OR booked date is not empty

5. **Show respond-request-cancel-vm**
   - Always executes

---

## Step 5: Popup Actions (2 hours)

### Request View - Submit Button Workflow

**When:** Button "Submit Request" is clicked

**Actions:**
1. **Create new Virtual Meeting**
   - proposal_id: Parent element's Proposal's id
   - requested_by: Current User
   - booked_date: Input Date/Time Picker's value
   - guest_notes: Input Notes's value
   - meeting_declined: no
   - confirmedBySplitLease: no

2. **Update Proposal**
   - Set virtual_meeting_id = Result of step 1's id

3. **Hide popup**

4. **Show success alert**
   - "Virtual meeting request sent!"

### Respond View - Accept Button Workflow

**When:** Button "Accept" is clicked

**Actions:**
1. **Make changes to Virtual Meeting**
   - Thing to change: Parent element's Proposal's virtual meeting
   - booked_date: (keep existing value - already set by requestor)
   - confirmedBySplitLease: no (pending SL confirmation)
   - meeting_declined: no

2. **Send notification** (optional)
   - To: Parent element's Proposal's virtual meeting's requested by
   - Message: "Your virtual meeting request was accepted!"

3. **Hide popup**

4. **Show success alert**

### Respond View - Decline Button Workflow

**When:** Button "Decline" is clicked

**Actions:**
1. **Make changes to Virtual Meeting**
   - Thing to change: Parent element's Proposal's virtual meeting
   - meeting_declined: yes
   - booked_date: (clear)

2. **Hide popup**

3. **Show alert**
   - "Meeting request declined. They can suggest a different time."

### Respond View - Suggest Different Time Link

**When:** Link "Suggest different time" is clicked

**Actions:**
1. **Set state view = "request"**
   - Element: respond-request-cancel-vm
   - State: view
   - Value: "request"

2. **Set state user_is_suggesting_alternative = "yes"**

(Popup stays open, just changes view)

### Cancel View - Confirm Cancel Button

**When:** Button "Yes, Cancel" is clicked

**Actions:**
1. **Delete Virtual Meeting**
   - Thing to delete: Parent element's Proposal's virtual meeting

2. **Update Proposal**
   - Set virtual_meeting_id = empty

3. **Hide popup**

4. **Show alert**

---

## Step 6: Testing Checklist

### Test Case 1: Guest Requests Meeting
- [ ] Guest clicks "Request Virtual Meeting"
- [ ] Popup shows with request form
- [ ] Guest submits date/time
- [ ] VM created in database
- [ ] Proposal linked to VM

### Test Case 2: Host Responds - Accept
- [ ] Host sees proposal with VM request
- [ ] Host clicks "Request Virtual Meeting"
- [ ] Popup shows respond view
- [ ] Host clicks "Accept"
- [ ] VM updated (meeting_declined = no)

### Test Case 3: Host Responds - Decline
- [ ] Host clicks "Decline"
- [ ] VM updated (meeting_declined = yes)
- [ ] Guest can request alternative

### Test Case 4: Request Alternative
- [ ] After decline, guest clicks button
- [ ] Popup shows request form with "alternative" indicator
- [ ] Guest submits new time
- [ ] VM updated (meeting_declined = no, new date)

### Test Case 5: View Confirmed Meeting
- [ ] Admin sets confirmedBySplitLease = yes
- [ ] User clicks button
- [ ] Popup shows details view (read-only)
- [ ] Meeting link visible

### Test Case 6: Smart Respond Button
- [ ] Test with pending request (shows respond view)
- [ ] Test with booked meeting (shows cancel view)
- [ ] Test with confirmed meeting (shows cancel view)

---

## Common Issues & Solutions

### Issue: Popup shows wrong view

**Solution:** Check state is set BEFORE showing popup
- State-setting steps must come before "Show" action
- Verify "Only when" conditions are correct

### Issue: Workflow doesn't trigger

**Solution:** Check "Only when" conditions
- Use debugger to see which conditions are false
- Verify data structure (Parent group → Proposal → virtual meeting)

### Issue: Multiple workflows trigger at once

**Solution:** Make conditions mutually exclusive
- Use exact opposite conditions
- Example: "is empty" vs "is not empty"

### Issue: State doesn't persist

**Solution:** States are temporary (per page load)
- Set states every time before showing popup
- Don't rely on previous state values

---

## Performance Optimization

### Database Indexes

```sql
-- Already included in Step 1
CREATE INDEX idx_vm_proposal ON Virtual_Meeting(proposal_id);
CREATE INDEX idx_vm_requested_by ON Virtual_Meeting(requested_by);
```

### Conditional Loading

Only load VM data when needed:
```
Parent group's Proposal's virtual meeting (don't load all fields)
Parent group's Proposal's virtual meeting:loaded (load all fields when popup opens)
```

### Caching

Cache VM status on Proposal card:
- Add custom state "vm_status" to proposal card
- Calculate once when page loads
- Use for button text/visibility
- Refresh only when VM changes

---

## Advanced Features (Phase 2)

### Email Notifications
- Send email when VM requested
- Send email when VM accepted/declined
- Send reminder 24h before meeting

### Calendar Integration
- Generate .ics file for calendar
- Add Google Calendar integration
- Sync with user's calendar

### Meeting History
- Track all VM requests/responses
- Show history in proposal details
- Analytics on VM acceptance rate

### Admin Confirmation
- SplitLease admin reviews meetings
- Adds meeting link (Zoom/Google Meet)
- Sets confirmedBySplitLease = yes
- Sends confirmation to both parties

---

## Time Estimate

**Minimum Viable Product:**
- Step 1 (Database): 30 min
- Step 2 (UI): 2 hours
- Step 3 (Button): 15 min
- Step 4 (Workflows 1-3): 3 hours
- Step 5 (Popup actions): 2 hours
- **Total: 8 hours (1 day)**

**Complete System:**
- MVP: 8 hours
- Workflows 4-5: 2 hours
- Testing: 2 hours
- Polish: 2 hours
- **Total: 14 hours (2 days)**

**With Advanced Features:**
- Complete system: 14 hours
- Email notifications: 2 hours
- Calendar integration: 4 hours
- Admin confirmation flow: 3 hours
- **Total: 23 hours (3 days)**

---

## Next Steps

1. **Read full documentation:** WORKFLOW-PASS3-FOCUSED-COMPLETION.md
2. **Set up database:** Run SQL from Step 1
3. **Build popup:** Follow Step 2 structure
4. **Implement Workflows 1-3:** Start with basic request/respond
5. **Test end-to-end:** Use testing checklist
6. **Add Workflows 4-5:** Advanced features
7. **Polish UI:** Styling, error messages, loading states

---

*Quick Start Guide - VM System*
*For complete details, see WORKFLOW-PASS3-FOCUSED-COMPLETION.md*
