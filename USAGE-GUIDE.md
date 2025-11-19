# Guest Proposals Page - Usage Guide

## Quick Start

Your Supabase database is already configured and running! The page is ready to use.

## URL Formats

The page supports multiple URL formats to identify the current user:

### Method 1: Query Parameter (Recommended)
```
http://localhost:8000/?user=c959ce3a-ea43-4a02-bd98-c1af4e04c0a8
```

### Method 2: Path Parameter
```
http://localhost:8000/c959ce3a-ea43-4a02-bd98-c1af4e04c0a8
```

### Method 3: Combined with Proposal ID
```
http://localhost:8000/?user=c959ce3a-ea43-4a02-bd98-c1af4e04c0a8&proposal=PROPOSAL_ID
```

### Method 4: No User ID (Uses Default)
```
http://localhost:8000/
```
Falls back to sample guest user: `c959ce3a-ea43-4a02-bd98-c1af4e04c0a8`

## Sample User IDs

Your database has been populated with sample users:

### Guest User (Jacques)
```
c959ce3a-ea43-4a02-bd98-c1af4e04c0a8
```

### Host User (Sarah)
```
b0cefa5b-87e4-42d8-b94e-06cce22d2d16
```

## Sample URLs to Test

### View All Proposals for Guest
```
http://localhost:8000/?user=c959ce3a-ea43-4a02-bd98-c1af4e04c0a8
```

### View Specific Proposal
```
http://localhost:8000/?user=c959ce3a-ea43-4a02-bd98-c1af4e04c0a8&proposal=PROPOSAL_ID
```

### Using Path Parameter
```
http://localhost:8000/c959ce3a-ea43-4a02-bd98-c1af4e04c0a8
```

## How It Works

### 1. URL Parsing
The application extracts the user ID from the URL using this priority:
1. Query parameter `?user=USER_ID`
2. UUID pattern in URL path
3. Falls back to `CONFIG.sampleUsers.guest`

### 2. Data Loading
- Fetches proposals WHERE `guest_id = current_user_id` AND `deleted = false`
- Includes related data: listing, host, virtual meetings
- Orders by creation date (newest first)

### 3. Proposal Display
- Shows all proposals in dropdown
- Displays selected proposal details
- Filters all operations by current user

## Configuration Files

### config.js (Already Configured)
Contains your Supabase credentials:
```javascript
const CONFIG = {
    supabase: {
        url: 'https://qcfifybkaddcoimjroca.supabase.co',
        anonKey: 'YOUR_ANON_KEY'
    },
    sampleUsers: {
        guest: 'c959ce3a-ea43-4a02-bd98-c1af4e04c0a8',
        host: 'b0cefa5b-87e4-42d8-b94e-06cce22d2d16'
    }
};
```

### .env.example (Reference Only)
Environment variables for production deployment:
```
NEXT_PUBLIC_SUPABASE_URL=https://qcfifybkaddcoimjroca.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## Running the Application

### Option 1: Python Simple Server
```bash
cd "C:\Users\Split Lease\splitleaseteam\!Agent Context and Tools\SL6\pages\guest-proposals"
python -m http.server 8000
```

Then open: `http://localhost:8000/?user=c959ce3a-ea43-4a02-bd98-c1af4e04c0a8`

### Option 2: Node.js HTTP Server
```bash
npx http-server -p 8000
```

### Option 3: PHP Built-in Server
```bash
php -S localhost:8000
```

### Option 4: Live Server (VS Code Extension)
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## Database Schema

### proposals Table
Already created with sample data:
- **guest_id** - UUID references users (THIS IS THE KEY!)
- **listing_id** - UUID references listings
- **host_id** - UUID references users
- **deleted** - Boolean for soft deletes
- All pricing, date, and schedule fields
- Counteroffer fields (hc_*)

### Sample Data Inserted
- 2 users (1 guest, 1 host)
- 1 listing (Cozy Studio in Upper West Side)
- 2 proposals with different statuses

## Testing Checklist

### Test User ID Extraction
- [ ] Visit with `?user=USER_ID` - should load that user's proposals
- [ ] Visit with `/USER_ID` in path - should load that user's proposals
- [ ] Visit without user ID - should use sample guest user

### Test Proposal Display
- [ ] Proposals load for correct user
- [ ] Dropdown shows all proposals
- [ ] Can switch between proposals
- [ ] All proposal details display correctly

### Test Actions
- [ ] Cancel proposal - status updates
- [ ] Delete proposal - soft delete (deleted=true)
- [ ] Both actions only affect current user's proposals

## Security Features

### User-Specific Filtering
All operations filter by `guest_id`:
```javascript
// Load proposals
.eq('guest_id', state.currentUserId)

// Cancel proposal
.eq('id', proposalId)
.eq('guest_id', state.currentUserId)

// Delete proposal
.eq('id', proposalId)
.eq('guest_id', state.currentUserId)
```

This ensures users can only:
- View their own proposals
- Modify their own proposals
- Delete their own proposals

### Soft Delete Pattern
All deletions are soft (preserves audit trail):
```javascript
.update({ deleted: true })
```

All queries filter out deleted:
```javascript
.eq('deleted', false)
```

## Troubleshooting

### "Configuration not loaded" Error
**Cause**: config.js not included before app.js
**Fix**: Verify script order in index.html:
```html
<script src="config.js"></script>
<script src="app.js"></script>
```

### "Supabase library not loaded" Error
**Cause**: CDN script missing
**Fix**: Add before config.js:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### No Proposals Loading
**Causes**:
1. Wrong user ID in URL
2. User has no proposals
3. Database query failed

**Debug**:
1. Open browser console
2. Look for: "Loading proposals for user: USER_ID"
3. Check if proposals returned
4. Verify user ID exists in database

### Empty State Always Shows
**Cause**: User has no proposals in database
**Fix**: Either:
1. Use sample guest user ID: `c959ce3a-ea43-4a02-bd98-c1af4e04c0a8`
2. Create proposals for your user in Supabase

## Advanced Usage

### Dynamic User IDs in Production

In production, you would:

1. **Add Authentication** (Supabase Auth)
```javascript
const { data: { user } } = await supabaseClient.auth.getUser();
state.currentUserId = user.id;
```

2. **Use Session Management**
```javascript
// Get from session storage
state.currentUserId = sessionStorage.getItem('userId');
```

3. **Server-Side Routing**
- Express.js route: `/guest-proposals/:userId`
- Next.js dynamic route: `/guest-proposals/[userId]`

### Integration with Other Pages

Link to this page from other pages:
```html
<!-- From user dashboard -->
<a href="/guest-proposals?user=${currentUserId}">My Proposals</a>

<!-- From listing page -->
<a href="/guest-proposals?user=${currentUserId}&proposal=${proposalId}">
    View This Proposal
</a>
```

### URL Parameter Combinations

All valid combinations:
```
# User only
?user=USER_ID

# User + specific proposal
?user=USER_ID&proposal=PROPOSAL_ID

# Path-based
/USER_ID
/guest-proposals/USER_ID

# Path + query
/USER_ID?proposal=PROPOSAL_ID
```

## Next Steps

### Immediate
1. ✅ Database is set up
2. ✅ Sample data is inserted
3. ✅ Config is ready
4. Start local server
5. Open browser to test URL

### Short-term
1. Test all user ID formats
2. Test all proposal actions
3. Customize styling if needed
4. Add additional sample data

### Long-term
1. Add authentication
2. Implement virtual meeting modals
3. Add compare terms feature
4. Build host profile modal
5. Integrate messaging

## Quick Reference

### Current Configuration
- **Supabase URL**: https://qcfifybkaddcoimjroca.supabase.co
- **Sample Guest ID**: c959ce3a-ea43-4a02-bd98-c1af4e04c0a8
- **Sample Host ID**: b0cefa5b-87e4-42d8-b94e-06cce22d2d16

### Quick Test Command
```bash
# Navigate to project
cd "C:\Users\Split Lease\splitleaseteam\!Agent Context and Tools\SL6\pages\guest-proposals"

# Start server
python -m http.server 8000

# Open in browser
start http://localhost:8000/?user=c959ce3a-ea43-4a02-bd98-c1af4e04c0a8
```

## Support

For issues or questions:
1. Check browser console for errors
2. Review SUPABASE_SETUP_SUMMARY.md for database details
3. Consult README.md for general setup
4. Check IMPLEMENTATION-SUMMARY.md for architecture

---

**Status**: ✅ Fully Configured and Ready to Use
**Setup Time**: < 5 minutes
**Last Updated**: 2025-11-19
