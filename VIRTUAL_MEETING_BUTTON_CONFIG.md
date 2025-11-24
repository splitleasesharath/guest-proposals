# Request Virtual Meeting Button - State Machine Configuration

## Database Schema Reference

### Tables
- **proposals**: Main proposal table with status tracking
- **virtual_meetings**: Meeting request and scheduling data linked to proposals

### Key Fields
```sql
-- proposals table
proposals.id (text, UUID)
proposals.status (varchar, proposal lifecycle status)
proposals.guest_id (text, guest user ID)
proposals.host_id (text, host user ID)

-- virtual_meetings table
virtual_meetings.id (text, UUID)
virtual_meetings.proposal_id (text, FK to proposals.id)
virtual_meetings.requested_by (text, user ID who initiated request)
virtual_meetings.booked_date (timestamp, scheduled meeting date/time)
virtual_meetings.confirmed_by_splitlease (boolean, admin confirmation)
virtual_meetings.meeting_declined (boolean, rejection flag)
virtual_meetings.meeting_link (text, virtual meeting URL)
```

---

## Button State Machine

### State 1: **Default - "Request Virtual Meeting"**
**When to Show**: Initial state, no meeting has been requested yet

**Database Conditions**:
```javascript
// No virtual_meetings record exists for this proposal
!virtualMeeting || virtualMeeting === null
```

**SQL Check**:
```sql
SELECT * FROM virtual_meetings
WHERE proposal_id = $proposalId
LIMIT 1;
-- Returns: NULL or no rows
```

**Button Appearance**:
- Label: "Request Virtual Meeting"
- Background: `rgb(209, 213, 219)` (gray)
- Action: Opens modal to select date/time

---

### State 2: **Pending - "Virtual Meeting Requested"**
**When to Show**: Current user has requested a meeting, waiting for response

**Database Conditions**:
```javascript
virtualMeeting.proposal_id === proposalId &&
virtualMeeting.requested_by === currentUserId &&
virtualMeeting.booked_date === null &&
!virtualMeeting.meeting_declined
```

**SQL Check**:
```sql
SELECT * FROM virtual_meetings
WHERE proposal_id = $proposalId
  AND requested_by = $currentUserId
  AND booked_date IS NULL
  AND meeting_declined = false;
```

**Button Appearance**:
- Label: "Virtual Meeting Requested"
- State: Disabled/Read-only
- Letter spacing: -0.35px

---

### State 3: **Action Required - "Respond to Virtual Meeting Request"**
**When to Show**: Another user requested a meeting, current user needs to respond

**Database Conditions**:
```javascript
virtualMeeting.proposal_id === proposalId &&
virtualMeeting.requested_by !== currentUserId &&
virtualMeeting.booked_date === null &&
!virtualMeeting.meeting_declined
```

**SQL Check**:
```sql
SELECT * FROM virtual_meetings
WHERE proposal_id = $proposalId
  AND requested_by != $currentUserId
  AND booked_date IS NULL
  AND meeting_declined = false;
```

**Button Appearance**:
- Label: "Respond to Virtual Meeting Request"
- Letter spacing: -0.35px
- Action: Opens modal to accept/decline or propose alternate time

---

### State 4: **Scheduled - "Virtual Meeting Accepted"**
**When to Show**: Meeting scheduled, waiting for SplitLease admin confirmation

**Database Conditions**:
```javascript
virtualMeeting.proposal_id === proposalId &&
virtualMeeting.booked_date !== null &&
virtualMeeting.confirmed_by_splitlease === false &&
!virtualMeeting.meeting_declined
```

**SQL Check**:
```sql
SELECT * FROM virtual_meetings
WHERE proposal_id = $proposalId
  AND booked_date IS NOT NULL
  AND confirmed_by_splitlease = false
  AND meeting_declined = false;
```

**Button Appearance**:
- Label: "Virtual Meeting Accepted"
- State: Info/Waiting state
- Shows scheduled date/time

---

### State 5: **Confirmed - "Meeting confirmed"**
**When to Show**: SplitLease admin has confirmed, meeting link available

**Database Conditions**:
```javascript
virtualMeeting.proposal_id === proposalId &&
virtualMeeting.booked_date !== null &&
virtualMeeting.confirmed_by_splitlease === true &&
virtualMeeting.meeting_link !== null &&
!virtualMeeting.meeting_declined
```

**SQL Check**:
```sql
SELECT * FROM virtual_meetings
WHERE proposal_id = $proposalId
  AND booked_date IS NOT NULL
  AND confirmed_by_splitlease = true
  AND meeting_link IS NOT NULL
  AND meeting_declined = false;
```

**Button Appearance**:
- Label: "Meeting confirmed"
- Action: Click to join meeting (opens meeting_link)

---

### State 6: **Declined - "Virtual Meeting Declined"**
**When to Show**: Meeting request was declined by either party

**Database Conditions**:
```javascript
virtualMeeting.proposal_id === proposalId &&
virtualMeeting.meeting_declined === true
```

**SQL Check**:
```sql
SELECT * FROM virtual_meetings
WHERE proposal_id = $proposalId
  AND meeting_declined = true;
```

**Button Appearance**:
- Label: "Virtual Meeting Declined"
- Bold: `true`
- Font color: `#DB2E2E` (red)
- Tooltip: "click to request another one"
- Action: Allows requesting a new meeting (resets meeting_declined flag)

---

## Button Visibility Rules

### Show Button When:
The button should be **visible** for most proposal statuses, with specific visibility for these states:

```javascript
// Always visible for active proposal states
const isVisible =
  // Standard active states (always visible)
  proposal.status.includes('Submitted') ||
  proposal.status.includes('Accepted') ||
  proposal.status.includes('Pending') ||

  // Specific states where button remains visible
  proposal.status === 'Proposal Rejected by Host' ||
  proposal.status === 'Proposal Cancelled by Renter' ||
  proposal.status === 'Proposal Submitted for guest by Split Lease - Awaiting Rental Application' ||
  proposal.status === 'Proposal Submitted for guest by Split Lease - Pending Confirmation';
```

**SQL Check**:
```sql
SELECT * FROM proposals
WHERE id = $proposalId
  AND (
    status LIKE '%Submitted%'
    OR status LIKE '%Accepted%'
    OR status LIKE '%Pending%'
    OR status = 'Proposal Rejected by Host'
    OR status = 'Proposal Cancelled by Renter'
    OR status = 'Proposal Submitted for guest by Split Lease - Awaiting Rental Application'
    OR status = 'Proposal Submitted for guest by Split Lease - Pending Confirmation'
  );
```

### Hide Button When:
```javascript
// Hide for completed/archived proposals
proposal.status === 'Proposal Completed' ||
proposal.status === 'Lease Signed' ||
proposal.deleted === true
```

---

## Implementation Flow

### User Flow Diagram
```
┌─────────────────────────────────────────────────────────────┐
│ Initial State: No meeting requested                         │
│ Button: "Request Virtual Meeting" (Gray)                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ User clicks → Opens modal
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ Guest/Host selects dates → Creates virtual_meetings record  │
│ INSERT INTO virtual_meetings (proposal_id, requested_by)    │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ↓ (Requester view)            ↓ (Recipient view)
┌───────────────────┐        ┌────────────────────────────────┐
│ State: Requested  │        │ State: Respond to Request      │
│ (Read-only)       │        │ (Action required)              │
└─────────┬─────────┘        └──────────┬─────────────────────┘
          │                              │
          │                              ↓ Accepts & books date
          │                    UPDATE booked_date = timestamp
          │                              │
          └──────────┬───────────────────┘
                     ↓
        ┌────────────────────────────┐
        │ State: Virtual Meeting      │
        │ Accepted (Awaiting admin)   │
        │ booked_date IS NOT NULL     │
        │ confirmed_by_splitlease=no  │
        └────────────┬────────────────┘
                     │
                     ↓ Admin confirms
           UPDATE confirmed_by_splitlease = true,
                  meeting_link = 'zoom.us/...'
                     │
        ┌────────────┴────────────────┐
        │ State: Meeting Confirmed    │
        │ Click to join meeting       │
        └─────────────────────────────┘

Alternative Path: Decline
┌─────────────────────────────────────┐
│ User declines request               │
│ UPDATE meeting_declined = true      │
└──────────┬──────────────────────────┘
           ↓
┌──────────────────────────────────────┐
│ State: Virtual Meeting Declined      │
│ (Red, bold) "click to request        │
│ another one"                         │
└──────────────────────────────────────┘
```

---

## SQL Queries for State Management

### 1. Check Current Meeting State
```sql
SELECT
  vm.id,
  vm.requested_by,
  vm.booked_date,
  vm.confirmed_by_splitlease,
  vm.meeting_declined,
  vm.meeting_link,
  p.guest_id,
  p.host_id,
  p.status as proposal_status
FROM virtual_meetings vm
JOIN proposals p ON p.id = vm.proposal_id
WHERE vm.proposal_id = $proposalId;
```

### 2. Create New Meeting Request
```sql
INSERT INTO virtual_meetings (
  proposal_id,
  requested_by,
  created_at,
  updated_at
) VALUES (
  $proposalId,
  $currentUserId,
  NOW(),
  NOW()
) RETURNING *;
```

### 3. Accept Meeting & Set Date
```sql
UPDATE virtual_meetings
SET
  booked_date = $selectedDateTime,
  updated_at = NOW()
WHERE proposal_id = $proposalId
  AND meeting_declined = false
RETURNING *;
```

### 4. Admin Confirm Meeting
```sql
UPDATE virtual_meetings
SET
  confirmed_by_splitlease = true,
  meeting_link = $meetingUrl,
  updated_at = NOW()
WHERE proposal_id = $proposalId
  AND booked_date IS NOT NULL
RETURNING *;
```

### 5. Decline Meeting
```sql
UPDATE virtual_meetings
SET
  meeting_declined = true,
  updated_at = NOW()
WHERE proposal_id = $proposalId
RETURNING *;
```

### 6. Request Another Meeting (After Decline)
```sql
-- Option A: Reset the existing record
UPDATE virtual_meetings
SET
  meeting_declined = false,
  booked_date = NULL,
  confirmed_by_splitlease = false,
  meeting_link = NULL,
  requested_by = $currentUserId,
  updated_at = NOW()
WHERE proposal_id = $proposalId;

-- Option B: Create new record and archive old one
-- (Preferred for audit trail)
INSERT INTO virtual_meetings (
  proposal_id,
  requested_by,
  created_at,
  updated_at
) VALUES (
  $proposalId,
  $currentUserId,
  NOW(),
  NOW()
);
```

---

## React Component Logic Example

```javascript
// Hook to get current button state
function useVirtualMeetingButtonState(proposalId, currentUserId) {
  const [proposal, setProposal] = useState(null);
  const [virtualMeeting, setVirtualMeeting] = useState(null);

  useEffect(() => {
    // Fetch proposal and virtual_meeting data
    async function fetchData() {
      const { data: proposalData } = await supabase
        .from('proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      const { data: meetingData } = await supabase
        .from('virtual_meetings')
        .select('*')
        .eq('proposal_id', proposalId)
        .single();

      setProposal(proposalData);
      setVirtualMeeting(meetingData);
    }

    fetchData();
  }, [proposalId]);

  // Determine button state
  const getButtonState = () => {
    // Check visibility first
    if (!proposal) return { visible: false };

    const isVisible =
      proposal.status?.includes('Submitted') ||
      proposal.status?.includes('Accepted') ||
      proposal.status === 'Proposal Rejected by Host' ||
      proposal.status === 'Proposal Cancelled by Renter';

    if (!isVisible || proposal.deleted) {
      return { visible: false };
    }

    // No meeting exists
    if (!virtualMeeting) {
      return {
        visible: true,
        state: 'default',
        label: 'Request Virtual Meeting',
        action: 'open-request-modal'
      };
    }

    // Meeting declined
    if (virtualMeeting.meeting_declined) {
      return {
        visible: true,
        state: 'declined',
        label: 'Virtual Meeting Declined',
        style: { fontWeight: 'bold', color: '#DB2E2E' },
        tooltip: 'click to request another one',
        action: 'request-another'
      };
    }

    // Meeting confirmed
    if (
      virtualMeeting.booked_date &&
      virtualMeeting.confirmed_by_splitlease &&
      virtualMeeting.meeting_link
    ) {
      return {
        visible: true,
        state: 'confirmed',
        label: 'Meeting confirmed',
        action: 'join-meeting',
        meetingLink: virtualMeeting.meeting_link
      };
    }

    // Meeting accepted, awaiting admin
    if (
      virtualMeeting.booked_date &&
      !virtualMeeting.confirmed_by_splitlease
    ) {
      return {
        visible: true,
        state: 'accepted',
        label: 'Virtual Meeting Accepted',
        action: 'view-details',
        bookedDate: virtualMeeting.booked_date
      };
    }

    // Pending response - requester view
    if (
      virtualMeeting.requested_by === currentUserId &&
      !virtualMeeting.booked_date
    ) {
      return {
        visible: true,
        state: 'requested',
        label: 'Virtual Meeting Requested',
        disabled: true
      };
    }

    // Pending response - recipient view
    if (
      virtualMeeting.requested_by !== currentUserId &&
      !virtualMeeting.booked_date
    ) {
      return {
        visible: true,
        state: 'respond',
        label: 'Respond to Virtual Meeting Request',
        action: 'open-respond-modal'
      };
    }

    // Fallback
    return {
      visible: true,
      state: 'default',
      label: 'Request Virtual Meeting'
    };
  };

  return getButtonState();
}

// Usage
function RequestMeetingButton({ proposalId, currentUserId }) {
  const buttonState = useVirtualMeetingButtonState(proposalId, currentUserId);

  if (!buttonState.visible) return null;

  return (
    <button
      className={`btn-request-meeting ${buttonState.state}`}
      style={buttonState.style}
      disabled={buttonState.disabled}
      title={buttonState.tooltip}
      onClick={() => handleButtonClick(buttonState)}
    >
      {buttonState.label}
    </button>
  );
}
```

---

## Testing Scenarios

### Test Case 1: Initial Request
1. User views proposal with no virtual_meetings record
2. Button shows "Request Virtual Meeting" (gray)
3. User clicks → Modal opens
4. User selects preferred dates
5. Record created in virtual_meetings table
6. Button updates to "Virtual Meeting Requested"

### Test Case 2: Respond to Request
1. User B views proposal where User A requested meeting
2. Button shows "Respond to Virtual Meeting Request"
3. User B clicks → Modal opens with User A's requested dates
4. User B accepts and confirms date
5. booked_date is set in database
6. Both users see "Virtual Meeting Accepted"

### Test Case 3: Admin Confirmation
1. Admin views pending meeting (booked_date set, not confirmed)
2. Admin creates Zoom/Meet link
3. Admin sets confirmed_by_splitlease = true, adds meeting_link
4. Both users see "Meeting confirmed"
5. Click button → Opens meeting_link in new tab

### Test Case 4: Decline Flow
1. User B views "Respond to Virtual Meeting Request"
2. User B clicks decline
3. meeting_declined = true in database
4. Button shows "Virtual Meeting Declined" (red, bold)
5. Either user can click to request another meeting
6. Creates new virtual_meetings record or resets existing

### Test Case 5: Visibility Rules
1. Proposal status = "Proposal Rejected by Host"
2. Button remains visible (can still request meeting to discuss)
3. Proposal status = "Proposal Completed"
4. Button hidden (no longer needed)

---

## Database Triggers & Business Logic

### Recommended Trigger: Auto-update timestamp
```sql
CREATE OR REPLACE FUNCTION update_virtual_meetings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_virtual_meetings_timestamp
BEFORE UPDATE ON virtual_meetings
FOR EACH ROW
EXECUTE FUNCTION update_virtual_meetings_updated_at();
```

### Recommended Policy: Row Level Security
```sql
-- Enable RLS
ALTER TABLE virtual_meetings ENABLE ROW LEVEL SECURITY;

-- Users can view meetings for their proposals
CREATE POLICY "Users can view their virtual meetings"
ON virtual_meetings FOR SELECT
USING (
  proposal_id IN (
    SELECT id FROM proposals
    WHERE guest_id = auth.uid()
       OR host_id = auth.uid()
  )
);

-- Users can create meetings for their proposals
CREATE POLICY "Users can create virtual meetings"
ON virtual_meetings FOR INSERT
WITH CHECK (
  proposal_id IN (
    SELECT id FROM proposals
    WHERE guest_id = auth.uid()
       OR host_id = auth.uid()
  )
);

-- Users can update meetings they're involved in
CREATE POLICY "Users can update their virtual meetings"
ON virtual_meetings FOR UPDATE
USING (
  proposal_id IN (
    SELECT id FROM proposals
    WHERE guest_id = auth.uid()
       OR host_id = auth.uid()
  )
);
```

---

## Summary

This configuration maps the "Request Virtual Meeting" button behavior to 6 distinct states based on database conditionals:

1. **Default**: No meeting → "Request Virtual Meeting"
2. **Requested**: Waiting for response → "Virtual Meeting Requested"
3. **Respond**: Action required → "Respond to Virtual Meeting Request"
4. **Accepted**: Scheduled, awaiting admin → "Virtual Meeting Accepted"
5. **Confirmed**: Ready to join → "Meeting confirmed"
6. **Declined**: Can request again → "Virtual Meeting Declined"

All states are driven by the `virtual_meetings` table fields:
- `requested_by` (who initiated)
- `booked_date` (scheduled time)
- `confirmed_by_splitlease` (admin approval)
- `meeting_declined` (rejection flag)
- `meeting_link` (join URL)

The button visibility is controlled by the `proposals.status` field and `proposals.deleted` flag.
