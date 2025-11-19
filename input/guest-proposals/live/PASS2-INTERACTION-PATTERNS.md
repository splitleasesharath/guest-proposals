# Pass 2: Interaction Patterns and Behavior Analysis

**Date:** 2025-11-18
**Objective:** Deep dive into interactions, behaviors, API calls, and workflows
**Status:** ✅ Complete

---

## Key API Endpoints Discovered

### Initial Page Load
1. **`/api/1.1/init/data`** - Initializes page data with user session info
2. **`/user/hi`** - User heartbeat/presence check
3. **`/elasticsearch/mget`** - Batch get data from search index (proposal data)
4. **`/elasticsearch/msearch`** - Multi-search for filtering/queries
5. **`/workflow/start`** - Triggers backend workflows
6. **`/elasticsearch/bulk_watch`** - Real-time data updates subscription
7. **`/user/m`** - User metrics tracking
8. **`/user/apm`** - Application performance monitoring
9. **`/bug/client_log`** - Client-side error logging

### Real-time Communication
- **Pusher.js** integration for WebSocket connections
- **Crisp Chat** for live customer support
- **Elasticsearch bulk_watch** for real-time proposal updates

---

## Navigation Behaviors

### URL Routing Pattern
- **Base URL:** `https://app.split.lease/guest-proposals`
- **With Proposal:** `?proposal={proposalId}`
- **With Thread:** `?thread={threadId}&proposal={proposalId}` (messaging)

### Page Transitions
1. **Same-page updates:** When switching proposals via dropdown
   - URL updates with query parameter
   - Content dynamically replaces
   - No full page reload
   - Elasticsearch queries fetch new data

2. **Navigation to messaging:** Clicking "Send a Message"
   - Navigates to: `/messaging-app?thread={threadId}&proposal={proposalId}`
   - Opens dedicated messaging interface
   - Full page transition

3. **New tab navigation:** Clicking "View Listing"
   - Opens in new browser tab
   - Takes user to listing detail page
   - Returns to proposals when tab closed

---

## Interactive Components Deep Dive

### 1. Proposal Dropdown Selector
**Element:** Combobox (select dropdown)
**Behavior:**
- Displays format: `{HostName} - {ListingTitle}`
- On selection change:
  - Fires JavaScript error: `bubble_fn_checksContiguityListing is not defined`
  - Updates URL with `?proposal={id}`
  - Triggers `/elasticsearch/mget` API call
  - Re-renders entire proposal card
  - Maintains scroll position

**Data Flow:**
```
User selects proposal
  → Dropdown onChange event
  → Update URL parameter
  → API call to /elasticsearch/mget
  → Fetch proposal data
  → Re-render UI
```

### 2. Send a Message Button
**Behavior:**
- Navigates to messaging interface
- Opens thread for specific proposal
- URL: `/messaging-app?thread={threadId}&proposal={proposalId}`

**Messaging Interface Structure:**
- **Left Sidebar:** List of all message threads
  - Host profile picture
  - Host name with verification badge
  - Listing name
  - Last message preview
  - Timestamp
  - Unread count badge

- **Main Chat Area:**
  - Host header with verification status
  - "Request Virtual Meeting" button
  - Message history (chronological)
  - Bot messages labeled "Split Bot:"
  - Action buttons: "View this proposal"
  - Message composition area at bottom

**Message Types Observed:**
1. **System/Bot Messages:**
   - "Your proposal for {listing} has been submitted"
   - "The proposal... is about to expire, in 3 hours!"
   - "The proposal... just expired!"

2. **User Messages:** Text input field supports typing

3. **Interactive Elements:**
   - "View this proposal" buttons (navigate back to proposals)
   - "Request Virtual Meeting" button

### 3. Host Profile Button
**Opens Modal with:**
- Host profile picture (large)
- Host name (e.g., "Host: Lyla H")
- Verification status (4 items):
  - LinkedIn: ✗ Unverified
  - Number: ✗ Unverified
  - Email: ✗ Unverified
  - Identity: ✗ Unverified
- Featured listings section
- Close button

**Note:** All hosts in test account show "Unverified" status

### 4. View Map Button
**Opens Modal with:**
- Google Maps embed
- Property location marker (red pin)
- Nearby property price markers (e.g., $375, $229, $614)
- Listing preview card overlay:
  - Listing title
  - Description excerpt
  - "View Listing" button
- Bottom section:
  - Pricing summary
  - "Delete Proposal" button
- Map controls:
  - Zoom in/out
  - Street view
  - Full-screen toggle
  - Map/Satellite toggle

### 5. House Rules Toggle
**Behavior:**
- "See House Rules" → expands section
- "Hide House Rules" → collapses section
- Animated expansion/collapse
- Rules displayed as badge/chip UI elements
- No API call (data already loaded)

### 6. Action Buttons (Status-Dependent)

**For Pending Proposals:**
- "Delete Proposal" (red)
- OR "Request Virtual Meeting" (gray)
- "Modify Proposal" (green)
- "Cancel Proposal" (red)

**For Completed Proposals:**
- "Go to Leases" (green)

**Behavior:**
- Buttons trigger `/workflow/start` API calls
- Success/error states not fully tested

### 7. Chat Widget (Crisp)
**Powered by:** Crisp.chat
**Trigger:** Purple circular button (bottom right)

**Features:**
- Header: "Real-time help. Ask now!"
- Status indicator: "Was last active 10 hours ago"
- Initial message: "Hey, can I give you a hand with anything?"
- Text input: "Compose your message..."
- Emoji picker button
- File attachment button
- Branding: "We run on Crisp"

**Integration:**
- Website ID: `44de0488-7ae7-4573-a290-2a9baad8cfb4`
- Loads from: `client.crisp.chat`
- Real-time WebSocket connection

### 8. Week Day Selector
**Display:** 7 circular badges (S M T W T F S)
**Visual States:**
- Active days: Purple/blue filled
- Inactive days: Gray outlined
- Selected pattern displayed (e.g., "Friday to Monday")

**Info Icon (ℹ️):**
- Present but not interactable in static view
- Likely shows tooltip or modal on hover/click

---

## State Management Observations

### Progress Tracker States
**6 Stages:**
1. Proposal Submitted
2. Rental App Submitted / Rental Application Submitted
3. Host Review / Host Review Complete / Awaiting Host Review
4. Review Documents / Documents Finalized
5. Lease Documents / Lease Documents Signed
6. Initial Payment / Payment Submitted

**Visual Indicators:**
- Completed: Purple filled circle with connecting line
- Current: Green filled circle (active stage)
- Pending: Gray outlined circle
- Text changes based on completion (past tense vs present tense)

### Conditional UI Rendering

**Success Banner (Completed Proposals):**
```
"Your lease agreement is now officially signed.
For details, please visit the lease section of your account."
```
- Green background
- Appears above proposal card
- Only shown for fully completed proposals

**Action Button Logic:**
- `status == "completed"` → "Go to Leases"
- `status == "pending"` && `host_reviewed == false` → "Request Virtual Meeting", "Modify", "Cancel"
- `status == "active"` → "Delete Proposal"

---

## Data Update Patterns

### Real-time Updates
**Via Elasticsearch Bulk Watch:**
- Subscribes to proposal changes
- Updates UI when:
  - Host responds to proposal
  - Proposal status changes
  - New messages arrive
  - Documents are uploaded

**Via Pusher:**
- WebSocket connection maintained
- Real-time messaging notifications
- Presence indicators

### Polling
- No explicit polling observed
- Uses WebSocket subscriptions instead

---

## Third-Party Integrations

### 1. Crisp Chat
- **Purpose:** Customer support live chat
- **Domain:** `client.crisp.chat`
- **Features:** Real-time messaging, file uploads, emoji support

### 2. Google Maps
- **API Key:** `AIzaSyCFTsfBW4GugOydvEHr5a4dJ32266hNxVo`
- **Libraries:** places
- **Usage:** Property location display, nearby listings

### 3. Analytics & Tracking
- **Google Analytics:** `UA-193354665-1`, `G-PRBFSMSWDY`
- **Google Tag Manager:** `AW-448932340`
- **Facebook Pixel:** `902926896795830`
- **Heap Analytics:** `1166044238`
- **Hotjar:** `1741366`

### 4. Pusher (Real-time)
- **Version:** 5.1
- **Domain:** `js.pusher.com`

### 5. Other Services
- **Uploadcare:** File upload widget
- **PathFix:** Session recording/analytics
- **Sortable.js:** Drag-and-drop (not visible in UI)
- **Moment.js:** Date/time formatting
- **Chart.js:** Potential charts (not visible)
- **LocalForage:** Client-side storage

---

## Error Handling Observed

### Non-blocking Errors
1. **`bubble_fn_checksContiguityListing is not defined`**
   - Occurs on dropdown change
   - Does not break functionality
   - Likely validation function for schedule contiguity

2. **Custom HTML addEventListener errors**
   - Element not found in DOM
   - Bubble.io framework attempting to attach listeners too early

3. **ResizeObserver loop** warnings
   - Browser performance warnings
   - Non-critical

### Logged to Backend
- Client-side errors sent to `/bug/client_log`
- Helps debugging production issues

---

## Performance Characteristics

### Initial Load Time
- **Page loaded:** ~1-2 seconds (as logged by Bubble)
- **First paint:** Fast (fonts load progressively)
- **Interactive:** Near-immediate

### Network Requests
- **Initial load:** ~120+ requests
- **Fonts:** ~35 Google Fonts variants
- **Images:** CDN-optimized (Bubble CDN + Cloudfront)
- **API calls:** Batched elasticsearch queries

### Optimization Techniques
- Image CDN with automatic format conversion (`f=auto`)
- Responsive image sizing (`w=`, `h=` parameters)
- Font subsetting
- Gzip compression
- Asset caching

---

## User Experience Flows

### Flow 1: Viewing Proposal Details
```
1. Land on /guest-proposals
2. See first proposal (default selected)
3. Click dropdown → Select different proposal
4. URL updates, content loads
5. Click "View Listing" → Opens new tab
6. Close tab → Returns to proposals
```

### Flow 2: Contacting Host
```
1. On proposal card
2. Click "Send a Message"
3. Navigate to /messaging-app
4. View message history with host
5. Type message in text field
6. Send message (not tested)
7. Click "View this proposal" → Return to proposals
```

### Flow 3: Checking Host Profile
```
1. Click "Host Profile" button
2. Modal opens with host info
3. View verification status
4. See featured listings
5. Click "Close"
6. Return to proposal view
```

### Flow 4: Viewing Location
```
1. Click "View Map"
2. Modal opens with Google Maps
3. See property location
4. View nearby property prices
5. Zoom/pan map
6. Click X to close
```

### Flow 5: Getting Support
```
1. Click purple chat widget (bottom right)
2. Chat window opens
3. See initial greeting
4. Type message
5. Send to support team
6. Receive response (not tested)
```

---

## Screenshots Captured

1. `pass2-messaging-interface.png` - Full messaging app interface
2. `pass2-william-with-action-buttons.png` - Proposal with action buttons
3. `pass2-chat-widget-open.png` - Crisp chat widget opened

---

## Technical Debt Identified

1. **Missing Function:** `bubble_fn_checksContiguityListing`
   - Called but undefined
   - Should validate week schedule contiguity
   - May prevent schedule validation errors

2. **Google Maps Deprecation:** Using old `google.maps.Marker`
   - Should migrate to `google.maps.marker.AdvancedMarkerElement`

3. **Custom HTML Errors:** Event listeners failing
   - Race condition in Bubble framework
   - Elements not ready when listeners attach

4. **Multiple Lottie Players:** Duplicate library loads
   - Version conflicts (2.0.4, 2.0.12, latest)
   - Should consolidate to one version

---

## Security Observations

### API Keys Exposed (Expected)
- Google Maps API key (client-side necessary)
- Facebook Pixel ID
- Analytics IDs

### Authentication
- User logged in as "Jacques"
- Session managed via cookies
- `/user/hi` endpoint validates session

### Data Protection
- HTTPS everywhere
- No sensitive data in URL parameters (except proposal IDs)
- Proposal IDs appear to be unique identifiers (safe to expose)

---

## Next Steps for Pass 3

Based on Pass 2 findings, Pass 3 should explore:
1. **Data structures** - Detailed proposal object schema
2. **API request/response formats** - Full payload analysis
3. **Workflows** - What happens when "Modify Proposal" is clicked
4. **Form interactions** - Input validation, error states
5. **Edge cases** - What if no proposals exist? Loading states?
6. **Responsive design** - Mobile/tablet layout testing

---

## Notes

- Messaging system is fully separate app (`/messaging-app`)
- Real-time features heavily rely on Elasticsearch + Pusher
- Bubble.io framework manages all state reactively
- No explicit loading spinners observed (instant transitions)
- Chat widget (Crisp) is third-party, not built in Bubble
- All interactive features work despite JavaScript warnings
