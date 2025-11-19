# Base Page Implementation Plan - Guest Proposals
## Verified Schema Analysis & Implementation Roadmap

**Generated:** 2025-11-19
**Scope:** Base page layer only (no modals, popups, or overlays)
**Approach:** Schema-first, verified through Supabase MCP

---

## Part 1: Database Schema Analysis

### 1.1 Table Relationships (Verified via Supabase MCP)

```
┌─────────────┐
│    user     │
│   (_id)     │
└──────┬──────┘
       │
       ├──────────────────────────────────┐
       │                                  │
       ▼                                  ▼
┌──────────────┐                   ┌──────────────┐
│   proposal   │◄──────────────────│   listing    │
│    (_id)     │                   │    (_id)     │
└──────┬───────┘                   └──────────────┘
       │
       ▼
┌──────────────────┐
│ virtual_meetings │
│      (id)        │
└──────────────────┘
```

### 1.2 Core Tables Schema

#### TABLE: `user`
**Primary Key:** `_id` (text)

**Key Fields for Guest Proposals:**
| Field Name | Data Type | Nullable | Purpose |
|-----------|-----------|----------|---------|
| `_id` | text | NO | Primary identifier |
| `Name - First` | text | YES | Guest/Host first name |
| `Name - Last` | text | YES | Guest/Host last name |
| `Name - Full` | text | YES | Full name display |
| `Profile Photo` | text | YES | Profile image URL |
| `email as text` | text | YES | Email address |
| `Phone Number (as text)` | text | YES | Contact phone |
| `About Me / Bio` | text | YES | User bio |
| `Account - Guest` | text | YES | → `account_guest._id` |
| `Account - Host / Landlord` | text | YES | → `account_host._id` |
| `Proposals List` | jsonb | YES | Array of proposal IDs |
| `Verify - Linked In ID` | text | YES | LinkedIn verification |
| `Verify - Phone` | boolean | YES | Phone verified flag |
| `user verified?` | boolean | YES | Identity verified |

**Verification Fields Available:**
- LinkedIn verification: `Verify - Linked In ID`
- Phone verification: `Verify - Phone`
- Identity verification: `user verified?`
- Email confirmation: `is email confirmed`

---

#### TABLE: `listing`
**Primary Key:** `_id` (text)

**Key Fields for Guest Proposals:**
| Field Name | Data Type | Nullable | Purpose |
|-----------|-----------|----------|---------|
| `_id` | text | NO | Primary identifier |
| `Name` | text | YES | Listing title |
| `Description` | text | YES | Full description |
| `Host / Landlord` | text | YES | → `user._id` (FK) |
| `Location - Address` | jsonb | YES | Full address object |
| `Location - Borough` | text | YES | Borough/area |
| `Location - Hood` | text | YES | Neighborhood |
| `Location - City` | text | YES | City name |
| `Features - Photos` | jsonb | YES | Array of photo IDs |
| `Features - House Rules` | jsonb | YES | Array of rules |
| `Features - Qty Guests` | integer | YES | Max guests allowed |
| `Features - Qty Bedrooms` | integer | YES | Number of bedrooms |
| `Features - Qty Bathrooms` | integer | YES | Number of bathrooms |
| `Features - Type of Space` | text | YES | Space type (entire place, private room, etc.) |
| `NEW Date Check-in Time` | text | NO | Check-in time (e.g., "2:00 PM") |
| `NEW Date Check-out Time` | text | NO | Check-out time (e.g., "11:00 AM") |
| `💰Nightly Host Rate for 2 nights` | numeric | YES | 2-night rate |
| `💰Damage Deposit` | integer | NO | Damage deposit amount |
| `💰Cleaning Cost / Maintenance Fee` | integer | YES | Cleaning/maintenance fee |
| `Active` | boolean | YES | Listing is active |
| `Approved` | boolean | YES | Listing approved by admin |

**Relationship:**
- `Host / Landlord` → `user._id`

---

#### TABLE: `proposal`
**Primary Key:** `_id` (text)

**Key Fields for Guest Proposals:**
| Field Name | Data Type | Nullable | Purpose |
|-----------|-----------|----------|---------|
| `_id` | text | NO | Primary identifier |
| `Guest` | text | YES | → `user._id` (FK) |
| `Listing` | text | YES | → `listing._id` (FK) |
| `Host - Account` | text | YES | → `account_host._id` |
| `Status` | text | NO | Proposal status |
| `Deleted` | boolean | YES | Soft delete flag |
| `Days Selected` | jsonb | YES | Array of day names |
| `Nights Selected (Nights list)` | jsonb | YES | Array of nights |
| `Move in range start` | text | NO | Move-in start date |
| `Move in range end` | text | NO | Move-in end date |
| `Reservation Span (Weeks)` | integer | NO | Duration in weeks |
| `nights per week (num)` | integer | NO | Nights per week |
| `check in day` | text | YES | Check-in day name |
| `check out day` | text | YES | Check-out day name |
| `Total Price for Reservation (guest)` | numeric | NO | Total guest price |
| `proposal nightly price` | numeric | YES | Per-night price |
| `cleaning fee` | integer | YES | Cleaning fee |
| `damage deposit` | integer | YES | Damage deposit |
| `host compensation` | integer | YES | Host compensation |
| `Created Date` | timestamptz | NO | Creation timestamp |
| `Modified Date` | timestamptz | NO | Last modified |

**Host Counteroffer Fields (hc_ prefix):**
| Field Name | Data Type | Nullable | Purpose |
|-----------|-----------|----------|---------|
| `hc days selected` | jsonb | YES | Host's day selection |
| `hc move in date` | timestamptz | YES | Host's move-in date |
| `hc reservation span (weeks)` | integer | YES | Host's duration |
| `hc nights per week` | integer | YES | Host's nights/week |
| `hc check in day` | text | YES | Host's check-in day |
| `hc check out day` | text | YES | Host's check-out day |
| `hc total price` | numeric | YES | Host's total price |
| `hc nightly price` | numeric | YES | Host's nightly price |
| `hc cleaning fee` | integer | YES | Host's cleaning fee |
| `hc damage deposit` | integer | YES | Host's damage deposit |
| `counter offer happened` | boolean | YES | Flag if counteroffer exists |

**Progress/Status Fields:**
| Field Name | Data Type | Nullable | Purpose |
|-----------|-----------|----------|---------|
| `rental app requested` | boolean | NO | Rental app requested |
| `rental application` | text | YES | → rental_application._id |
| `guest documents review finalized?` | boolean | YES | Guest docs reviewed |
| `host documents review finalized?` | boolean | YES | Host docs reviewed |
| `Is Finalized` | boolean | NO | Proposal finalized flag |
| `virtual meeting` | text | YES | → virtual_meetings.id |
| `virtual meeting confirmed` | boolean | YES | VM confirmed flag |

**Relationships:**
- `Guest` → `user._id`
- `Listing` → `listing._id`
- `Host - Account` → `account_host._id`
- `virtual meeting` → `virtual_meetings.id`

---

#### TABLE: `virtual_meetings`
**Primary Key:** `id` (text, auto-generated UUID)

**Key Fields:**
| Field Name | Data Type | Nullable | Default | Purpose |
|-----------|-----------|----------|---------|---------|
| `id` | text | NO | gen_random_uuid() | Primary identifier |
| `proposal_id` | text | YES | null | → `proposal._id` (FK) |
| `requested_by` | text | YES | null | → `user._id` (FK) |
| `booked_date` | timestamp | YES | null | Meeting date/time |
| `confirmed_by_splitlease` | boolean | YES | false | SL confirmation |
| `meeting_declined` | boolean | YES | false | Declined flag |
| `meeting_link` | text | YES | null | Meeting URL |
| `unique_id` | varchar | YES | null | Unique identifier |
| `created_at` | timestamp | YES | now() | Creation time |
| `updated_at` | timestamp | YES | now() | Last update |

**Relationships:**
- `proposal_id` → `proposal._id`
- `requested_by` → `user._id`

---

## Part 2: Field Mapping Configuration

### 2.1 Verified Field Mappings for Base Page

Based on Bubble screenshots and verified schema, here's the complete field mapping:

```javascript
// config/fieldMappings.js

export const FIELD_MAPPINGS = {
  // ============================================
  // PROPOSAL CARD - HEADER SECTION
  // ============================================
  proposalHeader: {
    listingTitle: 'listing.Name',              // ✓ Verified
    listingLocation: {
      full: 'listing.Location - Address',      // ✓ Verified (jsonb)
      borough: 'listing.Location - Borough',   // ✓ Verified
      hood: 'listing.Location - Hood',         // ✓ Verified
      city: 'listing.Location - City'          // ✓ Verified
    }
  },

  // ============================================
  // PROPOSAL CARD - SCHEDULE SECTION
  // ============================================
  schedule: {
    // Guest's original proposal
    daysSelected: 'Days Selected',                    // ✓ Verified (jsonb array)
    nightsSelected: 'Nights Selected (Nights list)',  // ✓ Verified (jsonb array)
    reservationWeeks: 'Reservation Span (Weeks)',     // ✓ Verified (integer)
    nightsPerWeek: 'nights per week (num)',           // ✓ Verified (integer)

    // Host's counteroffer (if exists)
    hc_daysSelected: 'hc days selected',              // ✓ Verified (jsonb array)
    hc_reservationWeeks: 'hc reservation span (weeks)', // ✓ Verified (integer)
    hc_nightsPerWeek: 'hc nights per week',          // ✓ Verified (integer)

    // Check if counteroffer exists
    hasCounteroffer: 'counter offer happened'         // ✓ Verified (boolean)
  },

  // ============================================
  // PROPOSAL CARD - DATES SECTION
  // ============================================
  dates: {
    // Guest's dates
    checkInDay: 'check in day',                    // ✓ Verified (text - day name)
    checkOutDay: 'check out day',                  // ✓ Verified (text - day name)
    moveInStart: 'Move in range start',            // ✓ Verified (text - date)
    moveInEnd: 'Move in range end',                // ✓ Verified (text - date)

    // Listing's check-in/out times
    checkInTime: 'listing.NEW Date Check-in Time',  // ✓ Verified (text - "2:00 PM")
    checkOutTime: 'listing.NEW Date Check-out Time', // ✓ Verified (text - "11:00 AM")

    // Host's counteroffer dates
    hc_checkInDay: 'hc check in day',              // ✓ Verified
    hc_checkOutDay: 'hc check out day',            // ✓ Verified
    hc_moveInDate: 'hc move in date'               // ✓ Verified (timestamptz)
  },

  // ============================================
  // PROPOSAL CARD - HOST SECTION
  // ============================================
  host: {
    id: 'listing.Host / Landlord',                      // ✓ Verified → user._id
    firstName: 'user.Name - First',                     // ✓ Verified (via join)
    lastName: 'user.Name - Last',                       // ✓ Verified (via join)
    fullName: 'user.Name - Full',                       // ✓ Verified (via join)
    profilePhoto: 'user.Profile Photo',                 // ✓ Verified (via join)
    bio: 'user.About Me / Bio',                         // ✓ Verified (via join)

    // Verification badges
    linkedInVerified: 'user.Verify - Linked In ID',     // ✓ Verified (truthy check)
    phoneVerified: 'user.Verify - Phone',               // ✓ Verified (boolean)
    identityVerified: 'user.user verified?',            // ✓ Verified (boolean)
    emailVerified: 'user.is email confirmed'            // ✓ Verified (boolean)
  },

  // ============================================
  // PROPOSAL CARD - HOUSE RULES SECTION
  // ============================================
  houseRules: {
    rules: 'listing.Features - House Rules',       // ✓ Verified (jsonb array)
    // Possible host counteroffer rules
    hc_rules: 'hc house rules'                     // ✓ Verified (jsonb array)
  },

  // ============================================
  // PROPOSAL CARD - PRICING SECTION
  // ============================================
  pricing: {
    // Guest's original pricing
    totalPrice: 'Total Price for Reservation (guest)',  // ✓ Verified (numeric)
    nightlyPrice: 'proposal nightly price',              // ✓ Verified (numeric)
    cleaningFee: 'cleaning fee',                         // ✓ Verified (integer)
    damageDeposit: 'damage deposit',                     // ✓ Verified (integer)

    // Host's counteroffer pricing
    hc_totalPrice: 'hc total price',                     // ✓ Verified (numeric)
    hc_nightlyPrice: 'hc nightly price',                 // ✓ Verified (numeric)
    hc_cleaningFee: 'hc cleaning fee',                   // ✓ Verified (integer)
    hc_damageDeposit: 'hc damage deposit',               // ✓ Verified (integer)

    // From listing (fallback/reference)
    listingDamageDeposit: 'listing.💰Damage Deposit',         // ✓ Verified (integer)
    listingMaintenanceFee: 'listing.💰Cleaning Cost / Maintenance Fee' // ✓ Verified (integer)
  },

  // ============================================
  // PROPOSAL CARD - LISTING IMAGES
  // ============================================
  images: {
    photos: 'listing.Features - Photos'            // ✓ Verified (jsonb array of photo IDs)
    // Note: Will need to join with listing_photo table for actual URLs
  },

  // ============================================
  // PROPOSAL CARD - STATUS & METADATA
  // ============================================
  status: {
    currentStatus: 'Status',                       // ✓ Verified (text)
    isDeleted: 'Deleted',                          // ✓ Verified (boolean)
    isFinalized: 'Is Finalized',                   // ✓ Verified (boolean)

    // Progress tracking
    rentalAppRequested: 'rental app requested',    // ✓ Verified (boolean)
    guestDocsFinalized: 'guest documents review finalized?', // ✓ Verified (boolean)
    hostDocsFinalized: 'host documents review finalized?',   // ✓ Verified (boolean)

    // Virtual meeting status
    hasVirtualMeeting: 'virtual meeting',          // ✓ Verified (text - meeting ID)
    vmConfirmed: 'virtual meeting confirmed',      // ✓ Verified (boolean)

    // Timestamps
    createdAt: 'Created Date',                     // ✓ Verified (timestamptz)
    modifiedAt: 'Modified Date'                    // ✓ Verified (timestamptz)
  },

  // ============================================
  // GUEST INFO (from URL parameter)
  // ============================================
  guest: {
    id: 'Guest',                                   // ✓ Verified → user._id
    firstName: 'user.Name - First',                // ✓ Verified (via join)
    lastName: 'user.Name - Last',                  // ✓ Verified (via join)
    email: 'user.email as text',                   // ✓ Verified
    phone: 'user.Phone Number (as text)'           // ✓ Verified
  }
};
```

---

## Part 3: Supabase Query Strategy

### 3.1 Base Query for Proposal List

```sql
-- Query to get all proposals for a guest with related data
SELECT
  p._id as proposal_id,
  p."Status" as status,
  p."Deleted" as deleted,
  p."Days Selected" as days_selected,
  p."Nights Selected (Nights list)" as nights_selected,
  p."Reservation Span (Weeks)" as reservation_weeks,
  p."nights per week (num)" as nights_per_week,
  p."check in day" as check_in_day,
  p."check out day" as check_out_day,
  p."Move in range start" as move_in_start,
  p."Move in range end" as move_in_end,
  p."Total Price for Reservation (guest)" as total_price,
  p."proposal nightly price" as nightly_price,
  p."cleaning fee" as cleaning_fee,
  p."damage deposit" as damage_deposit,
  p."counter offer happened" as has_counteroffer,
  p."hc days selected" as hc_days_selected,
  p."hc reservation span (weeks)" as hc_reservation_weeks,
  p."hc nights per week" as hc_nights_per_week,
  p."hc check in day" as hc_check_in_day,
  p."hc check out day" as hc_check_out_day,
  p."hc move in date" as hc_move_in_date,
  p."hc total price" as hc_total_price,
  p."hc nightly price" as hc_nightly_price,
  p."hc cleaning fee" as hc_cleaning_fee,
  p."hc damage deposit" as hc_damage_deposit,
  p."rental app requested" as rental_app_requested,
  p."guest documents review finalized?" as guest_docs_finalized,
  p."host documents review finalized?" as host_docs_finalized,
  p."Is Finalized" as is_finalized,
  p."virtual meeting" as virtual_meeting_id,
  p."virtual meeting confirmed" as vm_confirmed,
  p."Created Date" as created_at,
  p."Modified Date" as modified_at,

  -- Listing data
  l._id as listing_id,
  l."Name" as listing_name,
  l."Description" as listing_description,
  l."Location - Address" as listing_address,
  l."Location - Borough" as listing_borough,
  l."Location - Hood" as listing_hood,
  l."Location - City" as listing_city,
  l."Features - Photos" as listing_photos,
  l."Features - House Rules" as house_rules,
  l."NEW Date Check-in Time" as check_in_time,
  l."NEW Date Check-out Time" as check_out_time,
  l."💰Damage Deposit" as listing_damage_deposit,
  l."💰Cleaning Cost / Maintenance Fee" as listing_maintenance_fee,

  -- Host data (from user table via listing)
  host."_id" as host_id,
  host."Name - First" as host_first_name,
  host."Name - Last" as host_last_name,
  host."Name - Full" as host_full_name,
  host."Profile Photo" as host_profile_photo,
  host."About Me / Bio" as host_bio,
  host."Verify - Linked In ID" as host_linkedin_verified,
  host."Verify - Phone" as host_phone_verified,
  host."user verified?" as host_identity_verified,
  host."is email confirmed" as host_email_verified,

  -- Virtual meeting data (if exists)
  vm.id as vm_id,
  vm.booked_date as vm_booked_date,
  vm.confirmed_by_splitlease as vm_confirmed_by_sl,
  vm.meeting_declined as vm_declined,
  vm.meeting_link as vm_link

FROM proposal p
LEFT JOIN listing l ON p."Listing" = l._id
LEFT JOIN "user" host ON l."Host / Landlord" = host._id
LEFT JOIN virtual_meetings vm ON p."virtual meeting" = vm.id
WHERE p."Guest" = $1  -- Guest user ID from URL
  AND (p."Deleted" IS NULL OR p."Deleted" = false)
ORDER BY p."Created Date" DESC;
```

### 3.2 Supabase JavaScript Client Query

```javascript
// Using Supabase JS Client
const { data: proposals, error } = await supabase
  .from('proposal')
  .select(`
    _id,
    Status,
    Deleted,
    Days Selected:Days Selected,
    Nights Selected (Nights list):Nights Selected (Nights list),
    Reservation Span (Weeks):Reservation Span (Weeks),
    nights per week (num):nights per week (num),
    check in day:check in day,
    check out day:check out day,
    Move in range start:Move in range start,
    Move in range end:Move in range end,
    Total Price for Reservation (guest):Total Price for Reservation (guest),
    proposal nightly price:proposal nightly price,
    cleaning fee:cleaning fee,
    damage deposit:damage deposit,
    counter offer happened:counter offer happened,
    hc days selected:hc days selected,
    hc reservation span (weeks):hc reservation span (weeks),
    hc nights per week:hc nights per week,
    hc check in day:hc check in day,
    hc check out day:hc check out day,
    hc move in date:hc move in date,
    hc total price:hc total price,
    hc nightly price:hc nightly price,
    hc cleaning fee:hc cleaning fee,
    hc damage deposit:hc damage deposit,
    rental app requested:rental app requested,
    guest documents review finalized?:guest documents review finalized?,
    host documents review finalized?:host documents review finalized?,
    Is Finalized:Is Finalized,
    virtual meeting:virtual meeting,
    virtual meeting confirmed:virtual meeting confirmed,
    Created Date:Created Date,
    Modified Date:Modified Date,

    listing:Listing (
      _id,
      Name,
      Description,
      Location - Address:Location - Address,
      Location - Borough:Location - Borough,
      Location - Hood:Location - Hood,
      Location - City:Location - City,
      Features - Photos:Features - Photos,
      Features - House Rules:Features - House Rules,
      NEW Date Check-in Time:NEW Date Check-in Time,
      NEW Date Check-out Time:NEW Date Check-out Time,
      💰Damage Deposit:💰Damage Deposit,
      💰Cleaning Cost / Maintenance Fee:💰Cleaning Cost / Maintenance Fee,

      host:Host / Landlord (
        _id,
        Name - First:Name - First,
        Name - Last:Name - Last,
        Name - Full:Name - Full,
        Profile Photo:Profile Photo,
        About Me / Bio:About Me / Bio,
        Verify - Linked In ID:Verify - Linked In ID,
        Verify - Phone:Verify - Phone,
        user verified?:user verified?,
        is email confirmed:is email confirmed
      )
    ),

    virtual_meeting:virtual meeting (
      id,
      booked_date,
      confirmed_by_splitlease,
      meeting_declined,
      meeting_link
    )
  `)
  .eq('Guest', guestUserId)
  .or('Deleted.is.null,Deleted.eq.false')
  .order('Created Date', { ascending: false });
```

---

## Part 4: Implementation Phases

### Phase 1: Data Layer Setup (Week 1 - Days 1-2)

**Goal:** Configure Supabase integration with verified schema

#### Step 1.1: Create Field Configuration File
```javascript
// src/lib/supabase/fieldMappings.js
// Copy the FIELD_MAPPINGS constant from Part 2.1
```

#### Step 1.2: Create Supabase Query Functions
```javascript
// src/lib/supabase/proposalQueries.js

import { supabase } from './supabase.js';
import { FIELD_MAPPINGS } from './fieldMappings.js';

export async function fetchGuestProposals(guestUserId) {
  const { data, error } = await supabase
    .from('proposal')
    .select(/* Query from 3.2 */);

  if (error) throw error;
  return data;
}

export async function updateProposalStatus(proposalId, newStatus) {
  const { data, error } = await supabase
    .from('proposal')
    .update({ 'Status': newStatus, 'Modified Date': new Date() })
    .eq('_id', proposalId);

  if (error) throw error;
  return data;
}

export async function softDeleteProposal(proposalId) {
  const { data, error } = await supabase
    .from('proposal')
    .update({ 'Deleted': true, 'Modified Date': new Date() })
    .eq('_id', proposalId);

  if (error) throw error;
  return data;
}
```

#### Step 1.3: Create Data Transformation Layer
```javascript
// src/lib/supabase/dataTransformers.js

/**
 * Transform raw Supabase data to component-friendly format
 */
export function transformProposalData(rawProposal) {
  return {
    id: rawProposal._id,
    status: rawProposal.Status,
    isDeleted: rawProposal.Deleted || false,

    schedule: {
      daysSelected: rawProposal['Days Selected'] || [],
      reservationWeeks: rawProposal['Reservation Span (Weeks)'],
      nightsPerWeek: rawProposal['nights per week (num)'],
      hasCounteroffer: rawProposal['counter offer happened'] || false,
      hc_daysSelected: rawProposal['hc days selected'] || null,
      hc_reservationWeeks: rawProposal['hc reservation span (weeks)'] || null
    },

    dates: {
      checkInDay: rawProposal['check in day'],
      checkOutDay: rawProposal['check out day'],
      moveInStart: rawProposal['Move in range start'],
      moveInEnd: rawProposal['Move in range end'],
      checkInTime: rawProposal.listing?.['NEW Date Check-in Time'],
      checkOutTime: rawProposal.listing?.['NEW Date Check-out Time']
    },

    pricing: {
      totalPrice: parseFloat(rawProposal['Total Price for Reservation (guest)']),
      nightlyPrice: parseFloat(rawProposal['proposal nightly price']),
      cleaningFee: rawProposal['cleaning fee'],
      damageDeposit: rawProposal['damage deposit'],
      hc_totalPrice: rawProposal['hc total price'] ? parseFloat(rawProposal['hc total price']) : null,
      hc_nightlyPrice: rawProposal['hc nightly price'] ? parseFloat(rawProposal['hc nightly price']) : null
    },

    listing: {
      id: rawProposal.listing?._id,
      name: rawProposal.listing?.Name,
      description: rawProposal.listing?.Description,
      address: rawProposal.listing?.['Location - Address'],
      borough: rawProposal.listing?.['Location - Borough'],
      hood: rawProposal.listing?.['Location - Hood'],
      photos: rawProposal.listing?.['Features - Photos'] || [],
      houseRules: rawProposal.listing?.['Features - House Rules'] || []
    },

    host: {
      id: rawProposal.listing?.host?._id,
      firstName: rawProposal.listing?.host?.['Name - First'],
      lastName: rawProposal.listing?.host?.['Name - Last'],
      fullName: rawProposal.listing?.host?.['Name - Full'],
      profilePhoto: rawProposal.listing?.host?.['Profile Photo'],
      bio: rawProposal.listing?.host?.['About Me / Bio'],
      verified: {
        linkedin: !!rawProposal.listing?.host?.['Verify - Linked In ID'],
        phone: rawProposal.listing?.host?.['Verify - Phone'] || false,
        identity: rawProposal.listing?.host?.['user verified?'] || false,
        email: rawProposal.listing?.host?.['is email confirmed'] || false
      }
    },

    progress: {
      rentalAppRequested: rawProposal['rental app requested'] || false,
      guestDocsFinalized: rawProposal['guest documents review finalized?'] || false,
      hostDocsFinalized: rawProposal['host documents review finalized?'] || false,
      isFinalized: rawProposal['Is Finalized'] || false
    },

    virtualMeeting: rawProposal.virtual_meeting ? {
      id: rawProposal.virtual_meeting.id,
      bookedDate: rawProposal.virtual_meeting.booked_date,
      confirmed: rawProposal.virtual_meeting.confirmed_by_splitlease,
      declined: rawProposal.virtual_meeting.meeting_declined,
      link: rawProposal.virtual_meeting.meeting_link
    } : null,

    metadata: {
      createdAt: rawProposal['Created Date'],
      modifiedAt: rawProposal['Modified Date']
    }
  };
}
```

**Deliverable:** Data layer with verified field mappings

---

### Phase 2: Header Component (Week 1 - Days 3-4)

**Goal:** Build complete header matching Bubble design

#### Component Structure:
```jsx
// src/islands/shared/Header.jsx

export default function Header({ currentUser, unreadMessageCount }) {
  return (
    <header className="header">
      <div className="header-container">
        {/* Left: Logo + Hamburger */}
        <div className="header-left">
          <button className="hamburger-menu">☰</button>
          <a href="/" className="header-logo">
            <img src="/logo.svg" alt="Split Lease" />
          </a>
        </div>

        {/* Center: Navigation */}
        <nav className="header-nav">
          <div className="nav-dropdown">
            <button className="nav-trigger">
              Stay with Us <span>▼</span>
            </button>
            {/* Dropdown menu */}
          </div>
        </nav>

        {/* Right: Messages + Button + Profile */}
        <div className="header-right">
          <a href="/messages" className="message-icon">
            <span className="icon">✉️</span>
            {unreadMessageCount > 0 && (
              <span className="badge">{unreadMessageCount}</span>
            )}
          </a>

          <a href="/explore" className="btn btn-white">
            Explore Rentals
          </a>

          <div className="user-profile">
            <img src={currentUser.profilePhoto} alt={currentUser.name} />
            <span>{currentUser.firstName}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
```

**Styles:**
```css
/* Purple header background */
.header {
  background: #2E1065; /* Dark purple from Bubble */
  color: white;
  padding: 1rem 0;
}

.message-icon .badge {
  background: #EF4444; /* Red for notification count */
  position: absolute;
  top: -8px;
  right: -8px;
}

.btn-white {
  background: white;
  color: #2E1065;
  padding: 0.5rem 1.5rem;
  border-radius: 0.5rem;
}
```

**Deliverable:** Fully functional purple header with navigation

---

### Phase 3: Footer Component (Week 1 - Day 5)

**Goal:** Build complete footer matching Bubble design

#### Component Structure:
```jsx
// src/islands/shared/Footer.jsx

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Three columns */}
        <div className="footer-column">
          <h3>For Guests</h3>
          <a href="/explore">Explore Split Leases</a>
          <a href="/success-stories">Success Stories</a>
          <a href="/speak-to-agent">Speak to an Agent</a>
          <a href="/faq">View FAQ</a>
        </div>

        <div className="footer-column">
          <h3>Company</h3>
          <a href="/about">About Periodic Tenancy</a>
          <a href="/team">About the Team</a>
          <a href="/careers">Careers at Split Lease</a>
          <a href="/blog">View Blog</a>
        </div>

        <div className="footer-column">
          <h3>Refer a friend</h3>
          <p>You get $50 and they get $50 *after their first booking</p>
          <div className="referral-options">
            <label><input type="radio" name="method" /> Text</label>
            <label><input type="radio" name="method" /> Email</label>
            <label><input type="radio" name="method" /> Link</label>
          </div>
          <input type="email" placeholder="Your friend's email address" />
          <button className="btn btn-primary">Share now</button>
        </div>
      </div>

      <div className="footer-emergency">
        <button className="btn btn-danger-large">Emergency assistance</button>
      </div>

      <div className="footer-bottom">
        <p>© 2025 SplitLease</p>
      </div>
    </footer>
  );
}
```

**Deliverable:** Complete footer with all sections

---

### Phase 4: Proposal Selector Component (Week 2 - Days 1-2)

**Goal:** Dropdown that lists all proposals

#### Component:
```jsx
// src/components/proposals/ProposalSelector.jsx

export default function ProposalSelector({
  proposals,
  selectedProposalId,
  onSelect
}) {
  return (
    <div className="proposal-selector">
      <h2>My Proposals ({proposals.length})</h2>
      <select
        value={selectedProposalId}
        onChange={(e) => onSelect(e.target.value)}
        className="proposal-dropdown"
      >
        {proposals.map(proposal => (
          <option key={proposal.id} value={proposal.id}>
            {proposal.host.firstName} - {proposal.listing.name}
          </option>
        ))}
      </select>
    </div>
  );
}
```

**Deliverable:** Functional proposal selector dropdown

---

### Phase 5: Proposal Card - Layout & Structure (Week 2 - Days 3-5)

**Goal:** Build main proposal card matching Bubble layout exactly

#### Component Structure:
```jsx
// src/components/proposals/ProposalCard.jsx

export default function ProposalCard({ proposal }) {
  return (
    <div className="proposal-card">
      {/* Hero Image with Overlay */}
      <ProposalHero
        listing={proposal.listing}
        host={proposal.host}
      />

      {/* Listing Header */}
      <ProposalHeader listing={proposal.listing} />

      {/* Schedule Display */}
      <ScheduleDisplay
        schedule={proposal.schedule}
        hasCounteroffer={proposal.schedule.hasCounteroffer}
      />

      {/* Dates Section */}
      <DatesSection dates={proposal.dates} />

      {/* Host Section */}
      <HostSection host={proposal.host} />

      {/* House Rules */}
      <HouseRulesSection rules={proposal.listing.houseRules} />

      {/* Pricing */}
      <PricingSection pricing={proposal.pricing} />

      {/* Action Buttons */}
      <ActionButtons
        proposalId={proposal.id}
        status={proposal.status}
        hasVirtualMeeting={!!proposal.virtualMeeting}
      />

      {/* Progress Tracker */}
      <ProgressTracker
        status={proposal.status}
        progress={proposal.progress}
      />

      {/* Metadata */}
      <ProposalMetadata metadata={proposal.metadata} />
    </div>
  );
}
```

**Sub-components to build:**
1. `ProposalHero` - Large image with host overlay
2. `ProposalHeader` - Title and location with action buttons
3. `ScheduleDisplay` - Day badges with schedule text
4. `DatesSection` - Check-in/out dates and times
5. `HostSection` - Host card with profile and buttons
6. `HouseRulesSection` - Expandable/badge grid house rules
7. `PricingSection` - Pricing breakdown
8. `ActionButtons` - Status-based action buttons
9. `ProgressTracker` - 6-stage progress visualization
10. `ProposalMetadata` - Created/modified dates

**Deliverable:** Complete proposal card structure

---

### Phase 6: Status-Based Conditional Rendering (Week 3 - Days 1-3)

**Goal:** Different UI based on proposal status

#### Status Logic:
```javascript
// src/lib/utils/statusHelpers.js

export const PROPOSAL_STATUSES = {
  SUBMITTED: 'Proposal Submitted',
  AWAITING_REVIEW: 'Awaiting Host Review',
  RENTAL_APP_SUBMITTED: 'Rental App Submitted',
  HOST_REVIEW: 'Host Review',
  REVIEW_DOCUMENTS: 'Review Documents',
  LEASE_DOCUMENTS: 'Lease Documents',
  PAYMENT: 'Initial Payment',
  ACCEPTED: 'Accepted',
  COMPLETED: 'Completed',
  CANCELLED_GUEST: 'Cancelled by Guest',
  CANCELLED_HOST: 'Cancelled by Host',
  EXPIRED: 'Expired'
};

export function getProposalActions(status, progress) {
  const actions = [];

  switch(status) {
    case PROPOSAL_STATUSES.SUBMITTED:
    case PROPOSAL_STATUSES.AWAITING_REVIEW:
      actions.push('REQUEST_VIRTUAL_MEETING');
      actions.push('MODIFY_PROPOSAL');
      actions.push('CANCEL_PROPOSAL');
      break;

    case PROPOSAL_STATUSES.ACCEPTED:
    case PROPOSAL_STATUSES.COMPLETED:
      actions.push('GO_TO_LEASES');
      break;

    case PROPOSAL_STATUSES.CANCELLED_GUEST:
    case PROPOSAL_STATUSES.CANCELLED_HOST:
    case PROPOSAL_STATUSES.EXPIRED:
      actions.push('DELETE');
      break;

    default:
      actions.push('REQUEST_VIRTUAL_MEETING');
      actions.push('CANCEL_PROPOSAL');
  }

  return actions;
}

export function getStatusBanner(status) {
  if (status === PROPOSAL_STATUSES.ACCEPTED || status === PROPOSAL_STATUSES.COMPLETED) {
    return {
      type: 'success',
      message: 'Your lease agreement is now officially signed. For details, please visit the lease section of your account.'
    };
  }

  return null;
}
```

#### Conditional Rendering Component:
```jsx
// src/components/proposals/ActionButtons.jsx

import { getProposalActions } from '../../lib/utils/statusHelpers';

export default function ActionButtons({ proposalId, status, progress }) {
  const actions = getProposalActions(status, progress);

  return (
    <div className="action-buttons">
      {actions.includes('REQUEST_VIRTUAL_MEETING') && (
        <button className="btn btn-secondary" onClick={handleRequestVM}>
          Request Virtual Meeting
        </button>
      )}

      {actions.includes('MODIFY_PROPOSAL') && (
        <button className="btn btn-success" onClick={handleModify}>
          Modify Proposal
        </button>
      )}

      {actions.includes('CANCEL_PROPOSAL') && (
        <button className="btn btn-danger" onClick={handleCancel}>
          Cancel Proposal
        </button>
      )}

      {actions.includes('GO_TO_LEASES') && (
        <button className="btn btn-success-large" onClick={handleGoToLeases}>
          Go to Leases
        </button>
      )}

      {actions.includes('DELETE') && (
        <button className="btn btn-danger" onClick={handleDelete}>
          Delete
        </button>
      )}
    </div>
  );
}
```

**Deliverable:** Status-aware UI with conditional buttons

---

### Phase 7: Styling & Visual Polish (Week 3 - Days 4-5)

**Goal:** Match Bubble design pixel-perfect

#### Key Visual Elements:
1. **Purple color scheme throughout**
   - Primary: `#2E1065` (header)
   - Accent: `#7C3AED` (buttons, links)
   - Success: `#10B981` (green buttons)
   - Danger: `#EF4444` (red buttons/badges)

2. **Hero image overlay**
   - Semi-transparent purple/blue overlay
   - Host profile buttons overlaid on image
   - Rounded corners

3. **Day badges**
   - Circular badges
   - Purple for selected, gray for unselected
   - White text on selected

4. **Progress tracker**
   - Connected circles
   - Purple/blue for completed
   - Green for current stage
   - Gray for future stages

5. **Typography**
   - Clear hierarchy
   - Bold headings
   - Light body text

**Deliverable:** Pixel-perfect match to Bubble design

---

### Phase 8: Mobile Responsive Layout (Week 4 - Days 1-3)

**Goal:** Mobile card-list view matching Pass3 screenshot

#### Mobile-Specific Layout:
```jsx
// src/components/proposals/MobileProposalList.jsx

export default function MobileProposalList({ proposals }) {
  return (
    <div className="mobile-proposal-list">
      <div className="mobile-map-container">
        {/* Map placeholder for future */}
        <p>Click on the marker to be taken to its proposal</p>
      </div>

      <div className="mobile-proposals-header">
        <h2>Proposals ({proposals.length})</h2>
      </div>

      <div className="mobile-proposal-cards">
        {proposals.map(proposal => (
          <MobileProposalCard key={proposal.id} proposal={proposal} />
        ))}
      </div>
    </div>
  );
}

function MobileProposalCard({ proposal }) {
  return (
    <div className="mobile-proposal-card">
      <div className="mobile-card-image">
        {/* Listing thumbnail */}
      </div>

      <div className="mobile-card-content">
        <div className="mobile-card-host">
          <img src={proposal.host.profilePhoto} alt={proposal.host.fullName} />
          <div>
            <strong>{proposal.host.firstName}</strong>
            <p>{proposal.listing.name}</p>
          </div>
        </div>

        <div className="mobile-card-status">
          {proposal.status === 'Cancelled' ? (
            <span className="status-cancelled">Cancelled!</span>
          ) : proposal.status === 'Accepted' ? (
            <span className="status-accepted">Accepted!</span>
          ) : null}
        </div>

        {proposal.pricing.nightlyPrice && (
          <div className="mobile-card-price">
            ${proposal.pricing.nightlyPrice}/night
          </div>
        )}

        <div className="mobile-card-schedule">
          {/* Day badges */}
        </div>

        {proposal.status === 'Cancelled' && (
          <button className="btn btn-danger-small">Delete</button>
        )}
      </div>
    </div>
  );
}
```

**Responsive Breakpoints:**
```css
/* Mobile: < 768px */
@media (max-width: 768px) {
  .desktop-view { display: none; }
  .mobile-view { display: block; }

  .mobile-proposal-card {
    display: flex;
    padding: 1rem;
    border-bottom: 1px solid #E5E7EB;
  }
}

/* Desktop: >= 768px */
@media (min-width: 768px) {
  .desktop-view { display: block; }
  .mobile-view { display: none; }
}
```

**Deliverable:** Mobile-optimized card list view

---

### Phase 9: Error Handling & Loading States (Week 4 - Days 4-5)

**Goal:** Proper UX for all states

#### Loading States:
```jsx
// src/components/proposals/LoadingState.jsx

export default function LoadingState() {
  return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Loading your proposals...</p>
    </div>
  );
}
```

#### Error States:
```jsx
// src/components/proposals/ErrorState.jsx

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="error-state">
      <div className="error-message">
        <h2>Unable to Load Proposals</h2>
        <p>{error.message}</p>
        <button className="btn btn-primary" onClick={onRetry}>
          Try Again
        </button>
      </div>
    </div>
  );
}
```

#### Empty States:
```jsx
// src/components/proposals/EmptyState.jsx

export default function EmptyState() {
  return (
    <div className="empty-state">
      <h2>No Proposals Yet</h2>
      <p>You don't have any proposals submitted yet. Start exploring rentals to find your perfect Split Lease!</p>
      <a href="/explore" className="btn btn-primary">Explore Rentals</a>
    </div>
  );
}
```

**Deliverable:** Complete error/loading/empty state handling

---

## Part 5: Testing & Verification Checklist

### 5.1 Data Integrity Tests

- [ ] All field mappings verified against Supabase schema
- [ ] Joins correctly fetch related data (user, listing, virtual_meetings)
- [ ] Null/undefined values handled gracefully
- [ ] JSONB arrays parse correctly (days_selected, house_rules, photos)
- [ ] Numeric fields format correctly (prices, weeks, counts)
- [ ] Date/timestamp fields display in correct timezone
- [ ] Boolean flags work correctly (deleted, verified, etc.)

### 5.2 UI Component Tests

- [ ] Header displays user info correctly
- [ ] Footer has all links and sections
- [ ] Proposal selector dropdown works
- [ ] Proposal card shows all sections
- [ ] Hero image loads and overlay displays
- [ ] Day badges show correct selection
- [ ] Schedule text generates correctly
- [ ] Host profile displays with verification badges
- [ ] House rules render (both list and badge view)
- [ ] Pricing shows all fees correctly
- [ ] Action buttons appear based on status
- [ ] Progress tracker highlights correct stage
- [ ] Metadata shows formatted dates

### 5.3 Status-Based Rendering Tests

- [ ] "Proposal Submitted" shows correct actions
- [ ] "Awaiting Review" shows correct actions
- [ ] "Accepted" shows green banner + "Go to Leases"
- [ ] "Cancelled" shows only "Delete" button
- [ ] Counteroffer data displays when present
- [ ] Virtual meeting data shows when exists

### 5.4 Responsive Design Tests

- [ ] Desktop view works (>= 768px)
- [ ] Mobile card list view works (< 768px)
- [ ] All touch targets are 44px minimum
- [ ] Text is readable on all screen sizes
- [ ] Images scale appropriately

### 5.5 Edge Cases

- [ ] Proposal with no host (orphaned)
- [ ] Proposal with no listing (orphaned)
- [ ] Proposal with no virtual meeting
- [ ] Proposal with counteroffer
- [ ] Proposal with empty house rules
- [ ] Proposal with no listing photos
- [ ] Very long listing names
- [ ] Very large price amounts
- [ ] Guest with no proposals

---

## Part 6: File Structure

```
guest-proposals/
├── src/
│   ├── islands/
│   │   ├── pages/
│   │   │   └── ProposalsIsland.jsx           # Main page island
│   │   └── shared/
│   │       ├── Header.jsx                    # NEW - Purple header
│   │       └── Footer.jsx                    # NEW - Complete footer
│   │
│   ├── components/
│   │   └── proposals/
│   │       ├── ProposalSelector.jsx          # NEW - Dropdown selector
│   │       ├── ProposalCard.jsx              # NEW - Main card component
│   │       ├── ProposalHero.jsx              # NEW - Hero image + overlay
│   │       ├── ProposalHeader.jsx            # NEW - Title + location
│   │       ├── ScheduleDisplay.jsx           # NEW - Day badges + text
│   │       ├── DatesSection.jsx              # NEW - Check-in/out dates
│   │       ├── HostSection.jsx               # NEW - Host card
│   │       ├── HouseRulesSection.jsx         # NEW - Rules display
│   │       ├── PricingSection.jsx            # NEW - Pricing breakdown
│   │       ├── ActionButtons.jsx             # NEW - Status-based buttons
│   │       ├── ProgressTracker.jsx           # NEW - Progress visualization
│   │       ├── ProposalMetadata.jsx          # NEW - Timestamps
│   │       ├── StatusBanner.jsx              # NEW - Status notifications
│   │       ├── MobileProposalList.jsx        # NEW - Mobile view
│   │       ├── MobileProposalCard.jsx        # NEW - Mobile card
│   │       ├── LoadingState.jsx              # NEW - Loading UI
│   │       ├── ErrorState.jsx                # NEW - Error UI
│   │       └── EmptyState.jsx                # NEW - Empty UI
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── supabase.js                   # ✓ Existing
│   │   │   ├── fieldMappings.js              # NEW - Verified field config
│   │   │   ├── proposalQueries.js            # NEW - Query functions
│   │   │   └── dataTransformers.js           # NEW - Data transformers
│   │   ├── utils/
│   │   │   ├── statusHelpers.js              # NEW - Status logic
│   │   │   └── formatters.js                 # NEW - Format helpers
│   │   └── constants.js                      # ⚠️ Expand existing
│   │
│   └── styles/
│       ├── main.css                          # ⚠️ Update existing
│       ├── components/
│       │   ├── header.css                    # NEW
│       │   ├── footer.css                    # NEW
│       │   ├── proposals.css                 # NEW
│       │   └── mobile.css                    # NEW
│       └── responsive.css                    # NEW
│
├── index.html                                # ⚠️ Update for header/footer
└── package.json                              # Check dependencies
```

---

## Part 7: Dependencies Check

Verify these are in `package.json`:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.x.x"
  }
}
```

No additional dependencies needed for base page implementation.

---

## Part 8: Implementation Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1: Data Layer | 2 days | Verified field config + queries |
| Phase 2: Header | 2 days | Purple header with nav |
| Phase 3: Footer | 1 day | Complete footer |
| Phase 4: Selector | 2 days | Proposal dropdown |
| Phase 5: Proposal Card | 3 days | Main card structure |
| Phase 6: Status Logic | 3 days | Conditional rendering |
| Phase 7: Visual Polish | 2 days | Pixel-perfect styling |
| Phase 8: Mobile | 3 days | Mobile responsive |
| Phase 9: Error Handling | 2 days | All states |
| **TOTAL** | **20 days** | **Complete base page** |

**Estimated:** 4 weeks (20 business days) for complete base page implementation

---

## Part 9: Success Criteria

Base page is complete when:

✅ All verified Supabase fields are correctly mapped
✅ Header matches Bubble design (purple, nav, messages, profile)
✅ Footer matches Bubble design (3 columns, referral, emergency)
✅ Proposal selector dropdown works
✅ Proposal card displays all sections
✅ Hero image with host overlay displays
✅ Schedule section shows day badges + text
✅ Dates section shows check-in/out info
✅ Host section shows profile + verification badges
✅ House rules render correctly
✅ Pricing shows all fees
✅ Action buttons appear based on status
✅ Progress tracker shows correct stage
✅ Status banners display when appropriate
✅ Counteroffer data shows when present
✅ Mobile card-list view works
✅ Loading/error/empty states handle edge cases
✅ All data comes from verified Supabase schema

---

## Next Steps

1. **Review this plan** with stakeholders
2. **Verify Supabase credentials** are properly configured
3. **Start Phase 1** - Create field mappings configuration
4. **Build incrementally** - Complete each phase before moving to next
5. **Test continuously** - Verify each component against Bubble screenshots
6. **Document deviations** - Note any schema differences discovered

**Remember:** This plan covers ONLY the base page layer. Modals, popups, messaging interface, and chat widget will be separate implementation phases.
