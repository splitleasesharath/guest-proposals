/**
 * Virtual Meetings Workflow Module
 *
 * Implements the 5 virtual meeting workflows from Bubble.io:
 * - crkdt5: VM empty, REQUEST (When virtual meeting is empty)
 * - crpWM2: REQUEST ALT (When virtual meeting meeting declined is yes)
 * - crpVt2: RESPOND to VM (When requested by host, no booked date)
 * - cuvLq5: RESPOND to VM (When booked date exists, confirmed)
 * - crkfZ5: Populate & Display respond-request-cancel-vm reusable element
 *
 * Virtual Meeting States:
 * 1. No VM exists → Show "Request Virtual Meeting" button
 * 2. VM requested by host → Show "Respond to Virtual Meeting"
 * 3. VM booked but not confirmed → Show meeting details, await confirmation
 * 4. VM confirmed by Split Lease → Show meeting link and join button
 * 5. VM declined → Show "Request Alternative Meeting" button
 */

import { supabase } from '../supabase/supabase.js';
import { fetchVirtualMeetingByProposalId } from '../supabase/virtualMeetingQueries.js';

/**
 * Create a new virtual meeting request
 * Implements workflow crkdt5: "B: Request Virtual Meeting new is clicked VM empty, REQUEST"
 *
 * @param {string} proposalId - Proposal ID
 * @param {string} guestId - Guest user ID who is requesting the meeting
 * @returns {Promise<Object>} Created virtual meeting object
 */
export async function requestVirtualMeeting(proposalId, guestId) {
  if (!proposalId || !guestId) {
    throw new Error('Proposal ID and Guest ID are required');
  }

  console.log('📅 Requesting virtual meeting for proposal:', proposalId);

  // Generate unique ID for the meeting
  const uniqueId = `VM-${Date.now()}-${proposalId.slice(0, 8)}`;

  const vmData = {
    proposal_id: proposalId,
    requested_by: guestId,
    booked_date: null,
    confirmed_by_splitlease: false,
    meeting_declined: false,
    meeting_link: null,
    unique_id: uniqueId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('virtual_meetings')
    .insert(vmData)
    .select()
    .single();

  if (error) {
    console.error('❌ Error requesting virtual meeting:', error);
    throw new Error(`Failed to request virtual meeting: ${error.message}`);
  }

  // Update proposal to link virtual meeting
  await supabase
    .from('proposal')
    .update({
      'virtual meeting': data.id,
      'Modified Date': new Date().toISOString()
    })
    .eq('_id', proposalId);

  console.log('✅ Virtual meeting requested:', data.id);
  return data;
}

/**
 * Request alternative meeting after decline
 * Implements workflow crpWM2: "B: Request Virtual Meeting new is clicked REQUEST ALT"
 *
 * @param {string} existingVmId - ID of the declined virtual meeting
 * @param {string} proposalId - Proposal ID
 * @param {string} guestId - Guest user ID
 * @returns {Promise<Object>} New virtual meeting object
 */
export async function requestAlternativeMeeting(existingVmId, proposalId, guestId) {
  if (!existingVmId || !proposalId || !guestId) {
    throw new Error('Existing VM ID, Proposal ID, and Guest ID are required');
  }

  console.log('📅 Requesting alternative meeting (previous declined)');

  // Mark old VM as superseded (keep declined flag)
  await supabase
    .from('virtual_meetings')
    .update({
      meeting_declined: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', existingVmId);

  // Create new VM request
  return await requestVirtualMeeting(proposalId, guestId);
}

/**
 * Respond to virtual meeting request by booking a date
 * Implements workflow crpVt2: "B: Request Virtual Meeting new is clicked RESPOND to VM"
 *
 * @param {string} vmId - Virtual meeting ID
 * @param {string} bookedDate - ISO timestamp of the booked date
 * @returns {Promise<Object>} Updated virtual meeting object
 */
export async function respondToVirtualMeeting(vmId, bookedDate) {
  if (!vmId || !bookedDate) {
    throw new Error('Virtual meeting ID and booked date are required');
  }

  console.log('📅 Responding to virtual meeting:', vmId);

  const { data, error } = await supabase
    .from('virtual_meetings')
    .update({
      booked_date: bookedDate,
      confirmed_by_splitlease: false, // Needs admin confirmation after booking
      updated_at: new Date().toISOString()
    })
    .eq('id', vmId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error responding to virtual meeting:', error);
    throw new Error(`Failed to respond to virtual meeting: ${error.message}`);
  }

  console.log('✅ Virtual meeting date booked:', data.id);
  return data;
}

/**
 * Decline a virtual meeting request
 *
 * @param {string} vmId - Virtual meeting ID
 * @returns {Promise<Object>} Updated virtual meeting object
 */
export async function declineVirtualMeeting(vmId) {
  if (!vmId) {
    throw new Error('Virtual meeting ID is required');
  }

  console.log('❌ Declining virtual meeting:', vmId);

  const { data, error } = await supabase
    .from('virtual_meetings')
    .update({
      meeting_declined: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', vmId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error declining virtual meeting:', error);
    throw new Error(`Failed to decline virtual meeting: ${error.message}`);
  }

  console.log('✅ Virtual meeting declined:', data.id);
  return data;
}

/**
 * Cancel a virtual meeting request (guest-initiated cancellation)
 * Different from decline - used when guest wants to retract their own request
 *
 * @param {string} vmId - Virtual meeting ID
 * @returns {Promise<Object>} Updated virtual meeting object
 */
export async function cancelVirtualMeetingRequest(vmId) {
  if (!vmId) {
    throw new Error('Virtual meeting ID is required');
  }

  console.log('🗑️ Cancelling virtual meeting request:', vmId);

  const { data, error } = await supabase
    .from('virtual_meetings')
    .update({
      meeting_declined: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', vmId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error cancelling virtual meeting:', error);
    throw new Error(`Failed to cancel virtual meeting: ${error.message}`);
  }

  console.log('✅ Virtual meeting request cancelled:', data.id);
  return data;
}

/**
 * Get confirmed virtual meeting details
 * Implements workflow cuvLq5: "B: Request Virtual Meeting new is clicked RESPOND to VM (copy)"
 *
 * @param {Object} vm - Virtual meeting object
 * @returns {Object|null} Meeting details if confirmed, null otherwise
 */
export function getConfirmedMeetingDetails(vm) {
  if (!vm || !vm.confirmed_by_splitlease) {
    return null;
  }

  return {
    id: vm.id,
    uniqueId: vm.unique_id,
    bookedDate: vm.booked_date,
    meetingLink: vm.meeting_link,
    isConfirmed: true,
    canJoin: vm.meeting_link != null
  };
}

/**
 * UI handler for request virtual meeting button
 * Determines which action to take based on current VM state
 *
 * @param {Object} proposal - Full proposal object
 * @param {string} currentUserId - Current user's ID
 * @param {Function} onSuccess - Callback on successful action
 * @param {Function} onError - Callback on error
 * @param {Function} onShowRespondModal - Callback to show respond modal
 */
export async function handleRequestVirtualMeeting(
  proposal,
  currentUserId,
  onSuccess,
  onError,
  onShowRespondModal
) {
  try {
    const proposalId = proposal._id || proposal.id;
    const vm = proposal.virtualMeeting;

    // State 1: No VM exists - Create new request (workflow crkdt5)
    if (!vm) {
      const confirmed = window.confirm(
        'Would you like to request a virtual meeting with the host? This will notify them of your interest.'
      );

      if (!confirmed) {
        return;
      }

      await requestVirtualMeeting(proposalId, currentUserId);

      if (onSuccess) {
        onSuccess({
          action: 'requested',
          message: 'Virtual meeting requested successfully! The host will be notified.'
        });
      }
      return;
    }

    // State 5: VM declined - Request alternative (workflow crpWM2)
    if (vm.meeting_declined) {
      const confirmed = window.confirm(
        'The previous meeting request was declined. Would you like to request an alternative meeting time?'
      );

      if (!confirmed) {
        return;
      }

      await requestAlternativeMeeting(vm.id, proposalId, currentUserId);

      if (onSuccess) {
        onSuccess({
          action: 'alternative_requested',
          message: 'Alternative meeting requested!'
        });
      }
      return;
    }

    // State 2: VM requested by host, guest needs to respond (workflow crpVt2)
    if (vm.requested_by !== currentUserId && !vm.booked_date) {
      // Show respond modal for guest to select a date
      if (onShowRespondModal) {
        onShowRespondModal(vm);
      }
      return;
    }

    // State 3: VM booked but not confirmed - View details
    if (vm.booked_date && !vm.confirmed_by_splitlease) {
      if (onSuccess) {
        onSuccess({
          action: 'view_details',
          message: 'Meeting scheduled, awaiting Split Lease confirmation',
          bookedDate: vm.booked_date,
          uniqueId: vm.unique_id
        });
      }
      return;
    }

    // State 4: VM confirmed - Join meeting (workflow cuvLq5)
    if (vm.booked_date && vm.confirmed_by_splitlease) {
      if (vm.meeting_link) {
        window.open(vm.meeting_link, '_blank');
        if (onSuccess) {
          onSuccess({
            action: 'joined',
            message: 'Opening meeting link...'
          });
        }
      } else {
        if (onError) {
          onError('Meeting is confirmed but link is not available yet');
        }
      }
      return;
    }

    // Fallback: Unknown state
    if (onError) {
      onError('Unknown virtual meeting state');
    }

  } catch (err) {
    console.error('❌ Virtual meeting error:', err);
    if (onError) {
      onError(err.message || 'Failed to process virtual meeting request');
    }
  }
}

/**
 * UI handler for responding to a VM with a booked date
 * Called from the respond modal when user selects a date
 *
 * @param {string} vmId - Virtual meeting ID
 * @param {string} bookedDate - ISO timestamp
 * @param {Function} onSuccess - Callback on success
 * @param {Function} onError - Callback on error
 */
export async function handleRespondWithDate(vmId, bookedDate, onSuccess, onError) {
  try {
    await respondToVirtualMeeting(vmId, bookedDate);

    if (onSuccess) {
      onSuccess({
        message: 'Meeting date submitted! Awaiting Split Lease confirmation.',
        bookedDate
      });
    }
  } catch (err) {
    console.error('❌ Error responding to VM:', err);
    if (onError) {
      onError(err.message || 'Failed to book meeting date');
    }
  }
}

/**
 * UI handler for declining a VM request
 *
 * @param {string} vmId - Virtual meeting ID
 * @param {Function} onSuccess - Callback on success
 * @param {Function} onError - Callback on error
 */
export async function handleDeclineVirtualMeeting(vmId, onSuccess, onError) {
  try {
    const confirmed = window.confirm(
      'Are you sure you want to decline this virtual meeting request?'
    );

    if (!confirmed) {
      return;
    }

    await declineVirtualMeeting(vmId);

    if (onSuccess) {
      onSuccess({
        message: 'Virtual meeting request declined'
      });
    }
  } catch (err) {
    console.error('❌ Error declining VM:', err);
    if (onError) {
      onError(err.message || 'Failed to decline meeting');
    }
  }
}

/**
 * UI handler for cancelling guest's own VM request
 *
 * @param {string} vmId - Virtual meeting ID
 * @param {Function} onSuccess - Callback on success
 * @param {Function} onError - Callback on error
 */
export async function handleCancelVirtualMeetingRequest(vmId, onSuccess, onError) {
  try {
    const confirmed = window.confirm(
      'Are you sure you want to cancel your virtual meeting request?'
    );

    if (!confirmed) {
      return;
    }

    await cancelVirtualMeetingRequest(vmId);

    if (onSuccess) {
      onSuccess({
        message: 'Virtual meeting request cancelled'
      });
    }
  } catch (err) {
    console.error('❌ Error cancelling VM:', err);
    if (onError) {
      onError(err.message || 'Failed to cancel meeting request');
    }
  }
}

/**
 * Get VM button text based on current state
 *
 * @param {Object} vm - Virtual meeting object
 * @param {string} currentUserId - Current user's ID
 * @returns {string} Button text
 */
export function getVMButtonText(vm, currentUserId) {
  if (!vm) {
    return 'Request Virtual Meeting';
  }

  if (vm.meeting_declined) {
    return 'Request Alternative Meeting';
  }

  if (!vm.booked_date) {
    if (vm.requested_by === currentUserId) {
      return 'Meeting Requested';
    } else {
      return 'Respond to Virtual Meeting';
    }
  }

  if (vm.booked_date && !vm.confirmed_by_splitlease) {
    return 'View Meeting Details';
  }

  if (vm.booked_date && vm.confirmed_by_splitlease) {
    return 'Join Virtual Meeting';
  }

  return 'Virtual Meeting';
}

/**
 * Check if VM button should be disabled
 *
 * @param {Object} vm - Virtual meeting object
 * @param {string} currentUserId - Current user's ID
 * @returns {boolean} True if button should be disabled
 */
export function isVMButtonDisabled(vm, currentUserId) {
  if (!vm) {
    return false; // Can request new meeting
  }

  // Disable if guest requested and waiting for host response
  if (vm.requested_by === currentUserId && !vm.booked_date && !vm.meeting_declined) {
    return true;
  }

  return false;
}
