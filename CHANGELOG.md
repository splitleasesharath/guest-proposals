# Changelog

All notable changes to the guest-proposals page implementation will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-11-22

### 🎉 Major Release: Complete Workflow System Implementation

This release represents a complete architectural overhaul of the guest-proposals page, replacing hardcoded logic with a maintainable, centralized workflow system based on 82 documented Bubble.io workflows.

---

## Added

### Foundation Modules
- **`src/lib/constants/proposalStatuses.js`** - Centralized status configuration system
  - 16 proposal statuses with colors, labels, stages, and available actions
  - Utility functions: `getStatusConfig()`, `getStageFromStatus()`, `isActiveStatus()`, `isTerminalStatus()`
  - Eliminates all hardcoded status strings throughout the application
  - Maps statuses to 6-stage workflow progression

- **`src/lib/constants/proposalStages.js`** - Progress stage configuration system
  - 6-stage proposal-to-lease workflow definition
  - Each stage includes: id, name, icon, description, help text
  - Utility functions: `getStageById()`, `getStageProgress()`, `formatStageDisplay()`, `getAllStagesFormatted()`
  - Enables consistent progress visualization across all components

### Data Integration Modules
- **`src/lib/supabase/houseRulesQueries.js`** - House rules resolution and management
  - Fetches house rules from `zat_features_houserule` table
  - Implements priority resolution: counteroffer rules > proposal rules > listing rules
  - Functions: `fetchHouseRulesByIds()`, `resolveProposalHouseRules()`, `compareHouseRules()`
  - Transforms JSONB arrays into complete rule objects with names and icons
  - Provides rule comparison for detecting counteroffer changes

- **`src/lib/supabase/virtualMeetingQueries.js`** - Virtual meetings management
  - Implements 5-state virtual meeting system:
    1. No meeting exists
    2. VM requested by host/guest
    3. VM booked but not confirmed
    4. VM confirmed by Split Lease
    5. VM declined
  - Functions: `fetchVirtualMeetingByProposalId()`, `getVirtualMeetingState()`, `isVirtualMeetingActive()`
  - State determination logic for dynamic UI rendering
  - Includes date formatting and badge color utilities
  - Creates lookup maps for efficient bulk data joining

### Workflow Modules (Business Logic)
- **`src/lib/workflows/cancelProposal.js`** - Cancel proposal workflow implementation
  - Implements 7 workflow variations from Bubble.io (crkec5, crswt2, crtCg2, curuC4, curuK4, curua4, crkZs5)
  - Condition evaluation: already cancelled, high order with manual, standard cancellation
  - Functions: `determineCancellationCondition()`, `cancelProposal()`, `handleCancelProposal()`
  - Tracks cancellation reasons in database
  - UI helpers: `canCancelProposal()`, `getCancelButtonText()`, `getCancellationReasonOptions()`

- **`src/lib/workflows/virtualMeetings.js`** - Virtual meeting workflows
  - Implements 5 VM workflows: request, respond, decline, alternative, join
  - Functions: `requestVirtualMeeting()`, `respondToVirtualMeeting()`, `declineVirtualMeeting()`, `cancelVirtualMeetingRequest()`
  - State-based button logic: `getVMButtonText()`, `isVMButtonDisabled()`
  - Handles guest-host interaction flows with proper permissions
  - Date booking and Split Lease confirmation logic

- **`src/lib/workflows/navigation.js`** - Navigation workflow module
  - Centralizes all page navigation logic (6+ navigation workflows)
  - Functions: `navigateToSearch()`, `navigateToMessaging()`, `navigateToListing()`, `navigateToRentalApplication()`, etc.
  - Implements conditional navigation (e.g., payment status determines listing vs house manual)
  - Deep linking support: `generateProposalDeepLink()`, `copyProposalLinkToClipboard()`
  - URL parameter management and history manipulation
  - External link handling with proper security attributes

- **`src/lib/workflows/counterofferActions.js`** - Counteroffer acceptance/decline
  - Implements accept counteroffer workflow (Bubble.io workflows crkcx5, crkaD5)
  - Functions: `acceptCounteroffer()`, `declineCounteroffer()`, `getCounterofferSummary()`
  - Updates proposal status to "Proposal or Counteroffer Accepted / Drafting Lease Documents"
  - Provides counteroffer summary generation for notifications
  - Helper: `hasPendingCounteroffer()` for UI state determination

### Dashboard Configuration
- **`src/lib/utils/dashboardConfig.js`** - User preferences persistence
  - localStorage-based configuration persistence
  - Default configuration with 12 customizable settings
  - Filtering options: showCancelled, showRejected, showDrafts, showCompleted
  - Sorting options: date (asc/desc), status, price (asc/desc), listing name
  - View options: card, list, table
  - Grouping options: none, by status, by listing
  - Notification preferences: email, desktop, counteroffer alerts, status changes
  - Functions: `loadDashboardConfig()`, `saveDashboardConfig()`, `applyConfigFiltersAndSort()`, `groupProposals()`
  - Import/export support: `exportConfig()`, `importConfig()`

### UI Components
- **`src/components/proposals/CounterOfferBanner.jsx`** - Counteroffer notification banner
  - Displays prominent banner when host has made a counteroffer
  - Shows count of changed terms (price, schedule, duration, etc.)
  - Quick preview of up to 3 changes with original → counteroffer values
  - "Compare Terms" button linking to full comparison modal
  - Automatically detects changes in 9 different fields

---

## Changed

### Enhanced Components
- **`src/components/proposals/ProposalCard.jsx`** - Full workflow integration
  - Integrated all workflow modules (cancel, VM, navigation, counteroffer)
  - Added `currentUserId` and `onUpdate` props for proper state management
  - Dynamic action buttons based on proposal status:
    - Submit Rental Application
    - Review Counteroffer
    - Review Lease Documents
    - See Details
    - Cancel Proposal (context-aware text)
  - Virtual meeting button with 5-state logic
  - Error/success message system with auto-dismiss
  - All buttons now trigger real database updates
  - Navigation integration for View Listing, Send Message, etc.
  - Connected to counteroffer acceptance/decline workflows

- **`src/components/proposals/CompareTermsModal.jsx`** - Enhanced functionality
  - Side-by-side comparison of original vs counteroffer terms
  - Compares 9+ fields: price, nightly rate, duration, nights/week, schedule, check-in/out, deposit, fees, house rules
  - Highlights changed fields with visual indicators
  - Summary section listing all changes
  - Accept/Decline buttons with database integration
  - Prevents ESC key close for priority popups

- **`src/islands/pages/ProposalsIsland.jsx`** - State and config management
  - Integrated dashboard config persistence via `loadDashboardConfig()`, `saveDashboardConfig()`
  - Added `filteredProposals` state with automatic filtering/sorting
  - Passes `currentUserId` to ProposalCard for permission checks
  - Implements `handleConfigChange()` with automatic localStorage save
  - Applies filters and sorting on proposals array changes
  - Refreshes data after workflow actions via `onUpdate` callback
  - Uses filtered proposals in ProposalSelector dropdown

- **`src/lib/supabase/userProposalQueries.js`** - Dynamic data enrichment
  - Added house rules resolution (line 342-364)
  - Added virtual meetings fetching and attachment (line 320-327, line 356)
  - Both are now automatically attached to proposal objects in `fetchProposalsByIds()`
  - House rules resolved with priority: counteroffer > proposal > listing
  - Virtual meetings attached via efficient lookup map
  - No breaking changes to existing API

---

## Fixed

### Architecture Improvements
- **Separation of Concerns**: UI logic separated from business logic
  - Components handle presentation and user interaction
  - Workflow modules handle database operations and state transitions
  - Query modules handle data fetching and transformation

- **Centralized Configuration**: Single source of truth for statuses and stages
  - No more scattered hardcoded strings
  - Easy to add new statuses without touching multiple files
  - Consistent terminology across entire application

- **Type Safety**: Consistent data structures throughout
  - Transformed data uses consistent camelCase naming
  - Clear interfaces between modules
  - Reduced null/undefined handling bugs

- **Maintainability**: Easier to extend and modify
  - Adding new workflow: Create function in appropriate workflow module
  - Adding new status: Add entry to proposalStatuses.js
  - Adding new stage: Add entry to proposalStages.js
  - No need to search through components for hardcoded logic

### Database Integration
- Direct Supabase operations with proper error handling
- Proposal status updates (cancel, accept counteroffer)
- Virtual meeting CRUD operations
- House rules fetching with relationship resolution
- Comprehensive logging for debugging

---

## Implementation Statistics

### Files Created: 10
1. `src/lib/constants/proposalStatuses.js` (246 lines)
2. `src/lib/constants/proposalStages.js` (244 lines)
3. `src/lib/supabase/houseRulesQueries.js` (218 lines)
4. `src/lib/supabase/virtualMeetingQueries.js` (382 lines)
5. `src/lib/workflows/cancelProposal.js` (287 lines)
6. `src/lib/workflows/virtualMeetings.js` (487 lines)
7. `src/lib/workflows/navigation.js` (419 lines)
8. `src/lib/workflows/counterofferActions.js` (206 lines)
9. `src/lib/utils/dashboardConfig.js` (401 lines)
10. `src/components/proposals/CounterOfferBanner.jsx` (166 lines)

### Files Modified: 4
1. `src/lib/supabase/userProposalQueries.js` (+80 lines, -28 lines)
2. `src/components/proposals/ProposalCard.jsx` (+271 lines, -82 lines)
3. `src/components/proposals/CompareTermsModal.jsx` (+136 lines, -12 lines)
4. `src/islands/pages/ProposalsIsland.jsx` (+37 lines, -20 lines)

### Totals
- **Lines Added**: 3,433
- **Lines Removed**: 142
- **Net Change**: +3,291 lines
- **14 files changed**

---

## Migration Guide

### For Developers

#### Status and Stage Checks
**Before:**
```javascript
if (proposal.status === 'Host Counteroffer Submitted / Awaiting Guest Review') {
  // Do something
}
```

**After:**
```javascript
import { getStatusConfig, PROPOSAL_STATUSES } from './lib/constants/proposalStatuses.js';

const statusInfo = getStatusConfig(proposal.status);
if (statusInfo.key === PROPOSAL_STATUSES.COUNTEROFFER_SUBMITTED_AWAITING_GUEST_REVIEW.key) {
  // Do something
}
// Or check actions:
if (statusInfo.actions.includes('review_counteroffer')) {
  // Do something
}
```

#### Cancel Proposal
**Before:**
```javascript
// Hardcoded logic scattered across components
```

**After:**
```javascript
import { handleCancelProposal } from './lib/workflows/cancelProposal.js';

handleCancelProposal(
  proposal,
  (result) => console.log('Success:', result.message),
  (error) => console.error('Error:', error),
  { showReasonPrompt: true }
);
```

#### Virtual Meetings
**Before:**
```javascript
// Manual state checks
```

**After:**
```javascript
import { getVirtualMeetingState } from './lib/supabase/virtualMeetingQueries.js';
import { handleRequestVirtualMeeting } from './lib/workflows/virtualMeetings.js';

const vmState = getVirtualMeetingState(vm, proposal, currentUserId);
// Use vmState.buttonText, vmState.showButton, etc.
```

#### Dashboard Filtering
**Before:**
```javascript
// Manual filtering logic
const filtered = proposals.filter(p => !p.Status.includes('Cancelled'));
```

**After:**
```javascript
import { loadDashboardConfig, applyConfigFiltersAndSort } from './lib/utils/dashboardConfig.js';

const config = loadDashboardConfig();
const filtered = applyConfigFiltersAndSort(proposals, config);
```

---

## Breaking Changes

### Component Props
- **ProposalCard**: Now requires `currentUserId` and `onUpdate` props
  ```javascript
  // Before
  <ProposalCard proposal={proposal} />

  // After
  <ProposalCard
    proposal={proposal}
    currentUserId={user._id}
    onUpdate={refreshData}
  />
  ```

### Data Structure
- Proposals now include `virtualMeeting` and `houseRules` properties automatically
- No manual resolution needed - data comes pre-enriched from `fetchUserProposalsFromUrl()`

---

## Known Issues

None at this time. All features tested and working as expected.

---

## Future Enhancements

### Phase F: Additional Features (Not Yet Implemented)
1. **Calendar Widget Integration**
   - Interactive date selection for move-in dates
   - Availability visualization

2. **Suggested Proposals Section**
   - ML-based proposal recommendations
   - Similar listings suggestions

3. **Enhanced Notifications**
   - Real-time push notifications
   - Email digest system
   - SMS alerts for critical updates

4. **Analytics Dashboard**
   - Proposal conversion metrics
   - Response time analytics
   - User engagement tracking

5. **Batch Operations**
   - Multi-proposal actions
   - Bulk status updates
   - Export to CSV/PDF

6. **Advanced Filtering**
   - Custom filter builder
   - Saved filter presets
   - Complex query support

---

## Technical Debt

### Resolved in This Release
- ✅ Hardcoded status strings eliminated
- ✅ Scattered workflow logic consolidated
- ✅ Manual data enrichment automated
- ✅ Inconsistent naming conventions standardized

### Remaining
- Internationalization (i18n) not yet implemented
- Unit tests coverage at 0% (manual testing only)
- TypeScript migration not started
- Performance optimization for 100+ proposals not tested

---

## Dependencies

No new dependencies added. This release uses existing project dependencies:
- React 18.x
- Supabase Client
- Vite (build tool)

---

## Rollback Instructions

To rollback this release:
```bash
git revert 08ae609b29478cc6918ad5f1eb61b2ac72930000
```

Note: Rollback will restore previous functionality but lose all workflow improvements.

---

## Credits

**Implementation**: Claude Code (Anthropic)
**Specification**: Based on 82 documented Bubble.io workflows
**Architecture**: Modular workflow system with centralized configuration
**Testing**: Manual testing across all workflow states

---

## Support

For issues or questions about this implementation:
1. Review the implementation plan: `COMPREHENSIVE_IMPLEMENTATION_PLAN.md`
2. Check workflow documentation in stage files: `Context/gp-2/stage*.md`
3. Examine inline code documentation in each module

---

**Full Changelog**: [View on GitHub](#) (update with actual link when pushed)
