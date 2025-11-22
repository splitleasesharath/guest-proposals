/**
 * Virtual Meetings Queries Module
 *
 * This module handles fetching and managing virtual meeting data.
 * It implements the 5-state virtual meeting system:
 * 1. No VM exists → Show "Request Virtual Meeting" button
 * 2. VM requested by host → Show "Respond to Virtual Meeting"
 * 3. VM booked but not confirmed → Show meeting details, await confirmation
 * 4. VM confirmed → Show meeting link and calendar event
 * 5. VM declined → Show "Request Alternative Meeting" button
 *
 * Database Table: virtual_meetings
 * Fields:
 * - id (text, uuid) - Primary key
 * - proposal_id (text) - Links to proposal._id
 * - requested_by (text) - User ID who requested the meeting
 * - booked_date (timestamp) - Scheduled meeting date/time
 * - confirmed_by_splitlease (boolean) - Admin confirmation status
 * - meeting_declined (boolean) - Whether meeting was declined
 * - meeting_link (text) - Video meeting URL
 * - unique_id (varchar, UNIQUE) - Human-readable unique identifier
 * - created_at (timestamp)
 * - updated_at (timestamp)
 */

import { supabase } from './supabase.js';

/**
 * Fetch virtual meetings for multiple proposals
 * @param {Array<string>} proposalIds - Array of proposal IDs
 * @returns {Promise<Array<Object>>} Array of virtual meeting objects
 */
export async function fetchVirtualMeetingsByProposalIds(proposalIds) {
  if (!proposalIds || proposalIds.length === 0) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('virtual_meetings')
      .select(`
        id,
        proposal_id,
        requested_by,
        booked_date,
        confirmed_by_splitlease,
        meeting_declined,
        meeting_link,
        unique_id,
        created_at,
        updated_at
      `)
      .in('proposal_id', proposalIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching virtual meetings:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Exception fetching virtual meetings:', err);
    return [];
  }
}

/**
 * Fetch a single virtual meeting by ID
 * @param {string} vmId - Virtual meeting ID
 * @returns {Promise<Object|null>} Virtual meeting object or null
 */
export async function fetchVirtualMeetingById(vmId) {
  if (!vmId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('virtual_meetings')
      .select(`
        id,
        proposal_id,
        requested_by,
        booked_date,
        confirmed_by_splitlease,
        meeting_declined,
        meeting_link,
        unique_id,
        created_at,
        updated_at
      `)
      .eq('id', vmId)
      .single();

    if (error) {
      console.error('❌ Error fetching virtual meeting:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception fetching virtual meeting:', err);
    return null;
  }
}

/**
 * Fetch virtual meeting for a specific proposal
 * @param {string} proposalId - Proposal ID
 * @returns {Promise<Object|null>} Most recent virtual meeting or null
 */
export async function fetchVirtualMeetingByProposalId(proposalId) {
  if (!proposalId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('virtual_meetings')
      .select(`
        id,
        proposal_id,
        requested_by,
        booked_date,
        confirmed_by_splitlease,
        meeting_declined,
        meeting_link,
        unique_id,
        created_at,
        updated_at
      `)
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('❌ Error fetching virtual meeting for proposal:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('❌ Exception fetching virtual meeting for proposal:', err);
    return null;
  }
}

/**
 * Determine virtual meeting state for UI display
 * Implements the 5-state virtual meeting system
 *
 * @param {Object|null} vm - Virtual meeting object
 * @param {Object} proposal - Proposal object
 * @param {string} currentUserId - Current user's ID
 * @returns {Object} State object with UI properties
 */
export function getVirtualMeetingState(vm, proposal, currentUserId) {
  // State 1: No meeting exists
  if (!vm) {
    return {
      state: 'no_meeting',
      label: 'No meeting scheduled',
      action: 'request_vm',
      showButton: true,
      buttonText: 'Request Virtual Meeting',
      buttonStyle: 'primary',
      showDetails: false
    };
  }

  // State 5: Meeting declined
  if (vm.meeting_declined) {
    return {
      state: 'declined',
      label: 'Meeting declined',
      action: 'request_alternative_vm',
      showButton: true,
      buttonText: 'Request Alternative Meeting',
      buttonStyle: 'secondary',
      showDetails: false,
      declinedAt: vm.updated_at
    };
  }

  // State 2: VM requested, awaiting response
  if (!vm.booked_date) {
    // Check who requested the meeting
    if (vm.requested_by === currentUserId) {
      // Guest requested, awaiting host response
      return {
        state: 'requested_by_guest',
        label: 'Awaiting host response',
        action: null,
        showButton: false,
        showDetails: true,
        requestedAt: vm.created_at,
        canCancel: true
      };
    } else {
      // Host requested, guest needs to respond
      return {
        state: 'requested_by_host',
        label: 'Host has requested a meeting',
        action: 'respond_vm',
        showButton: true,
        buttonText: 'Respond to Virtual Meeting',
        buttonStyle: 'primary',
        showDetails: true,
        requestedAt: vm.created_at
      };
    }
  }

  // State 3: Meeting booked, awaiting Split Lease confirmation
  if (vm.booked_date && !vm.confirmed_by_splitlease) {
    return {
      state: 'booked_not_confirmed',
      label: 'Meeting scheduled, awaiting confirmation',
      action: 'view_vm',
      showButton: true,
      buttonText: 'View Meeting Details',
      buttonStyle: 'secondary',
      showDetails: true,
      meetingDate: vm.booked_date,
      uniqueId: vm.unique_id
    };
  }

  // State 4: Meeting confirmed by Split Lease
  if (vm.booked_date && vm.confirmed_by_splitlease) {
    return {
      state: 'confirmed',
      label: 'Meeting confirmed',
      action: 'join_vm',
      showButton: true,
      buttonText: 'Join Virtual Meeting',
      buttonStyle: 'success',
      showDetails: true,
      meetingDate: vm.booked_date,
      meetingLink: vm.meeting_link,
      uniqueId: vm.unique_id,
      canJoin: vm.meeting_link != null
    };
  }

  // Fallback for unknown state
  return {
    state: 'unknown',
    label: 'Unknown meeting state',
    action: null,
    showButton: false,
    showDetails: true
  };
}

/**
 * Check if a virtual meeting is active (can be used for UI)
 * @param {Object} vm - Virtual meeting object
 * @returns {boolean} True if meeting is active (not declined, has future date)
 */
export function isVirtualMeetingActive(vm) {
  if (!vm || vm.meeting_declined) {
    return false;
  }

  if (!vm.booked_date) {
    return true; // Requested but not yet booked
  }

  // Check if meeting date is in the future
  const meetingDate = new Date(vm.booked_date);
  const now = new Date();

  return meetingDate > now;
}

/**
 * Format virtual meeting date for display
 * @param {string} dateString - ISO date string
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
export function formatVirtualMeetingDate(dateString, includeTime = true) {
  if (!dateString) {
    return 'Date not set';
  }

  try {
    const date = new Date(dateString);
    const options = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(includeTime && {
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };

    return date.toLocaleString('en-US', options);
  } catch (err) {
    console.error('❌ Error formatting date:', err);
    return 'Invalid date';
  }
}

/**
 * Get virtual meeting status badge color
 * @param {string} state - State from getVirtualMeetingState
 * @returns {string} Color class name
 */
export function getVirtualMeetingBadgeColor(state) {
  const colorMap = {
    'no_meeting': 'gray',
    'declined': 'red',
    'requested_by_guest': 'blue',
    'requested_by_host': 'yellow',
    'booked_not_confirmed': 'yellow',
    'confirmed': 'green',
    'unknown': 'gray'
  };

  return colorMap[state] || 'gray';
}

/**
 * Check if current user can perform an action on the virtual meeting
 * @param {Object} vm - Virtual meeting object
 * @param {string} action - Action to check ('cancel', 'respond', 'join')
 * @param {string} currentUserId - Current user's ID
 * @returns {boolean} True if user can perform the action
 */
export function canPerformVMAction(vm, action, currentUserId) {
  if (!vm || !currentUserId) {
    return false;
  }

  switch (action) {
    case 'cancel':
      // Can cancel if user requested it and it's not confirmed
      return vm.requested_by === currentUserId && !vm.confirmed_by_splitlease;

    case 'respond':
      // Can respond if host requested and guest hasn't responded yet
      return vm.requested_by !== currentUserId && !vm.booked_date && !vm.meeting_declined;

    case 'join':
      // Can join if meeting is confirmed and has a link
      return vm.confirmed_by_splitlease && vm.meeting_link != null;

    default:
      return false;
  }
}

/**
 * Create a lookup map of virtual meetings by proposal ID
 * Useful for efficiently attaching VMs to proposal objects
 *
 * @param {Array<Object>} virtualMeetings - Array of virtual meeting objects
 * @returns {Map<string, Object>} Map of proposal_id to virtual meeting
 */
export function createVirtualMeetingLookupMap(virtualMeetings) {
  const map = new Map();

  if (!virtualMeetings || virtualMeetings.length === 0) {
    return map;
  }

  // For each proposal, keep only the most recent (first in array after ordering)
  virtualMeetings.forEach(vm => {
    if (!map.has(vm.proposal_id)) {
      map.set(vm.proposal_id, vm);
    }
  });

  return map;
}
