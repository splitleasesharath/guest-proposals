# Design Pass 1 - Context Assimilation

**Date:** 2025-11-18
**Purpose:** Synthesize learnings from Design Pass 1 exploration and prepare for Pass 2

---

## Key Architectural Insights

### 1. Dual Proposal System (Original vs Host-Changed)

The most significant discovery is the **two-version proposal architecture**:

**Original Proposal (Guest Submitted):**
- Fields accessed via: `Parent group's Proposal's [field]`
- Examples: `check in day`, `Reservation Span (Weeks)`, `Total Price for Reservation (guest)`

**Host-Changed Proposal (Counter-Offer):**
- Fields accessed via: `Parent group's Proposal's hc [field]`
- Examples: `hc move in date`, `hc reservation span (weeks)`, `hc total price`

**Why This Matters:**
- Powers the negotiation workflow
- Enables side-by-side comparison in "*P: Compare Terms" popup
- Guest can see exactly what the host changed
- Complete transparency in pricing, schedule, and terms modifications

**Implementation Consideration:**
When rebuilding, we need a Proposal schema with:
```typescript
interface Proposal {
  // Original terms
  original: {
    moveInDate: Date;
    reservationSpan: number;
    schedule: DayOfWeek[];
    pricing: PricingBreakdown;
    houseRules: string[];
  };
  // Host counter-offer (optional)
  hostChanged?: {
    moveInDate: Date;
    reservationSpan: number;
    schedule: DayOfWeek[];
    pricing: PricingBreakdown;
    houseRules: string[];
  };
  negotiationHistory: NegotiationEvent[];
}
```

---

### 2. Dual Loading Mechanism

Proposals can be loaded in **two independent ways**:

**Method 1: Dropdown Selection**
- User selects from "My Proposals" dropdown
- Triggers when: `D: Choose Proposal's value` changes
- Interactive browsing experience

**Method 2: Direct URL Parameter**
- Proposal ID passed in URL
- Conditional: When `Get proposal from page URL is not empty`
- Then: Data source = `Get proposal from page URL`
- Enables shareable links, direct navigation, email links

**Implementation Consideration:**
```typescript
// Next.js implementation
function GuestProposalsPage() {
  const router = useRouter();
  const { proposalId } = router.query; // URL param
  const [selectedId, setSelectedId] = useState<string>();

  // Load from URL if available, otherwise use dropdown selection
  const activeProposalId = proposalId || selectedId;

  const { data: proposal } = useQuery(['proposal', activeProposalId],
    () => fetchProposal(activeProposalId)
  );
}
```

---

### 3. Visibility Orchestration Strategy

Different UI states are managed through **conditional visibility on entire groups**:

**State 1: No Proposals**
- Group: "G: View for no proposals"
- Condition: `Current User's Proposals List:filtered:count is 0`
- Shows: Empty state with "Explore Rentals" CTA

**State 2: Has Proposals**
- Group: "G: Current Proposal"
- Condition: `D: Choose Proposal's value is empty` (initial load)
- OR: `Get proposal from page URL is not empty` (URL load)
- Shows: Full proposal details

**Observation:**
Conflicting conditionals found on "G: View for no proposals":
- Condition 1: count is 0 → visible
- Condition 2: count > 0 → visible
- **Likely a bug or one condition controls different property**

---

### 4. Overlay/Modal System

**13 Overlay Elements Identified:**

**Fully Explored (1):**
1. "*P: Compare Terms" - Negotiation comparison popup

**Partially Explored (2):**
2. "RE: Header" - Floating header (always visible)
3. "GF: proposal summary" - Purple focus group (#4D008C)

**Not Yet Explored (10):**
4. ♻️💥guest-editing-proposal A
5. ♻️💥respond-request-cancel-vm
6. ♻️💥identity-verification
7. P: Maps
8. RE: Sign up & Login A
9. *P: View Host Profile
10. ⚛️ Informational text
11. FG: config guest-dashboard
12. P: Confirm proposal modified
13. ♻️💥interest-suggested-proposal

**Priority for Pass 2:**
- View Host Profile (user-facing, important)
- Maps popup (geolocation visualization)
- Guest editing proposal (core workflow)
- Identity verification (security/trust)

---

### 5. Naming Convention Taxonomy

**Bubble Prefixes Decoded:**

| Prefix | Type | Purpose | Example |
|--------|------|---------|---------|
| `*P:` | Popup | Modal dialogs | *P: Compare Terms |
| `RE:` | Reusable Element | Global components | RE: Header |
| `G:` | Group | Container element | G: Current Proposal |
| `GF:` | Group Focus | Focus state overlay | GF: proposal summary |
| `FG:` | Floating Group | Sticky/floating UI | FG: config guest-dashboard |
| `♻️💥` | Reusable Workflow | Workflow components | ♻️💥guest-editing-proposal A |
| `⚛️` | Atomic Component | Small reusables | ⚛️ Informational text |
| `ZEP-` | Deprecated | Old versions | ZEP-G: Virtual Meetings MAIN |
| `D:` | Dropdown | Select inputs | D: Choose Proposal |
| `T:` | Text/Template | Reference elements | T: Proposal Rejected |

**Implementation Consideration:**
In code rebuild, establish clear component naming:
```
ProposalCompareModal (replaces *P: Compare Terms)
GlobalHeader (replaces RE: Header)
ProposalCardGroup (replaces G: Current Proposal)
```

---

### 6. Data Context Hierarchy

**Bubble Data Binding Patterns:**

**Parent Group Context:**
```
Parent group's Proposal's [field]
Parent group's Proposal's hc [field]
Parent group's ZAT-Features - HouseRule's Name
Parent group's Days's Single Letter
```

**Current User Context:**
```
Current User's Proposals List:filtered:count
Current User's unique id
```

**Repeating Group Cell Context:**
```
Current cell's date
Current cell's ZAT-Features - HouseRule's Name
Current cell's date:formatted as 18
```

**Special Functions:**
```
Get proposal from page URL
D: Choose Proposal's value
```

**Implementation Consideration:**
React Context API or Zustand store:
```typescript
// Context hierarchy
<UserContext.Provider value={currentUser}>
  <ProposalListContext.Provider value={proposals}>
    <ProposalContext.Provider value={selectedProposal}>
      <ProposalCard />
    </ProposalContext.Provider>
  </ProposalListContext.Provider>
</UserContext.Provider>
```

---

### 7. Virtual Meeting Evolution

**Two Implementations Found:**

**Current: "G: Virtual Meetings"**
- Simple card-based display
- Host photo, name, listing
- Meeting date/time (EST)
- "Respond to Virtual Meeting" button

**Deprecated: "ZEP-G: Virtual Meetings MAIN"**
- Full calendar integration
- Calendar Tool by Brownfox dev plugin (2 iframes)
- Month navigation
- 42-cell date grid
- Legend: Suggested Days, Confirmed Days, Awaiting Confirmation
- "Show Calendar" toggle functionality

**Why Two Versions?**
- Likely UX simplification (calendar too complex)
- Current version focuses on next meeting only
- Old version showed all available meeting slots

**Implementation Consideration:**
- Use simple list view for active meetings
- Offer calendar view as optional expansion
- Consider react-big-calendar or FullCalendar for rebuild

---

### 8. Plugin Dependencies

**Identified Plugins:**

1. **Calendar Tool by Brownfox dev**
   - Used in deprecated virtual meetings
   - 2 iframe instances
   - Custom calendar visualization

2. **JS2Bubble** (4 instances)
   - Purpose: Unknown
   - Location: Near "Set state of nt number how many zeros"
   - **Requires investigation in Pass 2**

3. **Inverted Rainbow Text**
   - HTML iframe element
   - Footer decoration
   - Custom HTML/CSS

**Implementation Consideration:**
- Replace Calendar Tool with native React calendar component
- Investigate JS2Bubble functionality before rebuilding
- Recreate rainbow text effect with CSS gradients

---

### 9. Progress Tracker Implementation

**6-Stage Proposal Journey:**
1. Proposal Submitted ✅
2. Rental App Submitted
3. Host Review
4. Review Documents
5. Lease Documents
6. Initial Payment

**Visual Indicators:**
- Current stage highlighted
- Completed stages marked
- Upcoming stages grayed out

**Metadata Displayed:**
- Proposal unique ID
- Creation Date

**Implementation Consideration:**
```typescript
interface ProposalProgress {
  stage: 1 | 2 | 3 | 4 | 5 | 6;
  stages: {
    proposalSubmitted: boolean;
    rentalAppSubmitted: boolean;
    hostReview: boolean;
    reviewDocuments: boolean;
    leaseDocuments: boolean;
    initialPayment: boolean;
  };
}

// Component
<ProgressTracker
  currentStage={proposal.progress.stage}
  stages={PROGRESS_STAGES}
/>
```

---

### 10. Conditional Rules Mystery

**All conditionals show Status: OFF**

Possible explanations:
1. **Editor Mode Behavior:** Conditions disabled in design view for easier editing
2. **Runtime Activation:** Conditions activate only in preview/live mode
3. **Inheritance:** Conditions may be overridden at runtime by workflow actions

**Pass 2 Investigation:**
- Check if any conditionals show "ON" status
- Document the exact condition logic for each rule
- Test in preview mode to see actual behavior

---

## Critical Questions for Pass 2

### High Priority

1. **What triggers "*P: Compare Terms" popup?**
   - Button click? Workflow action? Notification?

2. **What is "GF: proposal summary" used for?**
   - References "T: Proposal Rejected" element
   - Purple background (#4D008C)
   - Focus overlay mechanism

3. **What does JS2Bubble plugin do?**
   - 4 instances found
   - Near state-setting element
   - Custom JavaScript integration?

4. **How is the schedule day-letter visualization implemented?**
   - `Parent group's Days's Single Letter`
   - Repeating group? Static layout?
   - S M T W T F S display

5. **What determines "Suggested" badge visibility?**
   - Host recommendation?
   - AI matching?
   - Manual flag?

### Medium Priority

6. **Why conflicting conditionals on "G: View for no proposals"?**
   - Both count=0 and count>0 make it visible
   - Bug or intentional?

7. **What URL parameter does "Get proposal from page URL" read?**
   - proposalId? proposal_id? id?
   - Format: /guest-proposals?id=xxx ?

8. **What is "Set state of nt number how many zeros"?**
   - Number formatting helper?
   - Custom state management?

9. **Why keep deprecated "ZEP-G: Virtual Meetings MAIN"?**
   - Rollback safety?
   - A/B testing?
   - Technical debt?

### Low Priority

10. **Why is "RE: Header" conditional always true?**
    - `Current date/time is not empty` never false
    - Placeholder for future logic?

---

## Pass 2 Exploration Plan

### Systematic Overlay Expansion

**Phase 1: User-Facing Modals**
1. *P: View Host Profile
2. P: Maps
3. P: Confirm proposal modified

**Phase 2: Workflow Components**
4. ♻️💥guest-editing-proposal A
5. ♻️💥respond-request-cancel-vm
6. ♻️💥identity-verification
7. ♻️💥interest-suggested-proposal

**Phase 3: Infrastructure**
8. FG: config guest-dashboard
9. RE: Sign up & Login A
10. ⚛️ Informational text

### Deep Dive Areas

**For Each Overlay:**
- Expand element tree completely
- Screenshot property panel (Appearance, Layout, Conditional)
- Document data sources and bindings
- Note any custom states
- Capture workflow triggers
- Document responsive settings

**For Main Content:**
- Expand "G: Current Proposal" to leaf elements
- Document every text, button, input, image
- Capture exact styling (colors, fonts, spacing)
- Screenshot property panels for interactive elements
- Check for hover states, focus states

**For Reusable Elements:**
- Explore "RE: Header" internals
- Document "footer-hypo1 A" structure
- Understand reusable element parameter passing

### Responsive Settings

**Switch to Responsive Tab:**
- Document breakpoints
- Capture mobile/tablet layout changes
- Note element hiding/showing rules
- Screenshot responsive property panel

### Custom States

**Check Each Parent Group:**
- Look for custom state definitions
- Document state types and purposes
- Understand state-based UI changes

---

## Connection to Live Page Context

### Validation Points

Comparing Design tab findings to Live page documentation:

**✅ Confirmed:**
- 6-stage progress tracker matches live page
- Proposal dropdown selector present
- Host profile, messaging features exist
- Compare Terms functionality discovered
- Empty state for no proposals

**🔍 New Discoveries:**
- Host-changed (hc) proposal fields
- Dual loading mechanism (dropdown + URL)
- Deprecated virtual meeting calendar
- Negotiation summary tracking
- Group Focus element purpose

**❓ Still Unknown:**
- Exact workflow triggers
- State management logic
- API integration points
- Real-time update mechanism

---

## Implementation Readiness Assessment

### Ready to Implement (80%+ confidence)

✅ **Component Structure**
- Header, Footer, Proposal Card, Progress Tracker

✅ **Data Schema**
- Proposal object with original + host-changed fields
- User context
- House rules, pricing breakdown

✅ **Conditional Visibility**
- No proposals empty state
- Proposal selection logic

✅ **Comparison Feature**
- Side-by-side terms display
- Pricing calculation differences

### Needs More Research (< 50% confidence)

❓ **Workflow Actions**
- Button click behaviors
- Form submissions
- Modal triggers
- Navigation flows

❓ **State Management**
- Custom states usage
- State transitions
- Real-time updates

❓ **Plugin Functionality**
- JS2Bubble purpose
- Calendar Tool integration
- Custom HTML elements

❓ **Responsive Behavior**
- Breakpoint definitions
- Mobile layout changes
- Touch interactions

---

## Metrics

**Design Pass 1 Coverage:**
- **Overlays Explored:** 3 / 13 (23%)
- **Main Groups Explored:** 2 / 2 (100%)
- **Screenshots Captured:** 9
- **Data Bindings Documented:** 50+
- **Conditional Rules Found:** 4 systems
- **Plugin Elements:** 3 identified
- **Custom States:** 0 (not yet investigated)
- **Responsive Settings:** 0 (not yet investigated)

**Estimated Completion:**
- Design tab: ~30% complete
- Workflow tab: 0% complete
- Overall documentation: ~15% complete

---

## Next Steps

1. ✅ Assimilation document created
2. ⏭️ Launch Pass 2 exploration
3. ⏭️ Focus on expanding all overlay elements
4. ⏭️ Document conditional rules comprehensively
5. ⏭️ Investigate custom states
6. ⏭️ Switch to Responsive tab
7. ⏭️ Create Pass 2 documentation file

---

**Status:** Pass 1 Complete ✅ | Pass 2 Ready to Begin ⏭️
