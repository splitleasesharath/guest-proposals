# Bubble IDE Design Tab - Pass 1: Element Structure Analysis
## guest-proposals Page

**Date:** 2025-11-18
**Purpose:** Document the complete element hierarchy, conditional visibility rules, data bindings, custom states, and responsive settings from the Bubble.io IDE Design tab.

---

## Overview

The guest-proposals page has a complex structure with multiple layers:
- **Overlays** - Popup/modal elements that appear on top of the main content
- **Layers** - Main page content including the proposal section and footer
- **Reusable Elements** - Referenced throughout the page

---

## Element Hierarchy

### Page: guest-proposals

#### Overlays Section

1. **"*P: Compare Terms"** (Popup)
   - **Type:** Popup
   - **Data Type:** Proposal
   - **Data Source:** Click (to be investigated)
   - **Style:** None (Custom)
   - **Opacity:** 100%
   - **Background:**
     - Style: Flat color
     - Color: #FFFFFF
   - **Grayout:**
     - Color: #747474
     - Blur: 0
   - **Border:**
     - Style: None
     - Roundness: 10
   - **Shadow:**
     - Style: Outset
     - Horizontal offset: 0
     - Vertical offset: 50
     - Blur radius: 80
     - Spread radius: 0
     - Color: #000000
   - **Dimensions:**
     - Width: 55%
     - Height: 0px - 90%
   - **ID Attribute:** CompareTerms
   - **Popup cannot be closed by pressing 'Esc'**

   **Child Elements:**
   - Icon fa fa-times (close button)
   - **"G: Compare Terms"** (Group)
     - **Type:** Group
     - **Data Type:** Proposal
     - **Data Source:** Parent group's Proposal
     - **Style:** None (Custom)
     - **Opacity:** 100%
     - **Background:**
       - Style: Flat color
       - Color: #FFFFFF
     - **Border:**
       - Style: Dotted
       - Roundness: 0
       - Width: 1
       - Color: #6B6B6B
     - **Shadow:** None
     - **Dimensions:**
       - Width: 95%
       - Height: 0px - 2000px
     - **Conditional Rules:**
       - When: "This Group is visible"
       - Then: Border style changes to "None"
       - Status: OFF

     **Contains:**
     - Compare Terms header text
     - Negotiation summary display
     - Two-column comparison layout:
       - **Your Terms column:**
         - Move-in date range (Parent group's Proposal's Move in range start/end)
         - Duration (Parent group's Proposal's Reservation Span (Weeks))
         - Schedule display with day letters
         - Days/nights count
         - House Rules list (Current cell's ZAT-Features - HouseRule's Name)
       - **Host Terms column:**
         - Move-in date (Parent group's Proposal's hc move in date)
         - Duration (Parent group's Proposal's hc reservation span (weeks))
         - Schedule display with day letters
         - Days/nights count
         - House Rules list (Current cell's ZAT-Features - HouseRule's Name)
     - **Reservation Details (Your Terms):**
       - Check-In date
       - Check-out date
       - Price / Night
       - Nights Reserved
       - Weeks Used
       - Duration (wks)
       - Total Price (excluding Damage Deposit & Maintenance Fee)
       - Price breakdown per 4 weeks
       - Nights Reserved / 4 wks
       - Maintenance Fee / 4 wks
       - Refundable Damage Deposit
       - Initial Payment calculation
     - **Reservation Details (Host Terms):**
       - Same structure as Your Terms but with "hc" (host changed) values
     - **Action Buttons:**
       - Cancel Proposal
       - Close
       - Accept Host Terms
     - Link: "Check the full document"

2. **"♻️💥guest-editing-proposal A"** (Reusable Element)
   - Status: Collapsed in tree (not yet explored)

3. **"♻️💥respond-request-cancel-vm"** (Reusable Element)
   - Status: Collapsed in tree (not yet explored)

4. **"♻️💥identity-verification"** (Reusable Element)
   - Status: Collapsed in tree (not yet explored)

5. **"P: Maps"** (Popup)
   - Status: Collapsed in tree (not yet explored)

6. **"RE: Header"** (Reusable Element)
   - **Type:** Reusable Element (Floating)
   - **Vertically float relative to:** Top
   - **Horizontally float relative to:** Left
   - **Floating zindex:** Above elements
   - **Dimensions:** Width: 1372px - inf, Height: 70px
   - **Conditional Rules (1):**
     - When: "Current date/time is not empty"
     - Then: "This element is visible"
     - Status: OFF
     - **Note:** This condition is always true (current date/time is never empty)

7. **"RE: Sign up & Login A"** (Reusable Element)
   - Status: Collapsed in tree (not yet explored)

8. **"*P: View Host Profile"** (Popup)
   - Status: Collapsed in tree (not yet explored)

9. **"⚛️ Informational text"** (Reusable Element)
   - **Note:** Information popup appeared showing:
     - Desktop copy with find & replace operations
     - Extra text to show
     - Link element
     - "show more" functionality
   - Status: Partially visible in tree

10. **"GF: proposal summary"** (Group Focus)
    - **Type:** Group Focus
    - **Reference element:** "T: Proposal Rejected"
    - **Offset top:** 0
    - **Offset left:** 0
    - **Data Type:** Proposal
    - **Data Source:** Click
    - **Style:** None (Custom)
    - **Background:**
      - Style: Flat color
      - Color: #4D008C (purple)
    - **Border:**
      - Style: None
      - Roundness: 10
    - **Shadow:**
      - Style: Outset
      - Horizontal offset: 2
      - Vertical offset: 2
      - Blur radius: 16
      - Spread radius: 0
      - Color: #000000
    - **Dimensions:**
      - Width: 467px
      - Height: 190px - inf

11. **"FG: config guest-dashboard"** (Floating Group)
    - Status: Collapsed in tree (not yet explored)

12. **"P: Confirm proposal modified"** (Popup)
    - Status: Collapsed in tree (not yet explored)

13. **"♻️💥interest-suggested-proposal"** (Reusable Element)
    - Status: Collapsed in tree (not yet explored)

---

#### Layers Section

1. **"G: entire proposal section"** (Group - Main Content Container)
   - **Status:** Expanded
   - **Child Elements:**

   a. **"G: proposal selection dropdown and text"** (Group)
      - Contains:
        - Text: "My Proposals (Current User's Proposals List:filtered:count)"
        - Dropdown: "Select Proposal" (combobox)
        - Rejection message group:
          - Strong text: "Proposal Rejected."
          - Text: "Reason: Parent group's Proposal's reason for cancellation"

   b. **"G: View for no proposals"** (Group)
      - **Conditional Rules (2):**
        1. When: "Current User's Proposals List:filtered:count is 0"
           - Then: "This element is visible"
           - Status: OFF
        2. When: "Current User's Proposals List:filtered:count > 0"
           - Then: "This element is visible"
           - Status: OFF
           - **Note:** This appears to be a conflicting or erroneous rule
      - Contains:
        - Text: "You don't have any proposals submitted yet. We invite you to submit proposals with the weekly schedule you have in mind"
        - Button: "Explore Rentals"

   c. **"G: Current Proposal"** (Group)
      - **Data Type:** Proposal
      - **Conditional Rules (2):**
        1. When: "D: Choose Proposal's value is empty"
           - Then: "This element is visible"
           - Status: OFF
        2. When: "Get proposal from page URL is not empty"
           - Then: Data source changes to "Get proposal from page URL"
           - Status: OFF
           - **Note:** This allows the proposal to be loaded from URL parameter
      - Contains extensive proposal details:
        - **Listing Information:**
          - Listing name (Parent group's Proposal's Listing's Name)
          - Location (Borough's Geo-Hoods, Display Borough)
          - Buttons: "View Listing", "View Map"
        - **Date Information:**
          - Check-in/check-out dates
          - Duration in weeks
          - Schedule visualization (day letters S/M/T/W/T/F/S)
          - Check-in/Check-out times
          - Anticipated Move-in date
        - **Host Information:**
          - "Suggested" badge
          - Host profile photo
          - Host name (first name)
          - Buttons: "Host Profile", "Send a Message"
        - **House Rules Section:**
          - "See House Rules" toggle
          - Repeating list of house rules (Parent group's ZAT-Features - HouseRule's Name)
          - Shows 5 visible rule groups
        - **Pricing Section:**
          - Total Price for Reservation
          - Damage deposit
          - Nightly price
          - Buttons:
            - "Request Virtual Meeting"
            - "Guest Action 1"
            - "Guest Action 2"
            - "Cancel Proposal"
        - **Progress Tracker:**
          - 6 stages shown:
            1. Proposal Submitted
            2. Rental App Submitted
            3. Host Review
            4. Review Documents
            5. Lease Documents
            6. Initial Payment
          - Footer: Proposal unique id and Creation Date

   d. **"G: Virtual Meetings"** (Group)
      - Contains:
        - Header: "Virtual Meetings"
        - Meeting card with:
          - Host profile photo
          - Host name and listing name
          - Meeting date/time (Parent group's Proposal's virtual meeting's booked date (EST))
          - Status messages (3 different states)
          - Button: "Respond to Virtual Meeting"

   e. **"ZEP-G: Virtual Meetings MAIN"** (Group)
      - Contains calendar integration:
        - Two Calendar Tool plugin instances (iframes)
        - Date display cells (Current cell's date)
        - "Virtual Meetings" label
        - Meeting details group:
          - Meeting info text
          - Buttons: "Respond to Virtual Meeting", "Show Calendar"
          - Unique ID display
          - "click for details" link
        - **Calendar Controls:**
          - Navigation buttons (prev/next month)
          - Month selector dropdown
          - Day labels (Sun-Sat)
          - 42 date cells in grid layout (Current cell's date:formatted as 18)
        - **Legend:**
          - Virtual Meeting Suggested Days
          - Virtual Meeting Confirmed Days
          - Awaiting Split Lease Confirmation

2. **"footer-hypo1 A"** (Reusable Element - Footer)
   - **Contains:**
     - **For Hosts Section:**
       - List Property Now
       - How to List
       - Legal Section
       - Guarantees
       - Free House Manual
       - View FAQ
     - **For Guests Section:**
       - About Booking
       - Explore Split Leases
       - Success Stories
       - Speak to an Agent
       - View FAQ
     - **Company Section:**
       - About Periodic Tenancy
       - About the Team
       - Careers at Split Lease
       - View Blog
       - Button: "Emergency assistance"
     - **Referral Section:**
       - Text: "Refer a friend You get $50 and they get $50 *after their first booking"
       - Email input: "Your friend's email address"
       - Button: "Share now"
       - Phone input: "Your friend's phone number"
       - Button: "Text referral"
       - Referral link: "www.split.lease/?referral=Current User's unique id"
       - Button: "Copy Link"
     - **Import Listing Section:**
       - Text: "Import your listing from another site"
       - URL input: "https:\\\\your-listing-link"
       - Email input: "janedoe@your_email.com"
       - Button: "Submit"
     - **Mobile App Section:**
       - Text: "Now you can change your nights on the go."
       - App Store download image
       - Text: "Download at the App Store"
     - **Voice Assistant Section:**
       - Text: "Voice-controlled concierge, at your service."
       - Alexa integration image
       - Text: "Alexa, enable Split Lease"
     - **Footer Bottom:**
       - Logo image
       - Text: "Terms of Use"
       - Inverted Rainbow Text (iframe HTML element)
       - Text: "Made with love in New York City"
       - Text: "© 2025 SplitLease"

---

## Data Bindings Observed

### Proposal-related bindings:
- `Parent group's Proposal's Listing's Name`
- `Parent group's Proposal's Listing's Location - Borough's Geo-Hoods:first item's Display`
- `Parent group's Proposal's Listing's Location - Borough's Display Borough`
- `Parent group's Proposal's check in day's Display`
- `Parent group's Proposal's check out day's Display`
- `Parent group's Proposal's Reservation Span (Weeks)`
- `Parent group's Proposal's Days Selected:count`
- `Parent group's Proposal's nights per week (num)`
- `Parent group's Proposal's Move in range start:formatted as 11/18/25`
- `Parent group's Proposal's Move in range end:formatted as 11/18/25`
- `Parent group's Proposal's Listing's NEW Date Check-in Time's Display`
- `Parent group's Proposal's Listing's NEW Date Check-out Time's Display`
- `Parent group's Proposal's Host - Account's User's Name - First`
- `Parent group's Proposal's Host - Account's User's Profile Photo`
- `Parent group's Proposal's Total Price for Reservation (guest):formatted as $1,028.58`
- `Parent group's Proposal's cleaning fee:formatted as $1,028.58`
- `Parent group's Proposal's damage deposit:formatted as $1,028.58`
- `Parent group's Proposal's proposal nightly price:formatted as $1,028.58`
- `Parent group's Proposal's unique id`
- `Parent group's Proposal's Creation Date:formatted as 11/18/25`
- `Parent group's Proposal's reason for cancellation`

### Host-changed (hc) proposal bindings:
- `Parent group's Proposal's hc move in date:formatted as Tue, Nov 18, 2025`
- `Parent group's Proposal's hc reservation span (weeks)`
- `Parent group's Proposal's hc days selected:count`
- `Parent group's Proposal's hc nights per week`
- `Parent group's Proposal's hc check in day's Display`
- `Parent group's Proposal's hc check out day's Display`
- `Parent group's Proposal's hc nightly price:formatted as $1,028.58`
- `Parent group's Proposal's hc total price:formatted as $1,028.58`
- `Parent group's Proposal's hc cleaning fee:formatted as $1,028.58`
- `Parent group's Proposal's hc damage deposit:formatted as $1,028.58`

### Virtual Meeting bindings:
- `Parent group's Proposal's virtual meeting's booked date (EST)`
- `Parent group's Proposal's virtual meeting's unique id`

### User bindings:
- `Current User's Proposals List:filtered:count`
- `Current User's unique id`

### House Rules bindings:
- `Parent group's ZAT-Features - HouseRule's Name`
- `Current cell's ZAT-Features - HouseRule's Name`

### Days bindings:
- `Parent group's Days's Single Letter`

### Calendar bindings:
- `Current cell's date`
- `Current cell's date:formatted as 18`

### Other bindings:
- `Parent group's Proposal's Negotiation Summary:filtered:last item's Summary`
- `Parent group's Informational Texts's Desktop copy:find & replace:find & replace`

---

## Plugin Elements Identified

1. **Calendar Tool by Brownfox dev**
   - Used in "ZEP-G: Virtual Meetings MAIN"
   - Two instances embedded via iframe
   - Provides calendar visualization for virtual meeting scheduling

2. **JS2Bubble**
   - Multiple instances found (4 iframes)
   - Location: Near "Set state of nt number how many zeros" element
   - Purpose: Not yet determined (needs investigation)

3. **Inverted Rainbow Text**
   - HTML iframe element
   - Located in footer section
   - Custom HTML implementation

---

## Conditional Visibility Rules Discovered

### 1. "G: Compare Terms" Group
- **Condition:** When "This Group is visible"
- **Action:** Border style changes to "None"
- **Status:** OFF (condition is disabled)
- **Default Border:** Dotted, 1px, #6B6B6B

### 2. "RE: Header" Reusable Element
- **Condition:** When "Current date/time is not empty"
- **Action:** "This element is visible"
- **Status:** OFF
- **Note:** Always-true condition (current date/time is never empty)

### 3. "G: View for no proposals" Group
- **Condition 1:** When "Current User's Proposals List:filtered:count is 0"
- **Action:** "This element is visible"
- **Status:** OFF
- **Condition 2:** When "Current User's Proposals List:filtered:count > 0"
- **Action:** "This element is visible"
- **Status:** OFF
- **Note:** Conflicting rules - likely an error or controls different properties

### 4. "G: Current Proposal" Group
- **Condition 1:** When "D: Choose Proposal's value is empty"
- **Action:** "This element is visible"
- **Status:** OFF
- **Condition 2:** When "Get proposal from page URL is not empty"
- **Action:** Data source = "Get proposal from page URL"
- **Status:** OFF
- **Note:** Dual-mode loading - either from dropdown or URL parameter

### Data Bindings Referenced in Conditionals:
- `D: Choose Proposal's value` - Dropdown element for proposal selection
- `Get proposal from page URL` - URL parameter for proposal ID
- `Current User's Proposals List:filtered:count` - Number of user's proposals
- `Current date/time` - System timestamp

---

## Custom States
*To be investigated in subsequent passes - need to check each element's Appearance tab*

---

## Responsive Settings
*To be investigated by switching to Responsive tab in subsequent passes*

---

## Screenshots Captured

1. `design-pass1-initial-view.png` - Full page view of IDE on load
2. `design-pass1-compare-terms-popup-expanded.png` - "*P: Compare Terms" popup selected with properties panel
3. `design-pass1-compare-terms-conditional.png` - Conditional tab for "G: Compare Terms" group
4. `design-pass1-entire-proposal-section.png` - "G: entire proposal section" selected
5. `design-pass1-element-tree-expanded.png` - Element tree with main groups visible
6. `design-pass1-proposal-summary-group-focus.png` - "GF: proposal summary" Group Focus properties
7. `design-pass1-header-conditional.png` - "RE: Header" conditional visibility rule
8. `design-pass1-view-no-proposals-conditional.png` - "G: View for no proposals" conditional rules
9. `design-pass1-current-proposal-conditional.png` - "G: Current Proposal" dual-mode loading conditionals

---

## Key Observations

1. **Naming Conventions:**
   - `*P:` = Popup elements
   - `RE:` = Reusable Elements
   - `G:` = Group elements
   - `GF:` = Group Focus elements
   - `FG:` = Floating Group elements
   - `♻️💥` = Recycled/reusable workflow elements
   - `⚛️` = Atomic/component reusable elements
   - `ZEP-` = Deprecated or old version ("Z" prefix often indicates archived)

2. **Data Architecture:**
   - Heavy use of "Parent group's Proposal" data context
   - Proposal object has both regular fields and "hc" (host-changed) fields
   - Calendar uses "Current cell" context for repeating data
   - User data accessed via "Current User"

3. **Host-Changed (hc) Fields:**
   - The system tracks TWO versions of proposal data:
     - Original guest proposal terms
     - Host-modified counter-proposal terms (prefixed with "hc")
   - This enables the comparison feature in "*P: Compare Terms"

4. **Element Visibility Strategy:**
   - Multiple groups for different states (no proposals, current proposal, etc.)
   - Controlled by conditional visibility rules based on:
     - User's proposal count (Current User's Proposals List:filtered:count)
     - Dropdown selection (D: Choose Proposal's value)
     - URL parameters (Get proposal from page URL)
   - Dual-mode proposal loading: dropdown selection OR URL parameter
   - All discovered conditionals have Status: OFF (disabled in editor)

5. **Progress Tracking:**
   - 6-stage proposal workflow visualization
   - Visual indicator of current stage

6. **Virtual Meeting Integration:**
   - Two separate groups: "G: Virtual Meetings" and "ZEP-G: Virtual Meetings MAIN"
   - Suggests evolution/redesign (ZEP prefix indicates old version)
   - Calendar plugin integration for scheduling

---

## Areas Requiring Further Exploration (Pass 2)

1. **Unexpanded Overlays:**
   - ♻️💥guest-editing-proposal A
   - ♻️💥respond-request-cancel-vm
   - ♻️💥identity-verification
   - P: Maps
   - RE: Header
   - RE: Sign up & Login A
   - *P: View Host Profile
   - GF: proposal summary
   - FG: config guest-dashboard
   - P: Confirm proposal modified
   - ♻️💥interest-suggested-proposal

2. **Conditional Visibility Rules:**
   - Need to check Conditional tab for all major groups
   - Determine when "G: View for no proposals" vs "G: Current Proposal" displays
   - Investigate popup trigger conditions

3. **Custom States:**
   - Check for custom states on all parent groups
   - Identify state-based UI changes

4. **Responsive Settings:**
   - Switch to Responsive tab
   - Document breakpoints and responsive behavior

5. **Detailed Child Elements:**
   - Expand all groups to leaf-level elements
   - Document individual text, button, and input elements
   - Capture exact styling for key elements

6. **Workflow Triggers:**
   - Check workflow tab for each clickable element
   - Document button actions and navigation

7. **Plugin Configuration:**
   - Investigate JS2Bubble plugin purpose and configuration
   - Document Calendar Tool settings

8. **Schedule Visualization:**
   - Understand how the day-letter schedule display works
   - Check if it's a repeating group or static layout

---

## Next Steps for Pass 2

1. Systematically expand EVERY overlay element
2. Click Conditional tab for each major group/popup
3. Document all conditional visibility rules
4. Check for custom states on parent groups
5. Take detailed screenshots of each popup's property panel
6. Document the complete element tree for "G: Current Proposal"
7. Investigate reusable elements (Header, Footer, etc.)
8. Switch to Responsive tab and document responsive settings
9. Capture property panels for key interactive elements (buttons, inputs)

---

## Technical Debt / Questions

1. Why are there two Virtual Meeting groups? (regular and ZEP version)
2. What triggers the Compare Terms popup?
3. How does proposal selection in dropdown work?
4. ~~What are the exact conditional rules for showing/hiding proposal states?~~ **ANSWERED:** Uses Current User's Proposals List:filtered:count and D: Choose Proposal's value
5. What is the purpose of "Set state of nt number how many zeros"?
6. How are the 6 proposal stages tracked and displayed?
7. What determines when a proposal shows "Suggested" badge?
8. Why does "G: View for no proposals" have conflicting conditional rules (both count=0 and count>0 make it visible)?
9. Why are all conditional rules set to OFF status in the editor?
10. How does "Get proposal from page URL" function work? What URL parameter does it read?
11. What is the reference element "T: Proposal Rejected" used by "GF: proposal summary"?
12. Why does "RE: Header" have an always-true conditional (Current date/time is not empty)?

---

*End of Pass 1 Documentation*
