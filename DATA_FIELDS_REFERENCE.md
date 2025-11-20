# Guest Proposals - Available Data Fields Reference

## Overview
This document outlines all available data fields from the database tables that can be used to build the guest proposals UI.

## Sample Proposal Data
Based on proposal ID: `1750633423997x237785609501373060`

### Core Proposal Fields

#### Status & Lifecycle
- **Status**: `"Proposal Cancelled by Split Lease"`
- **reason for cancellation**: `null` (text)
- **Is Finalized**: `false` (boolean)
- **Created Date**: `"2025-06-22 23:03:44.003+00"` (timestamp)
- **Modified Date**: `"2025-07-13 23:04:06.428+00"` (timestamp)

#### Schedule & Dates
- **Days Selected**: `["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]` (jsonb)
- **Nights Selected (Nights list)**: `["Monday", "Tuesday", "Wednesday", "Thursday"]` (jsonb)
- **check in day**: `"Monday"` (text)
- **check out day**: `"Friday"` (text)
- **Move in range start**: `"2025-07-07T23:02:51.931Z"` (timestamp)
- **Move in range end**: `"2025-07-21T23:02:51.931Z"` (timestamp)
- **Reservation Span (Weeks)**: `13` (integer)
- **duration in months**: `2.93548387` (numeric)
- **nights per week (num)**: `4` (integer)

#### Pricing
- **Total Price for Reservation (guest)**: `9510.967741935485` (numeric)
- **proposal nightly price**: `182.90322580645162` (numeric)

#### Related Records
- **Guest**: `"1750632723678x195782532953450160"` (text - user ID)
- **Guest email**: `"brenlynn1@yahoo.com"` (text)
- **Listing**: `"1707849799514x971102594326593500"` (text - listing ID)
- **rental application**: `"1750633660388x823695215150235600"` (text - rental app ID)
- **virtual meeting**: `"1750633557328x486557509705457300"` (text - virtual meeting ID)

#### Virtual Meeting Fields
- **request virtual meeting**: `"guest"` (text - who requested: "guest" or "host")
- **virtual meeting confirmed**: `null` (boolean)

### All Available Proposal Table Fields

The `proposal` table contains these additional fields that may be useful:

#### Counter Offer Fields (prefixed with "hc")
- hc 4 week compensation
- hc 4 week rent
- hc check in day
- hc check out day
- hc cleaning fee
- hc damage deposit
- hc days selected
- hc duration in months
- hc host compensation (per period)
- hc house rules
- hc move in date
- hc nightly price
- hc nights per week
- hc nights selected
- hc reservation span
- hc reservation span (weeks)
- hc total host compensation
- hc total price
- hc weeks schedule

#### Pricing & Financial
- 4 week compensation (integer)
- 4 week rent (numeric)
- cleaning fee (integer)
- damage deposit (integer)
- host compensation (integer)
- Total Compensation (proposal - host) (numeric)

#### Dates & Timing
- End date (timestamp)
- flexible move in? (boolean)
- move-in range (text)
- night after checkin night (text)
- night before checkout night (text)
- list of dates (actual dates) (jsonb)

#### Documents & Reviews
- Draft Authorization Credit Card (text)
- Draft Host Payout Schedule (text)
- Draft Periodic Tenancy Agreement (text)
- Draft Supplemental Agreement (text)
- Drafts List (jsonb)
- guest documents review finalized? (boolean)
- host documents review finalized? (boolean)

#### User Preferences & Requirements
- about_yourself (text)
- need for space (text)
- special_needs (text)
- preferred gender (text)
- Guest flexibility (text)

#### Tracking & Metrics
- reminderByHost (integer)
- remindersByGuest (number) (integer)
- viewed proposed proposal (boolean)
- reviewed by frederick (boolean)
- reviewed by igor (boolean)
- reviewed by robert (boolean)

#### Location
- Location - Address (jsonb)
- Location - Address slightly different (jsonb)

#### House Rules & Agreements
- House Rules (jsonb)
- rental type (text)
- rental app requested (boolean)

#### History & Updates
- History (jsonb)
- Negotiation Summary (jsonb)
- proposal update message (text)

#### Scheduling
- Scheduled workflow expiration (text)
- Scheduled workflow expiration reminder (text)
- week selection (text)
- actual weeks during reservation span (integer)
- other weeks (integer)

#### Additional Data
- Comment (text)
- Complementary Days (jsonb)
- Complementary Nights (jsonb)
- Days Available (jsonb)
- Reservation Span (text)
- nightly price for map (text)
- counter offer happened (boolean)

## Virtual Meetings Table Structure

Table: `virtual_meetings`

### Fields Available:
- **id**: text (primary key - note: NOT _id)
- **proposal_id**: text (foreign key to proposal)
- **requested_by**: text (who requested the meeting)
- **meeting_link**: text (URL for the meeting)
- **booked_date**: timestamp (when the meeting is scheduled)
- **confirmed_by_splitlease**: boolean
- **meeting_declined**: boolean
- **unique_id**: varchar
- **created_at**: timestamp
- **updated_at**: timestamp

**Note**: The sample virtual meeting ID `1750633557328x486557509705457300` doesn't exist in the virtual_meetings table, suggesting it may reference a different table or the data hasn't been migrated yet.

## Rental Application Table Structure

Table: `rentalapplication`

### Sample Data (ID: 1750633660388x823695215150235600):
```json
{
  "_id": "1750633660388x823695215150235600",
  "name": "Brenda Johnson",
  "email": null,
  "phone number": "4086795525",
  "DOB": "1962-02-12T05:00:00.000Z",
  "submitted": true,
  "percentage % done": null,
  "employment status": "Full-time Employee",
  "employer name": "ABC industries",
  "job title": "Manager",
  "employer phone number": "3124568800",
  "Monthly Income": 10000,
  "proof of employment": "https://...jpeg",
  "permanent address": {
    "address": "1350 E Main St, Woodland, CA 95776, USA",
    "lat": 38.67607539999999,
    "lng": -121.7598112
  },
  "length resided": "6",
  "linkedin": "https://www.linkedin.com/in/brendajohn1/",
  "signature (text)": "Brenda Johnson",
  "pets": true,
  "smoking": null,
  "parking": null,
  "renting": false,
  "zep-progress": "review"
}
```

### All Rental Application Fields:
- **Personal Info**: name, email, phone number, DOB, linkedin
- **Employment**: employment status, employer name, employer phone number, job title, Monthly Income, proof of employment
- **Housing**: permanent address (jsonb), length resided, renting (boolean)
- **Preferences**: pets (boolean), smoking (boolean), parking (boolean)
- **Documents**: State ID - Front, State ID - Back, government ID, passport, proof of employment, signature
- **Business Info** (if applicable): business legal name, state business registered, year business was created?
- **Progress Tracking**: submitted (boolean), percentage % done, progress NEW (list), zep-progress
- **Additional**: occupants list (jsonb), references (jsonb), credit score, alternate guarantee
- **Signatures**: signature (file), signature (text)
- **Metadata**: Created By, Created Date, Modified Date, created_at, updated_at

## UI Implementation Notes

### Key Data Points for Guest Proposals Page:

1. **Proposal Header**:
   - Status
   - Created Date / Modified Date
   - Guest email

2. **Schedule Information**:
   - Move in range (start/end)
   - Check in/out days
   - Nights selected per week
   - Duration in weeks/months
   - Total reservation span

3. **Pricing Display**:
   - Nightly price
   - Total price for reservation
   - 4 week rent (if applicable)

4. **Rental Application Status**:
   - Whether submitted
   - Completion percentage
   - Review status (zep-progress)

5. **Virtual Meeting Status**:
   - Whether requested (and by whom)
   - Meeting link (if available)
   - Confirmation status
   - Scheduled date

6. **Actions Available**:
   - Based on Status field
   - Based on Is Finalized flag
   - Based on document review statuses

### Status Values to Handle:
Based on the sample data, the Status field can contain values like:
- "Proposal Cancelled by Split Lease"
- (Other possible values should be identified from the database)

### Boolean Flags for UI Logic:
- `Is Finalized`: Determines if proposal can be edited
- `flexible move in?`: Show flexibility indicator
- `rental app requested`: Show rental app section
- `virtual meeting confirmed`: Show meeting confirmation status
- `guest documents review finalized?`: Document review status
- `viewed proposed proposal`: Tracking flag

## Data Fetching Strategy

1. **Primary Query**: Fetch proposal by ID
2. **Join/Lookup**:
   - Rental application (if `rental application` field is not null)
   - Virtual meeting details (if `virtual meeting` field is not null)
   - Guest user details (via `Guest` field)
   - Listing details (via `Listing` field)

3. **Null Handling**:
   - Many fields are nullable
   - UI should gracefully handle missing data
   - Consider default states for incomplete proposals
