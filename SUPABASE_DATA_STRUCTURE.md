# Supabase Data Structure for Guest Proposals Page

## Summary
This document describes the Supabase database structure for the guest-proposals page, including table relationships, key fields, and sample data.

---

## Key Tables

### 1. `user` Table (Main User Table)
This is the primary user table storing all user information.

**Primary Key:** `_id` (text)

**Key Fields:**
- `_id` - Unique user identifier (e.g., "1690295492449x299828112091012700")
- `Name - Full` - User's full name (e.g., "Ava Brooks")
- `Name - First` - First name
- `Name - Last` - Last name
- `email as text` - User's email address
- `Profile Photo` - URL to profile photo
- `authentication` - JSONB field containing authentication info:
  ```json
  {
    "email": {
      "email": "user@example.com",
      "email_confirmed": true
    },
    "LinkedIn": {
      "email": "user@example.com",
      "id": "linkedInId"
    }
  }
  ```
- `Account - Guest` - Reference to account_guest table (if user is a guest)
- `Account - Host / Landlord` - Reference to account_host table (if user is a host)
- `Created Date` - Timestamp of account creation
- `Modified Date` - Last modification timestamp

---

### 2. `proposal` Table (Rental Proposals)
This table stores all rental proposals submitted by guests to hosts.

**Primary Key:** `_id` (text)

**Key Relationship Fields:**
- `_id` - Unique proposal identifier
- `Guest` - **References `user._id`** (the guest who created the proposal)
- `Guest email` - Email of the guest (denormalized for quick access)
- `Host - Account` - References `account_host._id` (the host account)
- `host email` - Email of the host (denormalized)
- `Listing` - **References `listing._id`** (the property listing)

**Status Field:**
- `Status` - Current proposal status (possible values):
  - "Pending"
  - "Proposal Submitted by guest - Awaiting Rental Application"
  - "Host Review"
  - "Host Counteroffer Submitted / Awaiting Guest Review"
  - "Proposal or Counteroffer Accepted / Drafting Lease Documents"
  - "Lease Documents Sent for Review"
  - "Initial Payment Submitted / Lease activated"
  - "Proposal Rejected by Host"
  - "Proposal Cancelled by Guest"
  - "Proposal Cancelled by Split Lease"

**Reservation Details:**
- `check in day` - Day of week for check-in (e.g., "Monday")
- `check out day` - Day of week for check-out (e.g., "Thursday")
- `nights per week (num)` - Number of nights per week (integer)
- `Reservation Span (Weeks)` - Total weeks of reservation (integer)
- `Move in range start` - Start of move-in date range
- `Move in range end` - End of move-in date range
- `Nights Selected (Nights list)` - JSONB array of selected nights

**Pricing Fields:**
- `Total Price for Reservation (guest)` - Total price guest pays (numeric)
- `Total Compensation (proposal - host)` - Total compensation to host (numeric)
- `proposal nightly price` - Nightly rate for the proposal (numeric)
- `4 week rent` - Four-week rent amount (numeric)
- `damage deposit` - Security deposit amount (integer)
- `cleaning fee` - Cleaning fee (integer)

**Timestamps:**
- `Created Date` - When proposal was created
- `Modified Date` - Last modification time

**Other Important Fields:**
- `Comment` - Guest's message/comment
- `about_yourself` - Guest's self-description
- `special_needs` - Any special needs mentioned by guest
- `House Rules` - JSONB array of house rules
- `Deleted` - Boolean flag for soft deletion

---

### 3. `listing` Table (Property Listings)
Stores property listings from hosts.

**Primary Key:** `_id` (text)

**Key Fields:**
- `_id` - Unique listing identifier
- `Name` - Listing name/title
- `Description` - Full property description
- `Host / Landlord` - **References `account_host._id`**
- `Location - Address` - JSONB with address, lat, lng:
  ```json
  {
    "address": "25 Gold St, New York, NY 10038, USA",
    "lat": 40.7081164,
    "lng": -74.0066287
  }
  ```
- `Location - City` - Reference to city
- `Location - Borough` - Borough identifier
- `Features - Type of Space` - Type of space reference
- `Features - Qty Bedrooms` - Number of bedrooms
- `Features - Qty Bathrooms` - Number of bathrooms
- `Features - Qty Guests` - Max number of guests
- `Active` - Boolean for listing availability
- `💰Weekly Host Rate` - Weekly rate for host

---

### 4. `account_host` Table (Host Accounts)
Additional host-specific information.

**Primary Key:** `_id` (text)

**Key Fields:**
- `_id` - Unique host account identifier
- `User` - **References `user._id`**
- `Listings` - JSONB array of listing IDs
- `AboutMe` - Host bio/description
- `AVG Response Time (hours)` - Average response time
- `Receptivity` - Host receptivity score

---

### 5. `account_guest` Table (Guest Accounts)
Additional guest-specific information.

**Primary Key:** `_id` (text)

**Key Fields:**
- `_id` - Unique guest account identifier
- `User` - **References `user._id`**
- `Email` - Guest email
- `Quick Message` - Pre-written message template
- `Curation Requirements` - JSONB array of requirements

---

## Data Relationships

### Guest Proposals Flow

```
user (as guest)
  ↓ (user._id = proposal.Guest)
proposal
  ↓ (proposal.Listing = listing._id)
listing
  ↓ (listing."Host / Landlord" = account_host._id)
account_host
  ↓ (account_host.User = user._id)
user (as host)
```

---

## Sample Query: Get Guest's Proposals with Listing Info

```sql
SELECT
    p._id as proposal_id,
    p."Status",
    p."Created Date",
    p."check in day",
    p."check out day",
    p."nights per week (num)",
    p."Reservation Span (Weeks)",
    p."Total Price for Reservation (guest)",
    l."Name" as listing_name,
    l."Location - Address" as listing_address,
    u_host."Name - Full" as host_name
FROM proposal p
LEFT JOIN listing l ON p."Listing" = l._id
LEFT JOIN account_host ah ON p."Host - Account" = ah._id
LEFT JOIN "user" u_host ON ah."User" = u_host._id
WHERE p."Guest" = '<user_id>'
ORDER BY p."Created Date" DESC;
```

---

## Sample Data Example

**User (Guest):**
- ID: `1690295492449x299828112091012700`
- Name: `Ava Brooks`
- Email: `robert+guest11@rtcbook.com`

**Proposal:**
- ID: `1690315193610x636193493000773100`
- Status: `Host Review`
- Guest: `1690295492449x299828112091012700`
- Check-in: `Monday`
- Check-out: `Thursday`
- Nights/week: `3`
- Duration: `16 weeks`
- Total Price: `$15,158.94`

**Listing:**
- ID: `1690313575906x293284747808079900`
- Name: `STUNNING STUDIO IN THE HEART OF THE FINANCIAL DISTRICT`
- Address: `25 Gold St, New York, NY 10038, USA`

---

## Important Notes

1. **Field Naming Convention**: Bubble.io fields use spaces and special characters (e.g., `"Name - Full"`, `"💰Weekly Host Rate"`)
2. **JSONB Fields**: Many fields store complex data as JSONB (arrays, objects)
3. **Denormalization**: Email fields are duplicated in proposals for performance
4. **Soft Deletes**: Use `Deleted` boolean flag instead of hard deletes
5. **IDs are Text**: All primary keys are text-based unique identifiers
6. **User Table**: The main user table is `user` (not `_User` or `users`)
7. **Authentication**: Email stored in both `email as text` and `authentication` JSONB field

---

## Key Insights for Guest Proposals Page

1. **User Identification**: Use `user._id` to identify the logged-in guest
2. **Proposals Query**: Filter `proposal` table by `proposal.Guest = user._id`
3. **Listing Details**: Join with `listing` table using `proposal.Listing = listing._id`
4. **Host Info**: Join through `account_host` to get host user details
5. **Status Tracking**: Use `proposal.Status` to show proposal state
6. **Pricing**: Display from `proposal."Total Price for Reservation (guest)"`
