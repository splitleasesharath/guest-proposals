# React Islands Migration Plan

## Status: Ready for Implementation

This document outlines the complete migration from vanilla HTML/CSS/JS to ESM + React Islands architecture.

## What's Already Complete ✅

1. Supabase database fully set up with sample data
2. Core HTML structure and CSS styling
3. Vanilla JavaScript implementation working
4. User ID path routing implemented
5. Configuration files ready

## What Needs to Be Done

### Phase 1: Project Structure Setup (30 minutes)

#### 1.1 Create Directory Structure
```bash
src/
├── islands/
│   ├── shared/
│   │   ├── Header.jsx          # Copy from Split Lease app
│   │   └── Footer.jsx          # Copy from Split Lease app
│   └── pages/
│       └── ProposalsIsland.jsx  # New: main proposals component
├── lib/
│   ├── auth.js                  # Create: authentication utilities
│   ├── constants.js             # Create: app constants
│   └── supabase.js              # Move from config.js
└── styles/
    └── main.css                 # Move from styles.css

public/
├── index.html                   # Move and update as island host
└── assets/
    └── images/
        └── logo.png             # Add logo

dist/                            # Vite build output (gitignored)
```

#### 1.2 Create package.json
```json
{
  "name": "guest-proposals",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.38.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.0",
    "vite": "^5.0.0"
  }
}
```

#### 1.3 Create vite.config.js
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './public/index.html'
      }
    }
  },
  server: {
    port: 8000
  }
});
```

### Phase 2: Library Files (20 minutes)

#### 2.1 src/lib/constants.js
```javascript
// App-wide constants
export const SIGNUP_LOGIN_URL = '/signup-login.html';
export const SEARCH_URL = '/search.html';
export const REFERRAL_API_ENDPOINT = '/api/referrals';

export const AUTH_STORAGE_KEYS = {
  TOKEN: 'sl_auth_token',
  USER_TYPE: 'sl_user_type',
  USER_DATA: 'sl_user_data'
};

export const PROGRESS_STAGES = [
  { id: 1, label: 'Proposal Submitted' },
  { id: 2, label: 'Rental App Submitted' },
  { id: 3, label: 'Host Review' },
  { id: 4, label: 'Review Documents' },
  { id: 5, label: 'Lease Documents' },
  { id: 6, label: 'Initial Payment' }
];

export const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
```

#### 2.2 src/lib/supabase.js
```javascript
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const SUPABASE_URL = 'https://qcfifybkaddcoimjroca.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjZmlmeWJrYWRkY29pbWpyb2NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NzU0MDUsImV4cCI6MjA3NTA1MTQwNX0.glGwHxds0PzVLF1Y8VBGX0jYz3zrLsgE9KAWWwkYms8';

// Create and export Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sample user IDs for testing
export const SAMPLE_USERS = {
  guest: 'c959ce3a-ea43-4a02-bd98-c1af4e04c0a8',
  host: 'b0cefa5b-87e4-42d8-b94e-06cce22d2d16'
};
```

#### 2.3 src/lib/auth.js (Simplified for No-Auth Mode)
```javascript
import { AUTH_STORAGE_KEYS } from './constants.js';

// Note: This is a simplified version since we're not implementing auth yet
// The Header component expects these functions to exist

export function getAuthToken() {
  return localStorage.getItem(AUTH_STORAGE_KEYS.TOKEN);
}

export function isProtectedPage() {
  // For now, no pages are protected
  return false;
}

export async function validateTokenAndFetchUser() {
  // For now, always return null (no user logged in)
  return null;
}

export async function loginUser(email, password) {
  // Placeholder - not implemented yet
  return { success: false, error: 'Login not implemented yet' };
}

export async function signupUser(email, password, retype) {
  // Placeholder - not implemented yet
  return { success: false, error: 'Signup not implemented yet' };
}

export async function logoutUser() {
  // Placeholder - not implemented yet
  return { success: false, error: 'Logout not implemented yet' };
}

export function redirectToLogin() {
  // Placeholder
  window.location.href = '/signup-login.html';
}
```

### Phase 3: React Components (40 minutes)

#### 3.1 Copy Components
1. Copy `Header.jsx` from Split Lease app to `src/islands/shared/Header.jsx`
2. Copy `Footer.jsx` from Split Lease app to `src/islands/shared/Footer.jsx`
3. **Update all imports in both files to use `.js` or `.jsx` extensions**

Example:
```javascript
// Before
import { redirectToLogin } from '../../lib/auth';

// After
import { redirectToLogin } from '../../lib/auth.js';
```

#### 3.2 Create src/islands/pages/ProposalsIsland.jsx

Convert the existing app.js logic into a React component:

```javascript
import { useState, useEffect } from 'react';
import { supabase, SAMPLE_USERS } from '../../lib/supabase.js';
import { PROGRESS_STAGES, DAYS, DAY_NAMES } from '../../lib/constants.js';

export default function ProposalsIsland() {
  const [proposals, setProposals] = useState([]);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract user ID from URL
  useEffect(() => {
    const userId = getUserIdFromUrl();
    setCurrentUserId(userId);
    loadProposals(userId);
  }, []);

  function getUserIdFromUrl() {
    // Same logic as before
    const urlParams = new URLSearchParams(window.location.search);
    const userParam = urlParams.get('user');
    if (userParam) return userParam;

    const pathParts = window.location.pathname.split('/').filter(p => p);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const part of pathParts) {
      if (uuidRegex.test(part)) return part;
    }

    return SAMPLE_USERS.guest;
  }

  async function loadProposals(userId) {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('proposals')
        .select(`
          *,
          listing:listings(*),
          host:users!host_id(*),
          virtual_meeting:virtual_meetings(*)
        `)
        .eq('guest_id', userId)
        .eq('deleted', false)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setProposals(data || []);
      if (data && data.length > 0) {
        setSelectedProposal(data[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ... rest of the component logic (render, handlers, etc.)

  if (loading) {
    return <div className="loading-state">Loading...</div>;
  }

  if (error) {
    return <div className="error-state">Error: {error}</div>;
  }

  if (proposals.length === 0) {
    return (
      <div className="empty-state">
        <h2>No Proposals Yet</h2>
        <p>Start exploring rentals!</p>
        <a href="/search" className="btn btn-primary">Explore Rentals</a>
      </div>
    );
  }

  return (
    <div className="proposals-island">
      {/* Render your proposal UI here */}
      <div className="proposal-selector">
        <h2>My Proposals ({proposals.length})</h2>
        <select onChange={(e) => {
          const proposal = proposals.find(p => p.id === e.target.value);
          setSelectedProposal(proposal);
        }}>
          {proposals.map(p => (
            <option key={p.id} value={p.id}>
              {p.listing?.name} - {p.host?.name_first}
            </option>
          ))}
        </select>
      </div>

      {selectedProposal && (
        <div className="proposal-card">
          {/* Render selected proposal details */}
        </div>
      )}
    </div>
  );
}
```

### Phase 4: HTML Update (15 minutes)

#### 4.1 Update public/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Proposals - Split Lease</title>
  <link rel="stylesheet" href="/src/styles/main.css">
</head>
<body>
  <!-- Header Island Mount Point -->
  <div id="header-island"></div>

  <!-- Main Content Island Mount Point -->
  <main>
    <div id="proposals-island"></div>
  </main>

  <!-- Footer Island Mount Point -->
  <div id="footer-island"></div>

  <!-- Island Hydration Script -->
  <script type="module">
    import { createRoot } from 'react-dom/client';
    import Header from '/src/islands/shared/Header.jsx';
    import Footer from '/src/islands/shared/Footer.jsx';
    import ProposalsIsland from '/src/islands/pages/ProposalsIsland.jsx';

    // Mount Header
    const headerRoot = createRoot(document.getElementById('header-island'));
    headerRoot.render(<Header autoShowLogin={false} />);

    // Mount Proposals
    const proposalsRoot = createRoot(document.getElementById('proposals-island'));
    proposalsRoot.render(<ProposalsIsland />);

    // Mount Footer
    const footerRoot = createRoot(document.getElementById('footer-island'));
    footerRoot.render(<Footer />);
  </script>
</body>
</html>
```

### Phase 5: CSS Migration (10 minutes)

1. Move `styles.css` to `src/styles/main.css`
2. Add Header/Footer styles (copy from Split Lease app's CSS)

### Phase 6: Installation & Testing (10 minutes)

```bash
# Navigate to project
cd "C:\Users\Split Lease\splitleaseteam\!Agent Context and Tools\SL6\pages\guest-proposals"

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
start http://localhost:8000/?user=c959ce3a-ea43-4a02-bd98-c1af4e04c0a8
```

## Migration Benefits

✅ **Modular Components**: Reusable Header/Footer across all pages
✅ **Modern Tooling**: Vite for fast development and optimized builds
✅ **ESM Standard**: Future-proof module system
✅ **React Islands**: Only interactive parts use React, rest is static HTML
✅ **Easy Scaling**: Add more islands as needed
✅ **Shared Libraries**: Common utilities across islands

## File Changes Summary

### Files to Delete (Old Architecture)
- ~~app.js~~ → Converted to ProposalsIsland.jsx
- ~~config.js~~ → Split into lib/supabase.js and lib/constants.js
- ~~styles.css~~ → Moved to src/styles/main.css
- ~~index.html~~ → Moved to public/index.html and refactored

### Files to Create (New Architecture)
- package.json
- vite.config.js
- src/islands/shared/Header.jsx (copied)
- src/islands/shared/Footer.jsx (copied)
- src/islands/pages/ProposalsIsland.jsx (new)
- src/lib/auth.js (new)
- src/lib/constants.js (new)
- src/lib/supabase.js (new)
- src/styles/main.css (moved)
- public/index.html (refactored)

### Files to Keep
- README.md
- USAGE-GUIDE.md
- IMPLEMENTATION-SUMMARY.md
- .env.example
- .gitignore (update)

## Testing Checklist

After migration, test:
- [ ] Header loads and displays correctly
- [ ] Footer loads and displays correctly
- [ ] URL parameters work (?user=USER_ID)
- [ ] Proposals load for correct user
- [ ] Can switch between proposals
- [ ] All buttons work
- [ ] Mobile responsive design works
- [ ] Dev server hot reload works
- [ ] Production build works (`npm run build`)

## Timeline

- **Total Time**: ~2 hours
- **Difficulty**: Medium
- **Breaking Changes**: Yes (requires npm install)
- **Rollback**: Keep old files in backup folder

## Support

If you need help with any step:
1. Check Vite documentation
2. Review ARCHITECTURE_GUIDE_ESM+REACT_ISLAND.md
3. Compare with Split Lease app structure
4. Test incrementally (one island at a time)

---

**Status**: 📋 Ready for Implementation
**Priority**: High (Enables sharing components across pages)
**Dependencies**: Node.js 18+, npm 9+
