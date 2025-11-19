/**
 * User Proposal Query Functions
 * Implements Method 1: Fetch via user."Proposals List" (JSONB Array)
 *
 * Data flow:
 * 1. Extract user ID from URL
 * 2. Fetch user with "Proposals List" array
 * 3. Extract proposal IDs from array
 * 4. Fetch full proposal details with joins
 * 5. Return user + proposals + selected proposal
 */

import { supabase } from './supabase.js';
import { getUserIdFromPath, getProposalIdFromQuery } from '../utils/urlParser.js';

/**
 * STEP 1: Fetch user data with proposal ID list
 *
 * @param {string} userId - User ID from URL path
 * @returns {Promise<Object>} User object with Proposals List field
 */
export async function fetchUserWithProposalList(userId) {
  const { data, error } = await supabase
    .from('user')
    .select(`
      _id,
      Name - First,
      Name - Last,
      Name - Full,
      Profile Photo,
      Proposals List
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
 * STEP 2: Extract proposal IDs from user.Proposals List
 *
 * @param {Object} user - User object with Proposals List field
 * @returns {Array<string>} Array of proposal IDs
 */
export function extractProposalIds(user) {
  const proposalsList = user['Proposals List'];

  if (!proposalsList) {
    console.warn('⚠️ User has no Proposals List field');
    return [];
  }

  // proposalsList is a JSONB array, parse if needed
  let proposalIds = [];

  if (typeof proposalsList === 'string') {
    try {
      proposalIds = JSON.parse(proposalsList);
    } catch (e) {
      console.error('❌ Failed to parse Proposals List:', e);
      return [];
    }
  } else if (Array.isArray(proposalsList)) {
    proposalIds = proposalsList;
  } else {
    console.error('❌ Proposals List is not an array or string:', typeof proposalsList);
    return [];
  }

  console.log(`✅ Extracted ${proposalIds.length} proposal IDs:`, proposalIds);
  return proposalIds;
}

/**
 * STEP 3: Fetch full proposal details for array of IDs
 * Includes joins for: listing, host (via listing), virtual_meeting
 *
 * @param {Array<string>} proposalIds - Array of proposal IDs to fetch
 * @returns {Promise<Array<Object>>} Array of proposal objects with nested data
 */
export async function fetchProposalsByIds(proposalIds) {
  if (!proposalIds || proposalIds.length === 0) {
    console.warn('⚠️ No proposal IDs to fetch');
    return [];
  }

  const { data, error } = await supabase
    .from('proposal')
    .select(`
      _id,
      Status,
      Deleted,
      Days Selected,
      Nights Selected (Nights list),
      Reservation Span (Weeks),
      nights per week (num),
      check in day,
      check out day,
      Move in range start,
      Move in range end,
      Total Price for Reservation (guest),
      proposal nightly price,
      cleaning fee,
      damage deposit,
      counter offer happened,
      hc days selected,
      hc reservation span (weeks),
      hc total price,
      hc nightly price,
      Created Date,
      Modified Date,
      about_yourself,
      special_needs,

      listing:Listing (
        _id,
        Name,
        Description,
        Location - Address,
        Location - Borough,
        Location - Hood,
        Features - Photos,
        Features - House Rules,
        NEW Date Check-in Time,
        NEW Date Check-out Time,

        host:Host / Landlord (
          _id,
          Name - First,
          Name - Last,
          Name - Full,
          Profile Photo,
          About Me / Bio,
          Verify - Linked In ID,
          Verify - Phone,
          user verified?
        )
      ),

      virtual_meeting:virtual meeting (
        id,
        booked_date,
        confirmed_by_splitlease,
        meeting_link,
        meeting_declined
      )
    `)
    .in('_id', proposalIds)
    .order('Created Date', { ascending: false });

  if (error) {
    console.error('❌ Error fetching proposals:', error);
    throw new Error(`Failed to fetch proposals: ${error.message}`);
  }

  // Filter out null results (orphaned proposal IDs)
  const validProposals = (data || []).filter(p => p !== null);

  if (validProposals.length < proposalIds.length) {
    console.warn(`⚠️ Some proposal IDs are orphaned. Expected ${proposalIds.length}, got ${validProposals.length}`);
  }

  console.log(`✅ Fetched ${validProposals.length} valid proposals`);
  return validProposals;
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

  // Step 2: Fetch user data with proposal list
  const user = await fetchUserWithProposalList(userId);

  // Step 3: Extract proposal IDs
  const proposalIds = extractProposalIds(user);

  // Handle case where user has no proposals
  if (proposalIds.length === 0) {
    console.log('ℹ️ User has no proposals');
    return {
      user,
      proposals: [],
      selectedProposal: null
    };
  }

  // Step 4: Fetch full proposal details
  const proposals = await fetchProposalsByIds(proposalIds);

  // Step 5: Check for preselected proposal
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
