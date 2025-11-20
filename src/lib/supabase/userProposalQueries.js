/**
 * User Proposal Query Functions
 * Implements Direct Query Method: Query proposal table by Guest field
 *
 * Data flow:
 * 1. Extract user ID from URL
 * 2. Fetch user data
 * 3. Query proposal table WHERE Guest = userId
 * 4. Fetch related listings and hosts (nested fetches)
 * 5. Return user + proposals + selected proposal
 *
 * Note: This approach is more reliable than using user."Proposals List" field
 * which is only populated for 35.8% of users (306/854).
 */

import { supabase } from './supabase.js';
import { getUserIdFromPath, getProposalIdFromQuery } from '../utils/urlParser.js';

/**
 * STEP 1: Fetch user data
 *
 * @param {string} userId - User ID from URL path
 * @returns {Promise<Object>} User object
 */
export async function fetchUser(userId) {
  const { data, error } = await supabase
    .from('user')
    .select(`
      _id,
      "Name - First",
      "Name - Last",
      "Name - Full",
      "Profile Photo",
      "email as text"
    `)
    .eq('_id', userId)
    .single();

  if (error) {
    console.error('❌ Error fetching user:', error);
    throw new Error(`Failed to fetch user: ${error.message}`);
  }

  if (!data) {
    throw new Error(`User with ID ${userId} not found`);
  }

  console.log('✅ User fetched:', data['Name - First'] || data['Name - Full']);
  return data;
}

/**
 * STEP 2: Fetch user's proposals by querying proposal table directly
 * This queries WHERE "Guest" = userId, which is more reliable than user."Proposals List"
 *
 * @param {string} userId - User ID to fetch proposals for
 * @returns {Promise<Array<Object>>} Array of proposal objects with nested data
 */
export async function fetchProposalsByGuestId(userId) {
  // Step 1: Fetch all proposals for this guest
  const { data: proposals, error: proposalError } = await supabase
    .from('proposal')
    .select(`
      _id,
      "Status",
      "Deleted",
      "Listing",
      "Days Selected",
      "Nights Selected (Nights list)",
      "Reservation Span (Weeks)",
      "nights per week (num)",
      "check in day",
      "check out day",
      "Move in range start",
      "Move in range end",
      "Total Price for Reservation (guest)",
      "proposal nightly price",
      "cleaning fee",
      "damage deposit",
      "counter offer happened",
      "hc days selected",
      "hc reservation span (weeks)",
      "hc total price",
      "hc nightly price",
      "Created Date",
      "Modified Date",
      "about_yourself",
      "special_needs",
      "reason for cancellation",
      "rental application",
      "virtual meeting",
      "Is Finalized"
    `)
    .eq('Guest', userId)
    .order('"Created Date"', { ascending: false });

  if (proposalError) {
    console.error('❌ Error fetching proposals:', proposalError);
    throw new Error(`Failed to fetch proposals: ${proposalError.message}`);
  }

  const validProposals = (proposals || []).filter(p => p !== null && !p.Deleted);

  if (validProposals.length === 0) {
    console.log('✅ No proposals found for user');
    return [];
  }

  console.log(`✅ Fetched ${validProposals.length} proposals for guest ${userId}`);

  // Step 2: Extract unique listing IDs from proposals
  const listingIds = [...new Set(validProposals.map(p => p.Listing).filter(Boolean))];

  if (listingIds.length === 0) {
    console.warn('⚠️ No listings found for proposals');
    return validProposals.map(p => ({ ...p, listing: null }));
  }

  console.log(`📍 Fetching ${listingIds.length} unique listings`);

  // Step 3: Fetch all listings
  const { data: listings, error: listingError } = await supabase
    .from('listing')
    .select(`
      _id,
      "Name",
      "Description",
      "Location - Address",
      "Location - Borough",
      "Location - Hood",
      "Features - Photos",
      "Features - House Rules",
      "NEW Date Check-in Time",
      "NEW Date Check-out Time",
      "Host / Landlord"
    `)
    .in('_id', listingIds);

  if (listingError) {
    console.error('❌ Error fetching listings:', listingError);
    return validProposals.map(p => ({ ...p, listing: null }));
  }

  // Step 4: Extract unique host account IDs from listings
  // Note: listing['Host / Landlord'] contains Host Account IDs, not User IDs
  const hostAccountIds = [...new Set((listings || []).map(l => l['Host / Landlord']).filter(Boolean))];

  console.log(`👤 Fetching ${hostAccountIds.length} unique hosts`);

  let hosts = [];
  if (hostAccountIds.length > 0) {
    // Step 5: Fetch all hosts by their Host Account reference
    // Important: Query by "Account - Host / Landlord" field, NOT by _id
    const { data: hostsData, error: hostError } = await supabase
      .from('user')
      .select(`
        _id,
        "Name - First",
        "Name - Last",
        "Name - Full",
        "Profile Photo",
        "About Me / Bio",
        "Verify - Linked In ID",
        "Verify - Phone",
        "user verified?",
        "Account - Host / Landlord"
      `)
      .in('"Account - Host / Landlord"', hostAccountIds);

    if (hostError) {
      console.error('❌ Error fetching hosts:', hostError);
    } else {
      hosts = hostsData || [];
      console.log(`✅ Fetched ${hosts.length} hosts`);
    }
  }

  // Step 6: Create lookup maps for efficient joining
  const listingMap = new Map((listings || []).map(l => [l._id, l]));
  // Key hosts by their Account - Host / Landlord field (not _id) for proper joining
  const hostMap = new Map(hosts.map(h => [h['Account - Host / Landlord'], h]));

  // Step 7: Manually join the data
  const enrichedProposals = validProposals.map(proposal => {
    const listing = listingMap.get(proposal.Listing);
    // Lookup host by Host Account ID from listing
    const host = listing ? hostMap.get(listing['Host / Landlord']) : null;

    return {
      ...proposal,
      listing: listing ? { ...listing, host } : null
    };
  });

  console.log(`✅ Successfully enriched ${enrichedProposals.length} proposals with listing and host data`);
  return enrichedProposals;
}

/**
 * COMPLETE FLOW: Get user's proposals from URL
 * This is the main function to call from components
 *
 * @returns {Promise<{user: Object, proposals: Array, selectedProposal: Object|null}>}
 */
export async function fetchUserProposalsFromUrl() {
  // Step 1: Extract user ID from URL
  const userId = getUserIdFromPath();
  if (!userId) {
    throw new Error('No user ID found in URL path. Expected: /guest-proposals/{userId}');
  }

  // Step 2: Fetch user data
  const user = await fetchUser(userId);

  // Step 3: Fetch proposals directly from proposal table (more reliable approach)
  const proposals = await fetchProposalsByGuestId(userId);

  // Handle case where user has no proposals
  if (proposals.length === 0) {
    console.log('ℹ️ User has no proposals');
    return {
      user,
      proposals: [],
      selectedProposal: null
    };
  }

  // Step 4: Check for preselected proposal
  const preselectedId = getProposalIdFromQuery();
  let selectedProposal = null;

  if (preselectedId) {
    selectedProposal = proposals.find(p => p._id === preselectedId);
    if (!selectedProposal) {
      console.warn(`⚠️ Preselected proposal ${preselectedId} not found, defaulting to first`);
      selectedProposal = proposals[0] || null;
    } else {
      console.log('✅ Using preselected proposal:', preselectedId);
    }
  } else {
    selectedProposal = proposals[0] || null;
    console.log('✅ Defaulting to first proposal');
  }

  return {
    user,
    proposals,
    selectedProposal
  };
}
