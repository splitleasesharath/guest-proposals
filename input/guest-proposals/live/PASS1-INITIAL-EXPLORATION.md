# Pass 1: Initial Page Exploration and Structure Analysis

**Date:** 2025-11-18
**Objective:** Understand page structure, UI components, layout, and basic interactions
**Status:** ✅ Complete

---

## Page Overview

**URL:** `https://app.split.lease/guest-proposals`
**Page Title:** "Proposals - Split Lease"
**Authentication:** User logged in as "Jacques" with 7 unread messages

---

## Core Page Structure

### 1. Header Navigation
- **Split Lease Logo** (clickable, links to home)
- **"Stay with Us" dropdown** (expandable menu)
- **Message Icon** with notification badge (7 unread)
- **"Explore Rentals" button** (white/light colored CTA)
- **User Profile** dropdown (shows "Jacques" with avatar)

### 2. Main Content Area

#### Proposal Selector
- **Title:** "My Proposals (4)"
- **Dropdown/Combobox** to switch between proposals
  - Format: `{HostName} - {ListingTitle}`
  - Examples:
    - "Samuel - New NYC Loft"
    - "Lyla - Beautiful apt ONE BLOCK from Bellevue/ Tisch/ Langone"
    - "Sharath - Brooklyn Shared Room with Full Kitchen, Doorman, Laundry & Outdoor Spaces"
    - "William - Apartment in Harlem"

#### Proposal Card Layout

Each proposal displays in a card format with:

**LEFT SECTION:**
1. **Listing Header**
   - Listing title (blue, clickable)
   - Location (e.g., "Carnegie Hill, Manhattan")
   - Two action buttons:
     - "View Listing" (opens in new tab)
     - "View Map" (opens modal with Google Maps)

2. **Schedule Information**
   - Stay pattern (e.g., "Monday to Thursday", "Sunday to Monday", "Full Time", "Friday to Monday")
   - Duration (e.g., "Duration 26 Weeks")
   - **Week Day Selector** - 7 circular badges (S M T W T F S)
     - Active days appear highlighted/colored
     - Inactive days appear grayed out
     - Info icon (ℹ️) next to the week selector

3. **Check-in/Check-out Details**
   - Check-in time (e.g., "2:00 pm")
   - Check-out time (e.g., "11:00 am")
   - Anticipated move-in date (e.g., "7/21/25")
   - OR for completed: "Move-in 7/28/25 Move-out 1/26/26"

4. **Host Information Section**
   - Host profile picture
   - Host name
   - Two action buttons:
     - "Host Profile" (opens modal with host verification status)
     - "Send a Message" (messaging functionality)

**House Rules Section** (collapsible)
- "See House Rules" / "Hide House Rules" toggle
- List of rules displayed as badges/chips:
  - "No Smoking Inside"
  - "No Shoes Inside"
  - "Quiet Hours"
  - "No Pets"
  - "No Guests"
  - "Take Out Trash"
  - "No Food In Sink"
  - "Recycle"
  - "Lock Doors"
  - "No Opening Windows"
  - "No Candles"
  - "Flush Toilet Paper ONLY"
  - "No Overnight Guests"
  - "No Drinking"
  - "No Drugs"
  - "Wash Your Dishes"

**RIGHT SECTION:**
1. **Listing Image**
   - Large preview image of the property
   - Overlay with host profile picture badge
   - "Host Profile" button overlay
   - "Send a Message" button overlay

**BOTTOM SECTION:**

1. **Pricing Information**
   - Total cost (e.g., "Total $29,278.72")
   - Maintenance fee info (e.g., "No maintenance fee" or "Maintenance Fee: $100.00")
   - Damage deposit (e.g., "Damage deposit $500.00")
   - Price per night (e.g., "$375.37 / night") - clickable
   - Some proposals show strikethrough pricing (discounts)

2. **Action Buttons** (varies by proposal status)
   - "Delete Proposal" (red button)
   - "Go to Leases" (green button - for completed proposals)
   - "Request Virtual Meeting" (for pending proposals)
   - "Modify Proposal" (for pending proposals)
   - "Cancel Proposal" (for pending proposals)

3. **Progress Tracker** (horizontal stepper/timeline)
   Six stages represented as connected dots:
   - **Proposal Submitted** ✓
   - **Rental App Submitted** / **Rental Application Submitted** ✓
   - **Host Review** / **Host Review Complete** / **Awaiting Host Review**
   - **Review Documents** / **Documents Finalized**
   - **Lease Documents** / **Lease Documents Signed**
   - **Initial Payment** / **Payment Submitted**

### 3. Footer Section

**Three Column Layout:**

**Column 1: For Guests**
- Explore Split Leases
- Success Stories
- Speak to an Agent
- View FAQ

**Column 2: Company**
- About Periodic Tenancy
- About the Team
- Careers at Split Lease
- View Blog
- Emergency assistance (red button)

**Column 3: Refer a friend**
- Referral message: "You get $50 and they get $50 *after their first booking"
- Three referral methods (radio buttons):
  - Text
  - Email (default selected)
  - Link
- Email input field
- "Share now" button (purple)

**Promotional Sections:**
1. **Mobile App Promotion**
   - Phone mockup image
   - "Now you can change your nights on the go."
   - App Store download badge

2. **Alexa Integration**
   - Amazon Echo device image
   - "Voice-controlled concierge, at your service."
   - "Alexa, enable Split Lease" - Amazon availability badge

**Bottom Bar:**
- Split Lease logo
- "Terms of Use" link
- Copyright: "© 2025 SplitLease"

---

## Modal Components Discovered

### 1. Host Profile Modal
- Displays when "Host Profile" button is clicked
- Shows:
  - Host profile picture
  - Host name (e.g., "Host: Lyla H")
  - **Verification Status** (4 items):
    - LinkedIn - Unverified
    - Number - Unverified
    - Email - Unverified
    - Identity - Unverified
  - **Featured Listings from Host**
    - Property image thumbnail
    - Listing title (clickable)
    - Location
  - "Close" button

### 2. Map Modal
- Displays when "View Map" button is clicked
- Shows:
  - Google Maps embed with property location marked
  - Listing title and description preview
  - Nearby pricing markers for other properties
  - "View Listing" button
  - Pricing summary at bottom
  - "Delete Proposal" button
  - Full-screen toggle
  - Standard Google Maps controls (zoom, street view, etc.)

### 3. Additional UI Elements
- **Success Banner** (green): "Your lease agreement is now officially signed. For details, please visit the lease section of your account."
- **Chat Widget** (bottom right): "Open chat" button (purple circular button)

---

## Proposal Status States Identified

### State 1: Submitted & Pending Review (Lyla)
- Progress: First 2 steps complete
- Actions: Delete Proposal
- Pricing: Full breakdown with per-night rate
- No banner messages

### State 2: Fully Completed & Signed (Sharath)
- Progress: All 6 steps complete (purple/filled)
- Actions: "Go to Leases" (green button instead of Delete)
- Success banner displayed
- Move-in/Move-out dates shown instead of anticipated date
- Different progress labels (past tense: "Rental Application Submitted", "Host Review Complete", "Documents Finalized", "Lease Documents Signed", "Payment Submitted")
- Strikethrough pricing showing discount

### State 3: Awaiting Host Review (William)
- Progress: 3 steps complete, stuck at "Awaiting Host Review"
- Actions: Request Virtual Meeting, Modify Proposal, Cancel Proposal
- No Delete button
- Standard pricing display

### State 4: Active Submission (Samuel - initial view)
- Similar to State 1
- Standard flow

---

## URL Parameter Behavior

When switching proposals, URL updates with query parameter:
- Format: `?proposal={uniqueProposalId}`
- Example: `?proposal=1751998847788x216198199362049630`
- Page content dynamically updates without full reload

---

## Technical Observations

### JavaScript Errors (Non-blocking)
1. **Recurring Error**: `bubble_fn_checksContiguityListing is not defined`
   - Appears when dropdown changes
   - Does not prevent functionality
   - Likely related to week schedule validation

2. **Custom HTML Issues**: `addEventListener` errors in custom elements
   - Non-critical, page functions normally

3. **ResizeObserver** warnings (browser-level, not breaking)

4. **Lottie Player**: Duplicate registration warning

5. **Geolocation**: User denied permission (expected)

### Third-Party Integrations
- **Google Maps API** (with deprecation warnings for old Marker API)
- **Meta Pixel** (Facebook tracking)
- **Google Tag Manager** / Google Analytics
- **Hotjar** (user behavior analytics)
- **jQuery** / **jQuery Migrate**

---

## Key Interactions Tested

1. ✅ Dropdown selection (switches between proposals)
2. ✅ "View Listing" button (opens in new tab)
3. ✅ "View Map" button (opens map modal)
4. ✅ "Host Profile" button (opens host modal)
5. ✅ "See House Rules" toggle (expands/collapses rules)
6. ✅ Modal close buttons

---

## Data Fields Per Proposal

Each proposal contains:
- **Listing ID** (in URL parameter)
- **Host Name**
- **Listing Title**
- **Location** (neighborhood, city)
- **Schedule Pattern** (days of week + duration)
- **Check-in/Check-out Times**
- **Move-in Date** (anticipated or actual)
- **Total Cost**
- **Maintenance Fee**
- **Damage Deposit**
- **Per-Night Rate**
- **House Rules** (array)
- **Progress Status** (6-stage timeline)
- **Available Actions** (depends on status)

---

## Screenshots Captured

1. `pass1-initial-state.png` - Full page initial load (Samuel's proposal)
2. `pass1-dropdown-open.png` - Proposal dropdown expanded
3. `pass1-lyla-proposal.png` - Lyla's proposal view
4. `pass1-house-rules-expanded.png` - House rules section expanded
5. `pass1-host-profile-modal.png` - Host profile modal
6. `pass1-map-modal.png` - Map view modal
7. `pass1-sharath-completed-proposal.png` - Completed/signed proposal state
8. `pass1-william-awaiting-review.png` - Proposal awaiting host review

---

## Next Steps for Pass 2

Based on Pass 1 findings, Pass 2 should focus on:
1. **Detailed interaction patterns** - button behaviors, form validations
2. **Network requests** - API calls, data fetching patterns
3. **State management** - how data updates, caching
4. **Responsive behavior** - mobile/tablet layouts
5. **Error states** - what happens when actions fail
6. **Edge cases** - empty states, loading states

---

## Notes

- The page uses Bubble.io's reactive framework (visible in console logs)
- All major features are functional despite JavaScript warnings
- No authentication issues encountered
- Page maintains state when navigating between proposals
- Rich set of conditional UI based on proposal status
