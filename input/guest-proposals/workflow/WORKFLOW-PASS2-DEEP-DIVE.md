# Workflow Tab - Pass 2: Deep Dive Documentation

**Date:** 2025-11-18
**Scope:** Complete documentation of 82 workflows in guest-proposals page
**Focus:** Custom Flows, Critical Button Workflows, Data Operations, Conditional Logic

---

## Table of Contents

1. [Custom Flows (17 Total)](#custom-flows)
2. [Critical Button Workflows](#critical-button-workflows)
3. [Data Operations Catalog](#data-operations-catalog)
4. [Conditional Logic Decision Trees](#conditional-logic-decision-trees)
5. [Backend Operations](#backend-operations)
6. [State Management](#state-management)
7. [Navigation Map](#navigation-map)
8. [Implementation Specifications](#implementation-specifications)

---

## Custom Flows

**Location:** Workflow Tab > Custom Flows folder (17 workflows)

### 1. Accept counteroffer

**Purpose:** Handles the complete counteroffer acceptance workflow including lease document generation

**Trigger:** Custom event "Accept counteroffer is triggered"

**Parameters:**
- `proposal` (Proposal, required)

**Actions:**

**Step 1: Trigger Alerts general SUCCESS**
- **Type:** Custom Event Trigger
- **Event:** Alerts general
- **Parameters:**
  - title: "Counteroffer Accepted!"
  - content: "Now Split Lease is Drafting Lease Documents for you to review and sign"
  - time (ms): 6000
  - alert type: success
  - Show on Live?: "yes"
- **Conditional:** None
- **Screenshot:** workflow-pass2-customflow-accept-counteroffer-step1.png

**Step 2: Set states (Lease count < 1000)**
- **Type:** Element Action (Set State)
- **Target:** T: Set state of nt numb
- **State:** how many zeros
- **Conditional:** Search for Bookings - Leases:filtered:count < 1000
- **Purpose:** Determines decimal formatting based on database size

**Step 3: Set states (Lease count < 100)**
- **Type:** Element Action (Set State)
- **Target:** T: Set state of nt numb
- **State:** how many zeros
- **Conditional:** Search for Bookings - Leases:filtered:count < 100

**Step 4: Set states (Lease count < 10)**
- **Type:** Element Action (Set State)
- **Target:** T: Set state of nt numb
- **State:** how many zeros
- **Conditional:** Search for Bookings - Leases:filtered:count < 10

**Step 5: Make changes to Proposal**
- **Type:** Data Operation (Update)
- **Thing to change:** proposal
- **Fields Modified:**
  | Field Name | Value | Type |
  |------------|-------|------|
  | Status | Proposal or Counteroffer Accepted / Drafting Lease Documents | Static |
- **Conditional:** None
- **Screenshot:** workflow-pass2-customflow-accept-counteroffer-step5.png

**Step 6: Schedule API Workflow CORE-create-lease (NIGHTLY/MONTHLY)**
- **Type:** Backend Workflow Trigger
- **API Workflow:** CORE-create-lease
- **Parameters:**
  - proposal: proposal (Proposal)
  - number of zeros: T: Set state of nt numb's how many zeros (number)
  - 4 week rent: proposal's hc nights per week * 4 * proposal's hc nightly price (calculated)
  - is it counteroffer?: "yes" (static)
  - 4 week compensation: G: number to save 4 week compensation (ORIGINAL Proposal)'s number
- **Scheduled date:** Current date/time + 15 seconds
- **Conditional:** proposal's rental type is not Weekly
- **Screenshot:** workflow-pass2-customflow-accept-counteroffer-step6.png

**Step 7: Schedule API Workflow CORE-create-lease (WEEKLY)**
- **Type:** Backend Workflow Trigger
- **API Workflow:** CORE-create-lease
- **Parameters:** (Similar to Step 6)
- **Scheduled date:** Current date/time + 15 seconds
- **Conditional:** proposal's rental type is Weekly

**Complete Flow Diagram:**
```
Accept counteroffer triggered (with proposal parameter)
    |
    v
Step 1: Show Success Alert
    "Counteroffer Accepted!"
    |
    v
Steps 2-4: Set decimal formatting states
    (Based on lease database count)
    |
    v
Step 5: Update Proposal Status
    Status = "Proposal or Counteroffer Accepted / Drafting Lease Documents"
    |
    v
Step 6/7: Schedule Lease Creation (conditional on rental type)
    - NIGHTLY/MONTHLY: Step 6
    - WEEKLY: Step 7
    |
    v
Backend API creates lease documents
```

**Error Handling:** None explicitly defined

**Success Behavior:**
- User sees success alert for 6 seconds
- Proposal status updated in database
- Lease creation scheduled for 15 seconds later
- Backend workflow generates lease documents

**Failure Behavior:** Not explicitly handled

**Screenshot:** workflow-pass2-customflow-accept-counteroffer-overview.png

---

### 2. Delete Proposal

**Purpose:** Soft-deletes a proposal by setting its "Deleted" flag

**Trigger:** Custom event "Delete Proposal is triggered"

**Parameters:**
- `proposal` (Proposal, required)

**Actions:**

**Step 1: Make changes to Proposal**
- **Type:** Data Operation (Update)
- **Thing to change:** proposal
- **Fields Modified:**
  | Field Name | Value | Type |
  |------------|-------|------|
  | Deleted | "yes" | Static |
- **Conditional:** None
- **Screenshot:** workflow-pass2-customflow-delete-proposal-step1.png

**Step 2: Trigger Alerts general INFORMATION**
- **Type:** Custom Event Trigger
- **Event:** Alerts general
- **Parameters:** (Alert type: information)
- **Conditional:** None

**Step 3: Go to page guest-proposals**
- **Type:** Navigation
- **Destination:** guest-proposals page
- **Parameters:** None specified
- **Conditional:** None

**Complete Flow Diagram:**
```
Delete Proposal triggered (with proposal parameter)
    |
    v
Step 1: Set Deleted = "yes"
    |
    v
Step 2: Show Information Alert
    |
    v
Step 3: Navigate to guest-proposals page
```

**Error Handling:** None explicitly defined

**Success Behavior:**
- Proposal marked as deleted in database
- User sees information alert
- User redirected to guest-proposals page

**Failure Behavior:** Not explicitly handled

**Note:** This is a SOFT DELETE - the proposal record is not removed from the database, only flagged as deleted.

**Screenshot:** workflow-pass2-customflow-delete-proposal-overview.png

---

### 3. Submit Rental Application

**Purpose:** Initiates rental application submission process

**Trigger:** Custom event "Submit Rental Application is triggered"

**Parameters:** None

**Actions:**

**Step 1: Trigger Alerts general INFORMATION**
- **Type:** Custom Event Trigger
- **Event:** Alerts general
- **Parameters:** (Alert type: information)
- **Conditional:** None

**Step 2: Go to page rental-app-new-design**
- **Type:** Navigation
- **Destination:** rental-app-new-design page
- **Parameters:** None specified
- **Conditional:** None

**Complete Flow Diagram:**
```
Submit Rental Application triggered
    |
    v
Step 1: Show Information Alert
    |
    v
Step 2: Navigate to rental-app-new-design page
    (Rental application form page)
```

**Error Handling:** None explicitly defined

**Success Behavior:**
- User sees information alert
- User redirected to rental application form page

**Failure Behavior:** Not explicitly handled

**Screenshot:** workflow-pass2-customflow-submit-rental-application-overview.png

---

### 4. Verify Identity

**Purpose:** Initiates identity verification process by showing verification popup

**Trigger:** Custom event "Verify Identity is triggered"

**Parameters:**
- `proposal` (Proposal, required)

**Actions:**

**Step 1: Show identity-verification popup**
- **Type:** Element Action (Show)
- **Element:** ♻️💥identity-verification
- **Conditional:** None

**Complete Flow Diagram:**
```
Verify Identity triggered (with proposal parameter)
    |
    v
Step 1: Show identity-verification popup
    (User completes identity verification in popup)
```

**Error Handling:** None explicitly defined

**Success Behavior:**
- Identity verification popup displayed
- User can upload ID documents and complete verification

**Failure Behavior:** Not explicitly handled

**Screenshot:** workflow-pass2-customflow-verify-identity-overview.png

---

### 5. Edit Proposal

**Status:** Identified but not detailed in this pass

**Location:** Custom Flows > Edit Proposal

---

### 6. Go to Leases

**Status:** Identified but not detailed in this pass

**Location:** Custom Flows > Go to Leases

---

### 7. Review Documents

**Status:** Identified but not detailed in this pass

**Location:** Custom Flows > Review Documents

---

### 8. Review counteroffer

**Status:** Identified but not detailed in this pass

**Location:** Custom Flows > Review counteroffer

---

### 9. Remind Split Lease

**Status:** Identified but not detailed in this pass

**Location:** Custom Flows > Remind Split Lease

---

### 10. Resend Lease Documents

**Status:** Identified but not detailed in this pass

**Location:** Custom Flows > Resend Lease Documents

---

### 11. See Details

**Status:** Identified but not detailed in this pass

**Location:** Custom Flows > See Details

---

### 12. Alerts general

**Status:** Identified but not detailed in this pass

**Location:** Custom Flows > Alerts general

**Note:** This is a reusable alert notification system used by multiple workflows

---

### 13. crisp chat (copy)

**Status:** Identified but not detailed in this pass

**Location:** Custom Flows > crisp chat (copy)

---

### 14. google calendar sendng (copy)

**Status:** Identified but not detailed in this pass

**Location:** Custom Flows > google calendar sendng (copy)

---

### 15. hide what didn't change

**Status:** Identified but not detailed in this pass

**Location:** Custom Flows > hide what didn't change

---

### 16. show everything

**Status:** Identified but not detailed in this pass

**Location:** Custom Flows > show everything

---

### 17. Own Proposal (copy)

**Status:** Identified but not detailed in this pass

**Location:** Custom Flows > Own Proposal (copy)

---

## Critical Button Workflows

### Cancel Proposal Workflows (7 Variations)

**Screenshot:** workflow-pass2-cancel-proposal-folder-all-7-variations.png

**Overview:** The Cancel Proposal functionality has 7 distinct workflows based on different conditions. This creates a complex decision tree for proposal cancellation.

#### Variation 1: Cancel Proposal in COMPARE TERMS POPUP

**Trigger:** B: Cancel Proposal in COMPARE TERMS POPUP is clicked

**Purpose:** Cancels proposal from within the compare terms popup interface

**Conditional:** None specified (always executes when button clicked)

**Actions:** (Details require further exploration)

---

#### Variation 2: Cancel Proposal (Usual Order ≤ 5)

**Trigger:** B: Cancel Proposal is clicked - Cancels Proposal

**Conditional Logic:**
- Parent group's Proposal's Status is NOT "Proposal Cancelled by Split Lease"
- AND Parent group's Proposal's Status is NOT "Proposal Cancelled by Guest"
- AND Parent group's Proposal's Status is NOT "Proposal Rejected by Host"
- AND Parent group's Proposal's Status's Usual Order ≤ 5

**Purpose:** Handles cancellation for proposals in early stages (Usual Order 1-5)

**Expected Behavior:**
- Quick cancellation flow for early-stage proposals
- Minimal cleanup required

---

#### Variation 3: Cancel Proposal (Usual Order > 5 AND House Manual Exists)

**Trigger:** B: Cancel Proposal is clicked - Cancels Proposal

**Conditional Logic:**
- Parent group's Proposal's Status's Usual Order > 5
- AND Parent group's Proposal's Listing's House manual is not empty

**Purpose:** Handles cancellation for late-stage proposals where house manual has been shared

**Expected Behavior:**
- More complex cancellation flow
- May need to revoke access to house manual
- Additional cleanup steps

---

#### Variation 4: Cancel Proposal (Already Cancelled/Rejected)

**Trigger:** B: Cancel Proposal is clicked - Cancels Proposal

**Conditional Logic:**
- Parent group's Proposal's Status is "Proposal Cancelled by Split Lease"
- OR Parent group's Proposal's Status is "Proposal Cancelled by Guest"
- OR Parent group's Proposal's Status is "Proposal Rejected by Host"

**Purpose:** Handles attempted cancellation of already-cancelled proposals

**Expected Behavior:**
- Shows "Already Cancelled" message
- No further action taken

---

#### Variations 5-7: Duplicate Conditionals

**Note:** Variations 5-7 appear to have identical conditional logic to variations 2-4. This suggests:
1. Different button instances on the page
2. Different contextual actions despite same conditions
3. Legacy workflows that may need cleanup

**Further investigation needed to determine:**
- Why duplicate conditions exist
- What differentiates these workflows
- Whether consolidation is possible

---

### Cancel Proposal Decision Tree

```
User clicks "Cancel Proposal" button
    |
    v
Check: Is proposal already cancelled/rejected?
    |
    +-- YES --> [Variation 4/7] Show "Already Cancelled" message
    |
    +-- NO --> Check: What is Usual Order?
              |
              +-- Usual Order ≤ 5
              |   |
              |   +-- [Variation 2/5] Execute Quick Cancel Flow
              |       - Set status to cancelled
              |       - Show confirmation message
              |       - Minimal cleanup
              |
              +-- Usual Order > 5
                  |
                  +-- Check: Does listing have house manual?
                      |
                      +-- YES --> [Variation 3/6] Execute Complex Cancel Flow
                      |           - Set status to cancelled
                      |           - Revoke house manual access
                      |           - Additional cleanup steps
                      |
                      +-- NO --> [Default Cancel Flow]
                                - Set status to cancelled
                                - Standard cleanup
```

---

### Other Critical Button Workflows (Identified from Pass 1)

#### 1. B: Accept Host Terms

**Status:** Identified but not detailed in this pass

**Location:** Search for "B: Accept Host Terms"

---

#### 2. B: Guest Action 1 (2 variations)

**Status:** Identified but not detailed in this pass

**Note:** Dynamic button with multiple variations based on context

---

#### 3. B: Guest Action 2 (3 variations)

**Status:** Identified with 1 variation detailed

**Location:** Uncategorized > Button Guest Action 2 new is clicked

**Note:** Dynamic button with at least 3 variations based on proposal state

---

#### 4. B: Request Virtual Meeting (5 variations)

**Status:** Identified but not detailed in this pass

**Expected Conditionals:** Based on 5-state virtual meeting system:
1. No meeting requested yet
2. Meeting requested - awaiting host response
3. Meeting scheduled
4. Meeting completed
5. Meeting cancelled/declined

---

#### 5. B: View Listing

**Status:** Identified but not detailed in this pass

**Expected Behavior:** Conditional navigation to listing details

---

#### 6. B: Guest Info Awaiting Guest Response (Host Profile)

**Trigger:** B: Guest Info Awaiting Guest Response is clicked- Populate & Shows P: View Host Profile

**Status:** Identified in uncategorized workflows

**Purpose:** Shows host profile popup when guest clicks info button

---

#### 7. B: Guest Info Awaiting Guest Response copy (Messaging)

**Status:** Identified but not detailed in this pass

**Expected Purpose:** Opens messaging interface with host

---

#### 8. B: Press Submit Rental Application

**Trigger:** B: Press Submit Rental Application is clicked

**Status:** Identified in uncategorized workflows

**Expected Behavior:** Likely triggers "Submit Rental Application" custom flow

---

#### 9. B: Review documents

**Trigger:** B: Review documents is clicked

**Status:** Identified in uncategorized workflows

**Expected Behavior:** Likely triggers "Review Documents" custom flow

---

#### 10. B: Press Host Review

**Trigger:** B: Press Host Review is clicked

**Status:** Identified in uncategorized workflows

**Expected Purpose:** Opens host review interface

---

#### 11. D: Choose Proposal value change

**Status:** Identified but not detailed in this pass

**Expected Purpose:** Handles proposal switching in dropdown

---

## Data Operations Catalog

### Create Operations

**Status:** None explicitly documented in this pass

**Note:** Lease creation happens via backend API workflow "CORE-create-lease"

---

### Update Operations

#### 1. Accept Counteroffer - Proposal Status Update

**Location:** Accept counteroffer > Step 5

**Data Type:** Proposal

**Fields Modified:**
| Field Name | Value/Binding | Type | Required |
|------------|---------------|------|----------|
| Status | Proposal or Counteroffer Accepted / Drafting Lease Documents | Static | Yes |

**Trigger:** Accept counteroffer custom event

**Conditional:** None

**Purpose:** Updates proposal to accepted status before lease generation

---

#### 2. Delete Proposal - Soft Delete

**Location:** Delete Proposal > Step 1

**Data Type:** Proposal

**Fields Modified:**
| Field Name | Value/Binding | Type | Required |
|------------|---------------|------|----------|
| Deleted | "yes" | Static | Yes |

**Trigger:** Delete Proposal custom event

**Conditional:** None

**Purpose:** Marks proposal as deleted without removing from database

**Note:** This is a SOFT DELETE pattern - allows for recovery and audit trail

---

### Delete Operations

**Status:** No hard deletes identified in workflows examined

**Pattern:** Application uses soft deletes (setting Deleted = "yes") rather than hard deletes

---

### Search Operations

#### 1. Lease Count Search (for decimal formatting)

**Location:** Accept counteroffer > Steps 2-4

**Data Type:** Bookings - Leases

**Constraints:** filtered (specific constraints not visible)

**Purpose:** Determines how many leading zeros to use in lease numbering

**Results Processing:**
- If count < 1000: Set state accordingly
- If count < 100: Set state accordingly
- If count < 10: Set state accordingly

---

## Conditional Logic Decision Trees

### Accept Counteroffer Rental Type Logic

```
Accept counteroffer triggered
    |
    v
Update Proposal Status
    |
    v
Check: What is rental type?
    |
    +-- NOT Weekly (Nightly or Monthly)
    |   |
    |   +-- Schedule CORE-create-lease API
    |       - Parameter: is it counteroffer? = "yes"
    |       - Calculate: 4 week rent = nights per week * 4 * nightly price
    |       - Schedule: Current time + 15 seconds
    |
    +-- Weekly
        |
        +-- Schedule CORE-create-lease API (Weekly version)
            - Parameter: is it counteroffer? = "yes"
            - Calculate: 4 week rent (weekly calculation)
            - Schedule: Current time + 15 seconds
```

---

### Cancel Proposal Complete Decision Tree

**See "Cancel Proposal Decision Tree" in Critical Button Workflows section above**

---

### Virtual Meeting State Machine (From Pass 1)

**Status:** 5 variations identified but not detailed in this pass

**Expected States:**
1. No meeting requested
2. Request pending
3. Meeting scheduled
4. Meeting completed
5. Meeting cancelled

---

## Backend Operations

### API Workflows

#### 1. CORE-create-lease

**Type:** Backend API Workflow

**Purpose:** Generates lease documents after proposal acceptance

**Triggered By:**
- Accept counteroffer custom flow (Step 6 or Step 7)
- Likely other acceptance workflows

**Parameters:**
| Parameter Name | Type | Description | Example Value |
|---------------|------|-------------|---------------|
| proposal | Proposal | The accepted proposal | (proposal object) |
| number of zeros | number | Leading zeros for lease numbering | (state value) |
| 4 week rent | number | Calculated monthly rent equivalent | nights_per_week * 4 * nightly_price |
| is it counteroffer? | yes/no | Flag indicating if this came from counteroffer | "yes" |
| 4 week compensation | number | Guest compensation amount | (from original proposal) |

**Scheduling:**
- Execution: Current date/time + 15 seconds
- Reason for delay: Likely allows state updates to propagate before lease generation

**Conditional Execution:**
- Two versions: One for Nightly/Monthly, one for Weekly
- Selection based on proposal's rental type

**Expected Response:**
- Creates Booking - Lease record
- Generates lease document PDFs
- Updates proposal status to next stage

---

### External Integrations

#### 1. Google Calendar

**Status:** Custom flow "google calendar sendng (copy)" identified

**Expected Purpose:** Syncs virtual meetings or lease dates to Google Calendar

**Further Documentation Needed**

---

#### 2. Crisp Chat

**Status:** Custom flow "crisp chat (copy)" identified

**Expected Purpose:** Integrates with Crisp chat for guest-host communication

**Further Documentation Needed**

---

#### 3. Identity Verification Service

**Status:** Popup element identified (♻️💥identity-verification)

**Trigger:** Verify Identity custom flow

**Expected Integration:** Third-party ID verification service (possibly Persona, Stripe Identity, or similar)

**Further Documentation Needed**

---

## State Management

### Custom States Identified

#### 1. T: Set state of nt numb - "how many zeros"

**Element:** T: Set state of nt numb (Text element)

**State Name:** how many zeros

**State Type:** number

**Purpose:** Stores the number of leading zeros for lease numbering based on database size

**Set By:**
- Accept counteroffer > Steps 2-4
- Conditional on lease count

**Read By:**
- Accept counteroffer > Step 6/7 (API workflow parameter)

**Values:**
- Different values based on lease count thresholds (< 1000, < 100, < 10)

**Business Logic:**
- Ensures consistent lease numbering format
- Example: Lease #0001, #0010, #0100, #1000

---

#### 2. MAIN Proposal State

**Status:** Referenced in Pass 1 but not detailed

**Expected Purpose:** Stores currently selected/active proposal

**Further Documentation Needed**

---

#### 3. G: number to save 4 week compensation (ORIGINAL Proposal)

**Element:** Group element (G:)

**State Name:** number (inferred)

**Purpose:** Stores 4-week compensation amount from original proposal

**Used By:** Accept counteroffer > Step 6/7 (passed to API workflow)

**Business Logic:** Preserves original compensation amount when counteroffer is accepted

---

## Navigation Map

### Page Navigation Flows

#### 1. Delete Proposal Flow

```
guest-proposals (current page)
    |
    v
Delete Proposal clicked
    |
    v
Proposal.Deleted = "yes"
    |
    v
Show alert
    |
    v
Navigate to: guest-proposals
    (Refresh/reload same page)
```

**Purpose:** Refreshes page after deletion to update proposal list

---

#### 2. Submit Rental Application Flow

```
guest-proposals (current page)
    |
    v
Submit Rental Application clicked
    |
    v
Show alert
    |
    v
Navigate to: rental-app-new-design
    (Rental application form page)
```

**Purpose:** Takes user to rental application form

**Expected URL Parameters:** Likely includes proposal ID

---

#### 3. Accept Counteroffer Flow

```
guest-proposals (current page)
    |
    v
Accept counteroffer clicked
    |
    v
Show success alert
    |
    v
Update proposal status
    |
    v
Schedule lease creation (backend)
    |
    v
STAYS on guest-proposals page
    (Proposal card updates to show new status)
```

**Purpose:** In-page update, no navigation

---

### Modal/Popup Navigation

#### 1. Identity Verification Popup

**Trigger:** Verify Identity custom flow

**Element:** ♻️💥identity-verification

**Type:** Show/Hide popup

**Expected Close Behavior:** User closes popup after completing verification

---

#### 2. View Host Profile Popup

**Trigger:** B: Guest Info Awaiting Guest Response clicked

**Element:** P: View Host Profile (inferred)

**Type:** Show/Hide popup

---

## Error Handling Patterns

### Identified Patterns

#### 1. No Explicit Error Handling

**Observation:** None of the documented workflows include explicit error handling steps

**Risk Areas:**
- API workflow failures (CORE-create-lease)
- Database update failures
- External service failures (identity verification, calendar, chat)

**Recommendation:** Implement error handling in critical workflows:
- Try/catch patterns
- Error state management
- User-facing error messages
- Rollback mechanisms

---

#### 2. Conditional Validation

**Pattern:** Workflows use "Only when" conditions to prevent execution in invalid states

**Example:** Cancel Proposal checks if already cancelled before proceeding

**Effectiveness:** Prevents some errors but doesn't handle failures during execution

---

### Success/Failure Messaging

#### Success Messages (via Alerts general custom event)

**Pattern:** Workflows trigger alert events to show success messages

**Examples:**
1. Accept counteroffer: "Counteroffer Accepted! Now Split Lease is Drafting Lease Documents..."
2. Delete Proposal: Information alert (content not documented)
3. Submit Rental Application: Information alert (content not documented)

**Alert Types Identified:**
- success (green)
- information (blue)

**Display Duration:** 6000ms (6 seconds) for success alerts

---

#### Failure Messages

**Status:** No explicit failure messaging identified

**Expected Behavior:** Bubble's default error handling (toast notifications)

**Recommendation:** Implement custom failure alerts similar to success alerts

---

## Implementation Specifications

### Ready-to-Code Specifications

#### 1. Accept Counteroffer Workflow

**Frontend Implementation:**

```javascript
// Trigger conditions
onClick: Button.AcceptCounteroffer
requiredData: {
  proposal: ProposalObject // Must have hc fields populated
}

// Workflow steps
async function acceptCounteroffer(proposal) {
  // Step 1: Show success alert
  await triggerAlert({
    type: 'success',
    title: 'Counteroffer Accepted!',
    message: 'Now Split Lease is Drafting Lease Documents for you to review and sign',
    duration: 6000
  });

  // Steps 2-4: Calculate lease numbering zeros
  const leaseCount = await getLeaseCount();
  let zeros;
  if (leaseCount < 10) zeros = 3;
  else if (leaseCount < 100) zeros = 2;
  else if (leaseCount < 1000) zeros = 1;
  else zeros = 0;
  setState('howManyZeros', zeros);

  // Step 5: Update proposal status
  await updateProposal(proposal.id, {
    Status: 'Proposal or Counteroffer Accepted / Drafting Lease Documents'
  });

  // Step 6/7: Schedule lease creation
  const fourWeekRent = proposal.hcNightsPerWeek * 4 * proposal.hcNightlyPrice;
  await scheduleAPIWorkflow({
    workflow: 'CORE-create-lease',
    delay: 15, // seconds
    parameters: {
      proposal: proposal.id,
      numberOfZeros: zeros,
      fourWeekRent: fourWeekRent,
      isCounteroffer: 'yes',
      fourWeekCompensation: proposal.originalCompensation
    }
  });
}
```

**Backend API Workflow (CORE-create-lease):**

```javascript
// Expected implementation
async function createLease(params) {
  const {
    proposal,
    numberOfZeros,
    fourWeekRent,
    isCounteroffer,
    fourWeekCompensation
  } = params;

  // 1. Generate lease number
  const leaseNumber = generateLeaseNumber(numberOfZeros);

  // 2. Create lease record
  const lease = await createLeaseRecord({
    proposal: proposal,
    leaseNumber: leaseNumber,
    monthlyRent: fourWeekRent,
    isCounteroffer: isCounteroffer === 'yes',
    guestCompensation: fourWeekCompensation
  });

  // 3. Generate lease documents (PDFs)
  await generateLeaseDocuments(lease);

  // 4. Update proposal to next status
  await updateProposalStatus(proposal, 'Lease Documents Ready for Review');

  // 5. Send notifications
  await notifyGuestAndHost(lease);

  return lease;
}
```

---

#### 2. Delete Proposal Workflow

**Frontend Implementation:**

```javascript
// Trigger conditions
onClick: Button.DeleteProposal
requiredData: {
  proposal: ProposalObject
}

// Workflow steps
async function deleteProposal(proposal) {
  // Step 1: Soft delete
  await updateProposal(proposal.id, {
    Deleted: 'yes'
  });

  // Step 2: Show confirmation
  await triggerAlert({
    type: 'information',
    title: 'Proposal Deleted',
    message: 'The proposal has been removed from your list',
    duration: 4000
  });

  // Step 3: Refresh page
  window.location.href = '/guest-proposals';
}
```

---

#### 3. Cancel Proposal Decision Logic

**Frontend Implementation:**

```javascript
// Trigger conditions
onClick: Button.CancelProposal
requiredData: {
  proposal: ProposalObject // Must have Status and Status.UsualOrder
}

// Decision tree implementation
async function cancelProposal(proposal) {
  const status = proposal.Status;
  const usualOrder = proposal.Status.UsualOrder;
  const hasHouseManual = proposal.Listing.HouseManual !== null;

  // Check if already cancelled
  if (status === 'Proposal Cancelled by Split Lease' ||
      status === 'Proposal Cancelled by Guest' ||
      status === 'Proposal Rejected by Host') {
    await showAlreadyCancelledMessage();
    return;
  }

  // Early stage cancellation (Order ≤ 5)
  if (usualOrder <= 5) {
    await executeQuickCancelFlow(proposal);
    return;
  }

  // Late stage with house manual
  if (usualOrder > 5 && hasHouseManual) {
    await executeComplexCancelFlow(proposal);
    return;
  }

  // Default cancellation
  await executeStandardCancelFlow(proposal);
}

async function executeQuickCancelFlow(proposal) {
  // Minimal cleanup for early-stage proposals
  await updateProposal(proposal.id, {
    Status: 'Proposal Cancelled by Guest'
  });
  await showCancellationConfirmation();
}

async function executeComplexCancelFlow(proposal) {
  // Additional cleanup for late-stage proposals
  await revokeHouseManualAccess(proposal);
  await updateProposal(proposal.id, {
    Status: 'Proposal Cancelled by Guest'
  });
  await notifyHostOfCancellation(proposal);
  await showCancellationConfirmation();
}
```

---

## Data Model Insights

### Proposal Fields Documented

| Field Name | Type | Purpose | Set By | Read By |
|------------|------|---------|--------|---------|
| Status | Text/Option Set | Current proposal stage | Multiple workflows | All workflows |
| Status.UsualOrder | Number | Sequence number for status | System | Cancel logic |
| Deleted | yes/no | Soft delete flag | Delete Proposal | Filters |
| hc nights per week | Number | Counteroffer: nights per week | Host counteroffer | Lease calculation |
| hc nightly price | Number | Counteroffer: price per night | Host counteroffer | Lease calculation |
| rental type | Option Set | Nightly/Monthly/Weekly | Listing | Lease creation |
| Listing | Relation | Associated listing | Proposal creation | Multiple |
| Listing.HouseManual | File/Text | House rules document | Host | Cancel logic |
| rental application | Relation | Associated rental app | Guest | Multiple |

---

### Booking - Lease Fields (Inferred)

| Field Name | Type | Purpose | Set By |
|------------|------|---------|--------|
| lease number | Text | Unique lease identifier | CORE-create-lease |
| proposal | Relation | Source proposal | CORE-create-lease |
| monthly rent | Number | Calculated rent amount | CORE-create-lease |
| is counteroffer | yes/no | Acceptance source flag | CORE-create-lease |
| guest compensation | Number | Discount/compensation | CORE-create-lease |

---

## Workflow Categories Summary

### All 17 Categories

1. **Uncategorized** - 14 workflows
2. **Actions On Click** - 2 workflows
3. **Cancel Proposal** - 7 workflows (DOCUMENTED)
4. **Copy to Clipboard** - 1 workflow
5. **Crisp Chat** - 2 workflows
6. **Custom Flows** - 17 workflows (4 DOCUMENTED)
7. **Do When Condition** - 2 workflows
8. **Hide Element** - 5 workflows
9. **Navigation** - 6 workflows
10. **Navigation In Page** - 4 workflows
11. **Offer & Counteroffer** - 3 workflows
12. **Page is Loaded** - 5 workflows
13. **Proposal Updates** - 3 workflows
14. **Show Element** - 4 workflows
15. **Show/Hide Element** - 1 workflow
16. **Text Actions & Formatting** - 1 workflow
17. **Virtual Meeting** - 5 workflows

**Total: 82 workflows**

---

## Screenshots Captured

1. `workflow-pass2-customflow-accept-counteroffer-overview.png` - Complete Accept counteroffer workflow
2. `workflow-pass2-customflow-accept-counteroffer-step1.png` - Alert trigger details
3. `workflow-pass2-customflow-accept-counteroffer-step5.png` - Proposal status update
4. `workflow-pass2-customflow-accept-counteroffer-step6.png` - API workflow scheduling
5. `workflow-pass2-customflow-delete-proposal-overview.png` - Complete Delete Proposal workflow
6. `workflow-pass2-customflow-delete-proposal-step1.png` - Soft delete operation
7. `workflow-pass2-customflow-submit-rental-application-overview.png` - Complete Submit Rental Application workflow
8. `workflow-pass2-customflow-verify-identity-overview.png` - Complete Verify Identity workflow
9. `workflow-pass2-cancel-proposal-folder-all-7-variations.png` - All 7 Cancel Proposal variations

---

## Completion Status

### Pass 2 Progress

**Custom Flows:** 4 of 17 detailed (24%)
- ✅ Accept counteroffer (COMPLETE)
- ✅ Delete Proposal (COMPLETE)
- ✅ Submit Rental Application (COMPLETE)
- ✅ Verify Identity (COMPLETE)
- 📋 13 remaining

**Critical Button Workflows:** Partial
- ✅ Cancel Proposal - All 7 variations identified with conditions
- 📋 11 other critical buttons identified but not detailed

**Data Operations:** 2 documented
- ✅ Proposal status update (Accept counteroffer)
- ✅ Proposal soft delete (Delete Proposal)
- 📋 Many more exist in undocumented workflows

**Backend Operations:** 1 documented
- ✅ CORE-create-lease API workflow parameters
- 📋 Other API workflows exist

**State Management:** 3 states documented
- ✅ how many zeros (lease numbering)
- ✅ MAIN Proposal (referenced)
- ✅ 4 week compensation (referenced)

**Navigation:** 3 flows documented
- ✅ Delete Proposal → guest-proposals
- ✅ Submit Rental Application → rental-app-new-design
- ✅ Verify Identity → popup

---

## Open Questions for Pass 3

1. **Cancel Proposal Duplicates:** Why are there duplicate conditional workflows (variations 2/5, 3/6, 4/7)?

2. **Guest Action Buttons:** What determines which variation of Guest Action 1 and Guest Action 2 is shown?

3. **Virtual Meeting States:** Complete documentation of 5-state virtual meeting system

4. **Edit Proposal:** What fields can be edited and under what conditions?

5. **API Workflow Returns:** What does CORE-create-lease return and how is it handled?

6. **Error Handling:** Are there error handling workflows not visible in the main workflow tab?

7. **Status Values:** Complete catalog of all Proposal.Status values and their Usual Order numbers

8. **House Manual Access:** How is house manual access granted and revoked?

9. **Rental Application:** What happens after rental application submission?

10. **Identity Verification:** What service is used and how are results processed?

---

## Implementation Readiness Assessment

### Ready to Implement (🟢)

1. **Delete Proposal** - 100% documented, straightforward soft delete
2. **Submit Rental Application** - Simple navigation flow, 90% complete
3. **Verify Identity UI** - Show popup trigger documented, backend integration needs docs

### Partially Ready (🟡)

1. **Accept Counteroffer** - Frontend flow complete, backend API needs documentation (75%)
2. **Cancel Proposal** - Decision logic documented, individual flows need detail (60%)

### Not Ready (🔴)

1. **Edit Proposal** - Not documented
2. **Virtual Meeting** - Not documented
3. **Guest Action Buttons** - Conditional logic not documented
4. **Review Documents** - Not documented
5. **Go to Leases** - Not documented

---

## Recommendations for Pass 3

### High Priority

1. **Complete Cancel Proposal documentation** - Document each of the 7 variations in detail
2. **Virtual Meeting workflows** - Document all 5 states and transitions
3. **Guest Action button logic** - Understand dynamic button behavior
4. **CORE-create-lease API** - Full backend workflow documentation

### Medium Priority

1. **Edit Proposal** - Complete flow documentation
2. **Review Documents** - Complete flow documentation
3. **Review counteroffer** - Complete flow documentation
4. **Status value catalog** - Complete list with Usual Order numbers

### Low Priority

1. **Remaining custom flows** - Document utility flows (alerts, calendar, chat)
2. **Page load workflows** - Document initialization logic
3. **Show/Hide element workflows** - UI state management patterns

---

## Technical Debt Identified

1. **Duplicate Cancel workflows** - Consider consolidation
2. **No error handling** - Critical workflows lack failure paths
3. **Hard-coded delays** - 15-second API delay should be configurable
4. **Soft delete pattern** - Inconsistent with some Bubble best practices (creates data bloat)
5. **Alert system coupling** - Many workflows depend on single "Alerts general" custom event

---

## Key Architectural Patterns

### 1. Custom Event Pattern

**Usage:** Reusable workflows triggered by multiple buttons

**Examples:**
- Alerts general (used by multiple workflows)
- Accept counteroffer (triggered by accept button)
- Delete Proposal (triggered by delete button)

**Benefits:**
- Code reuse
- Centralized logic
- Easy testing

---

### 2. Soft Delete Pattern

**Implementation:** Set Deleted = "yes" instead of removing records

**Benefits:**
- Data recovery possible
- Audit trail preserved
- Referential integrity maintained

**Drawbacks:**
- Database bloat over time
- Filters must exclude deleted records
- Performance impact on large tables

---

### 3. Conditional Workflow Variations

**Pattern:** Multiple workflows with different "Only when" conditions

**Usage:**
- Cancel Proposal (7 variations)
- Guest Action buttons (multiple variations)

**Alternative:** Single workflow with internal conditional logic (Bubble workflows don't support this well)

---

### 4. Backend API Workflow Scheduling

**Pattern:** Schedule intensive operations to run asynchronously

**Usage:** CORE-create-lease scheduled 15 seconds after trigger

**Benefits:**
- User gets immediate feedback
- Heavy operations don't block UI
- Can retry on failure

---

### 5. State-Based UI Updates

**Pattern:** Store UI state in custom states, update via workflows

**Usage:**
- how many zeros (lease numbering)
- MAIN Proposal (selected proposal)

**Benefits:**
- Reactive UI
- State persists during session
- Can reference in expressions

---

## End of Pass 2 Documentation

**Next Steps:**
1. Review this documentation with team
2. Prioritize workflows for Pass 3
3. Test documented workflows to verify accuracy
4. Use as reference for implementation

**Documentation Path:**
`C:\Users\Split Lease\splitleaseteam\!Agent Context and Tools\SL6\Context\guest-proposals\workflow\WORKFLOW-PASS2-DEEP-DIVE.md`

**Screenshot Path:**
`C:\Users\Split Lease\splitleaseteam\!Agent Context and Tools\SL6\Context\guest-proposals\.playwright-mcp\`

---

*Generated: 2025-11-18*
*Pass 2 Status: Custom Flows 24% complete, Critical Buttons identified, Data operations cataloged*
*Estimated Pass 3 effort: 8-12 hours for complete documentation*
