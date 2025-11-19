# Guest Proposals Page - Standalone Implementation

A standalone HTML/CSS/JavaScript page for viewing and managing guest rental proposals, built without authentication and integrated with Supabase.

## Features

✅ **URL Parameter Support** - Load specific proposals via `?proposal=<id>`
✅ **Proposal Listing** - View all proposals in a dropdown
✅ **Detailed View** - Complete proposal information including:
- Listing details and location
- Schedule visualization (day badges)
- Check-in/Check-out dates and times
- Host information
- House rules
- Pricing breakdown
- 6-stage progress tracker
- Proposal metadata

✅ **Actions** - Cancel and delete proposals (soft delete)
✅ **Responsive Design** - Mobile-friendly layout
✅ **No Authentication** - Direct data access without login

## Project Structure

```
guest-proposals/
├── index.html       # Main HTML structure
├── styles.css       # Complete styling
├── app.js          # JavaScript logic and Supabase integration
└── README.md       # This file
```

## Setup Instructions

### 1. Prerequisites

- Supabase account and project
- Basic web server to serve the HTML file (or just open in browser)

### 2. Supabase Configuration

#### A. Create Database Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_first VARCHAR(255),
    name_last VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    profile_photo TEXT,
    bio TEXT,
    linkedin_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    identity_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES users(id),
    name TEXT NOT NULL,
    location TEXT,
    address TEXT,
    borough TEXT,
    check_in_time TEXT,
    check_out_time TEXT,
    house_rules JSONB,
    images TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Proposals table
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id),
    guest_id UUID REFERENCES users(id),
    host_id UUID REFERENCES users(id),

    -- Original proposal
    move_in_range_start DATE,
    move_in_range_end DATE,
    reservation_span_weeks INT,
    days_selected TEXT[],
    nights_per_week INT,
    check_in_day TEXT,
    check_out_day TEXT,
    total_price DECIMAL(10,2),
    nightly_price DECIMAL(10,2),
    cleaning_fee DECIMAL(10,2),
    damage_deposit DECIMAL(10,2),

    -- Host counteroffer (nullable)
    hc_move_in_date DATE,
    hc_reservation_span_weeks INT,
    hc_days_selected TEXT[],
    hc_nights_per_week INT,
    hc_check_in_day TEXT,
    hc_check_out_day TEXT,
    hc_total_price DECIMAL(10,2),
    hc_nightly_price DECIMAL(10,2),
    hc_cleaning_fee DECIMAL(10,2),
    hc_damage_deposit DECIMAL(10,2),

    -- Status and progress
    status VARCHAR(255) DEFAULT 'Proposal Submitted',
    current_stage INT DEFAULT 1,
    completed_stages INT[],

    -- Metadata
    is_suggested_by_host BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    reason_for_cancellation TEXT,

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Virtual Meetings table
CREATE TABLE virtual_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id),
    booked_date TIMESTAMP,
    confirmed_by_splitlease BOOLEAN DEFAULT FALSE,
    meeting_declined BOOLEAN DEFAULT FALSE,
    meeting_link TEXT,
    unique_id VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_proposals_guest ON proposals(guest_id);
CREATE INDEX idx_proposals_deleted ON proposals(deleted);
CREATE INDEX idx_listings_host ON listings(host_id);
CREATE INDEX idx_vm_proposal ON virtual_meetings(proposal_id);
```

#### B. Set Row Level Security (Optional)

Since you're building without authentication, you can either:

1. **Disable RLS** (simpler for development):
```sql
ALTER TABLE proposals DISABLE ROW LEVEL SECURITY;
ALTER TABLE listings DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_meetings DISABLE ROW LEVEL SECURITY;
```

2. **Or create permissive policies** (more secure):
```sql
-- Enable RLS
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for anon access
CREATE POLICY "Allow public read" ON proposals FOR SELECT USING (true);
CREATE POLICY "Allow public update" ON proposals FOR UPDATE USING (true);
CREATE POLICY "Allow public read" ON listings FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON users FOR SELECT USING (true);
```

#### C. Insert Sample Data

```sql
-- Insert a sample host
INSERT INTO users (id, name_first, name_last, email, profile_photo)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Samuel',
    'Richards',
    'samuel@example.com',
    'https://via.placeholder.com/80'
);

-- Insert a sample guest
INSERT INTO users (id, name_first, name_last, email)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    'Jacques',
    'Miller',
    'jacques@example.com'
);

-- Insert a sample listing
INSERT INTO listings (id, host_id, name, location, address, borough, check_in_time, check_out_time, house_rules)
VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'Beautiful Apt in Carnegie Hill',
    'Carnegie Hill, Manhattan',
    '123 Madison Ave, New York, NY 10028',
    'Manhattan',
    '2:00 PM',
    '11:00 AM',
    '["No Smoking Inside", "No Pets", "Quiet Hours After 10 PM"]'::jsonb
);

-- Insert a sample proposal
INSERT INTO proposals (
    id,
    listing_id,
    guest_id,
    host_id,
    move_in_range_start,
    reservation_span_weeks,
    days_selected,
    nights_per_week,
    check_in_day,
    check_out_day,
    total_price,
    nightly_price,
    cleaning_fee,
    damage_deposit,
    current_stage,
    completed_stages
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    '2025-07-21',
    26,
    ARRAY['Sunday', 'Monday'],
    2,
    'Sunday',
    'Monday',
    29278.72,
    375.37,
    50.00,
    500.00,
    2,
    ARRAY[1]
);
```

### 3. Configure the Application

Edit `app.js` and replace the Supabase configuration:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

You can find these values in your Supabase project:
- Go to **Project Settings** → **API**
- Copy the **URL** and **anon public** key

### 4. Add Supabase CDN

Add this script tag to your `index.html` before the closing `</body>` tag:

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="app.js"></script>
```

### 5. Run the Application

**Option A: Simple File Open**
- Open `index.html` directly in your browser
- Note: Some features may not work due to CORS

**Option B: Local Server (Recommended)**
```bash
# Python 3
python -m http.server 8000

# Node.js (npx)
npx http-server -p 8000

# PHP
php -S localhost:8000
```

Then navigate to `http://localhost:8000`

## Usage

### View All Proposals
Simply open the page. It will load all proposals and display them in the dropdown.

### View Specific Proposal
Add a URL parameter:
```
http://localhost:8000/?proposal=00000000-0000-0000-0000-000000000004
```

### Select Different Proposal
Use the dropdown at the top to switch between proposals.

## Key Features Explained

### URL Parameter Support
The page checks for a `?proposal=<id>` parameter on load and automatically selects that proposal if found.

### Dual Proposal System
The database schema supports both:
- **Original proposal** - Guest's submitted terms
- **Counteroffer (hc_*)** - Host's modified terms

### Soft Delete
Proposals are never hard deleted. The `deleted` boolean flag is set to `true` instead, preserving data for audit trails.

### Progress Tracker
6-stage linear progression:
1. Proposal Submitted
2. Rental App Submitted
3. Host Review
4. Review Documents
5. Lease Documents
6. Initial Payment

## Customization

### Styling
Edit `styles.css` to customize:
- Colors (CSS variables at top)
- Fonts
- Layout and spacing
- Responsive breakpoints

### Functionality
Edit `app.js` to modify:
- Supabase queries
- Data transformations
- Button behaviors
- Modal implementations

## Next Steps

### Recommended Enhancements
1. **Virtual Meeting System** - Implement the 5-workflow VM state machine
2. **Compare Terms Modal** - Show original vs counteroffer side-by-side
3. **Host Profile Modal** - Display host verification, bio, reviews
4. **Maps Integration** - Add Google Maps popup
5. **Messaging** - Implement messaging interface
6. **Form Validation** - Add client-side validation
7. **Error Handling** - Improve error messaging
8. **Loading States** - Add skeleton screens

### Advanced Features
- Real-time updates using Supabase subscriptions
- Image galleries for listings
- Calendar integration for virtual meetings
- Document upload and review
- Payment integration

## Troubleshooting

### Proposals Not Loading
- Check browser console for errors
- Verify Supabase URL and key are correct
- Ensure RLS policies allow reading
- Check if sample data was inserted

### CORS Errors
- Use a local web server instead of opening file directly
- Check Supabase project settings for allowed origins

### Styling Issues
- Verify `styles.css` is loaded
- Check browser developer tools for CSS errors
- Clear browser cache

## Database Schema Reference

### Key Tables
- **proposals** - Main proposal data (original + counteroffer)
- **listings** - Property information
- **users** - Host and guest information
- **virtual_meetings** - Meeting scheduling data

### Important Fields
- `deleted` - Soft delete flag (filter this in all queries)
- `days_selected` - Array of day names (e.g., ['Sunday', 'Monday'])
- `completed_stages` - Array of completed progress stage IDs
- `hc_*` - Host-changed (counteroffer) fields (nullable)

## Architecture Notes

### No Authentication
Per project requirements, this page does NOT implement authentication. In production, you would:
1. Add user authentication (Supabase Auth)
2. Filter proposals by current user
3. Implement proper authorization checks

### State Management
Simple vanilla JavaScript state management:
- `state.proposals` - All proposals
- `state.selectedProposal` - Currently displayed proposal
- `state.loading` - Loading state
- `state.error` - Error state

### Data Flow
1. URL parameters checked on load
2. Supabase query fetches proposals with related data
3. First proposal selected (or URL-specified one)
4. UI populated from selected proposal
5. User interactions trigger Supabase updates
6. Page reloads data after mutations

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Original Design Documentation](./input/guest-proposals/)

## License

Internal Split Lease project - All rights reserved

## Support

For questions or issues, refer to the comprehensive documentation in the `input/guest-proposals/` directory.
