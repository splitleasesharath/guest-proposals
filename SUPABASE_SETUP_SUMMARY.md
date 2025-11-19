# Supabase Database Setup Summary - Guest Proposals Page

## Setup Completion Status: ✅ SUCCESS

All required database tables, indexes, RLS policies, and sample data have been successfully created.

---

## Database Tables Created

### 1. **users** table
Stores user account information for both guests and hosts.

**Fields:**
- `id` (UUID, Primary Key)
- `name_first` (VARCHAR 255)
- `name_last` (VARCHAR 255)
- `email` (VARCHAR 255, UNIQUE)
- `profile_photo` (TEXT)
- `bio` (TEXT)
- `linkedin_verified` (BOOLEAN, default: false)
- `phone_verified` (BOOLEAN, default: false)
- `email_verified` (BOOLEAN, default: false)
- `identity_verified` (BOOLEAN, default: false)
- `created_at` (TIMESTAMP, auto)
- `updated_at` (TIMESTAMP, auto-updated)

**Row Count:** 2 sample users

---

### 2. **listings** table
Contains property listings available for rent.

**Fields:**
- `id` (UUID, Primary Key)
- `host_id` (UUID, references users)
- `name` (TEXT, required)
- `location` (TEXT)
- `address` (TEXT)
- `borough` (TEXT)
- `check_in_time` (TEXT)
- `check_out_time` (TEXT)
- `house_rules` (JSONB)
- `images` (TEXT[])
- `created_at` (TIMESTAMP, auto)
- `updated_at` (TIMESTAMP, auto-updated)

**Indexes:**
- `idx_listings_host` on `host_id`

**Row Count:** 1 sample listing

---

### 3. **proposals** table
Stores guest proposals with optional host counteroffers.

**Fields:**
- `id` (UUID, Primary Key)
- `listing_id` (UUID, references listings)
- `guest_id` (UUID, references users)
- `host_id` (UUID, references users)
- `move_in_range_start` (DATE)
- `move_in_range_end` (DATE)
- `reservation_span_weeks` (INT)
- `days_selected` (TEXT[])
- `nights_per_week` (INT)
- `check_in_day` (TEXT)
- `check_out_day` (TEXT)
- `total_price` (DECIMAL 10,2)
- `nightly_price` (DECIMAL 10,2)
- `cleaning_fee` (DECIMAL 10,2)
- `damage_deposit` (DECIMAL 10,2)

**Host Counteroffer Fields (hc_ prefix):**
- `hc_move_in_date` (DATE, nullable)
- `hc_reservation_span_weeks` (INT, nullable)
- `hc_days_selected` (TEXT[], nullable)
- `hc_nights_per_week` (INT, nullable)
- `hc_check_in_day` (TEXT, nullable)
- `hc_check_out_day` (TEXT, nullable)
- `hc_total_price` (DECIMAL 10,2, nullable)
- `hc_nightly_price` (DECIMAL 10,2, nullable)
- `hc_cleaning_fee` (DECIMAL 10,2, nullable)
- `hc_damage_deposit` (DECIMAL 10,2, nullable)

**Status & Tracking Fields:**
- `status` (VARCHAR 255, default: 'Proposal Submitted')
- `current_stage` (INT, default: 1)
- `completed_stages` (INT[])
- `is_suggested_by_host` (BOOLEAN, default: false)
- `deleted` (BOOLEAN, default: false)
- `reason_for_cancellation` (TEXT)
- `created_at` (TIMESTAMP, auto)
- `updated_at` (TIMESTAMP, auto-updated)

**Indexes:**
- `idx_proposals_guest` on `guest_id`
- `idx_proposals_deleted` on `deleted`

**Row Count:** 2 sample proposals (different statuses)

---

### 4. **virtual_meetings** table
Manages virtual meeting schedules between guests and hosts.

**Fields:**
- `id` (UUID, Primary Key)
- `proposal_id` (UUID, references proposals, CASCADE DELETE)
- `requested_by` (UUID, references users, CASCADE DELETE)
- `booked_date` (TIMESTAMP)
- `confirmed_by_splitlease` (BOOLEAN, default: false)
- `meeting_declined` (BOOLEAN, default: false)
- `meeting_link` (TEXT)
- `unique_id` (VARCHAR 50, UNIQUE)
- `created_at` (TIMESTAMP, auto)
- `updated_at` (TIMESTAMP, auto-updated)

**Indexes:**
- `idx_vm_proposal` on `proposal_id`

**Row Count:** 0 (empty, ready for use)

---

## Row Level Security (RLS) Policies

All tables have RLS enabled with appropriate access policies:

### **users** table policies:
- ✅ Public read access for all users
- ✅ Users can update their own profiles

### **listings** table policies:
- ✅ Public read access for all listings
- ✅ Hosts can insert their own listings
- ✅ Hosts can update their own listings

### **proposals** table policies:
- ✅ Guests and hosts can view their own proposals
- ✅ Anonymous users can insert proposals (for guest flow)
- ✅ Guests can update their proposals
- ✅ Hosts can update proposals for their listings

### **virtual_meetings** table policies:
- ✅ Users can view meetings they're involved in
- ✅ Users can create meetings they requested
- ✅ Users can update their own meetings

---

## Sample Data Inserted

### Sample Users:
1. **Sarah Johnson** (Host)
   - Email: sarah.host@example.com
   - ID: 1a6a168a-ed31-4b4a-ba54-ec3d7ae543be
   - Status: Email & phone verified

2. **Michael Chen** (Guest)
   - Email: michael.guest@example.com
   - ID: 34222eda-c5c6-4506-96b9-1c1e1abead5b
   - Status: Email verified

### Sample Listing:
- **Cozy Studio in Upper West Side**
  - ID: 2eaf81ea-0134-4a99-a97d-ae041e0746bd
  - Host: Sarah Johnson
  - Location: Upper West Side, Manhattan
  - Check-in: 3:00 PM | Check-out: 11:00 AM

### Sample Proposals:
1. **Proposal 1** (Status: Proposal Submitted)
   - Move-in: Dec 1-7, 2025
   - Duration: 12 weeks
   - Nights/week: 4 (Mon-Thu)
   - Total: $4,800.00

2. **Proposal 2** (Status: Host Countered)
   - Move-in: Jan 15-21, 2026
   - Duration: 8 weeks
   - Nights/week: 3 (Sun-Tue)
   - Total: $2,400.00

---

## Environment Variables

Copy the following to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qcfifybkaddcoimjroca.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmlmeWJrYWRkY29pbWpyb2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NzU0MDUsImV4cCI6MjA3NTA1MTQwNX0.glGwHxds0PzVLF1Y8VBGX0jYz3zrLsgE9KAWWwkYms8
```

---

## Migrations Applied

The following migrations were successfully created:

1. ✅ `create_users_table` - Users table with auto-updating timestamps
2. ✅ `create_listings_table` - Listings with host references
3. ✅ `create_proposals_table` - Proposals with counteroffer fields
4. ✅ `create_virtual_meetings_for_proposals` - Virtual meetings table
5. ✅ `enable_rls_for_guest_proposals_tables` - RLS policies for all tables

---

## Security Advisors Status

**Before:** 4 ERROR warnings for missing RLS on new tables
**After:** ✅ All RLS policies enabled and configured

The security advisors will show warnings for other existing Bubble.io tables, but the new tables for the guest proposals page are fully secured.

See security recommendations at: https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public

---

## Database Features

- ✅ Foreign key constraints with CASCADE delete
- ✅ Automatic timestamp updates via triggers
- ✅ UUID primary keys for all tables
- ✅ Performance indexes on frequently queried columns
- ✅ JSONB support for flexible data (house_rules)
- ✅ Array types for multi-select data (days_selected, images)
- ✅ Row Level Security enabled with granular policies

---

## Next Steps

1. Copy `.env.example` to `.env.local` in your project root
2. Install Supabase client: `npm install @supabase/supabase-js`
3. Initialize Supabase client in your app
4. Start building your guest proposals page!

## Example Usage

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Fetch all proposals for a guest
const { data: proposals } = await supabase
  .from('proposals')
  .select('*, listings(*), users(*)')
  .eq('guest_id', guestId)
  .eq('deleted', false)

// Insert a new proposal
const { data, error } = await supabase
  .from('proposals')
  .insert({
    listing_id: listingId,
    guest_id: guestId,
    host_id: hostId,
    move_in_range_start: '2025-12-01',
    move_in_range_end: '2025-12-07',
    // ... other fields
  })
```

---

## Support

For questions or issues, refer to:
- Supabase Docs: https://supabase.com/docs
- RLS Guide: https://supabase.com/docs/guides/auth/row-level-security

---

**Setup completed on:** 2025-11-19
**Database:** qcfifybkaddcoimjroca.supabase.co
