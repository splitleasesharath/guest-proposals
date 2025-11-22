/**
 * Cancel Proposal Workflow Module
 *
 * Implements the 7 variations of the cancel proposal workflow from Bubble.io:
 * - crkec5: Cancel Proposal (Condition 1) - Basic cancellation
 * - crswt2: Cancel Proposal (Condition 2) - Usual Order > 5 and House manual not empty
 * - crtCg2: Cancel Proposal (Condition 3) - Status is Cancelled or Rejected
 * - curuC4: Cancel Proposal (Condition 4) - Additional variation
 * - curuK4: Cancel Proposal (Condition 5) - Same as condition 2
 * - curua4: Cancel Proposal (Condition 6) - Same as condition 3
 * - crkZs5: Cancel Proposal in Compare Terms popup
 *
 * Decision Tree:
 * 1. Check if already cancelled/rejected → Show message, don't allow cancel
 * 2. Check if Usual Order > 5 AND House manual not empty → Special confirmation
 * 3. Otherwise → Standard confirmation
 *
 * All cancellations result in:
 * - Status: 'Proposal Cancelled by Guest'
 * - Deleted: true (soft delete)
 * - Modified Date: current timestamp
 * - Optional: reason for cancellation
 */

import { supabase } from '../supabase/supabase.js';

/**
 * Evaluate which cancellation workflow condition applies
 * Based on Bubble.io workflows crkec5, crswt2, crtCg2, curuC4, curuK4, curua4
 *
 * @param {Object} proposal - Full proposal object
 * @returns {Object} Condition details with workflow info
 */
export async function determineCancellationCondition(proposal) {
  if (!proposal) {
    return {
      condition: 'invalid',
      workflow: null,
      allowCancel: false,
      message: 'Invalid proposal data'
    };
  }

  const status = proposal.Status || proposal.status;

  // Condition 3 & 6: Already cancelled or rejected - just inform user
  if (
    status === 'Proposal Cancelled by Guest' ||
    status === 'Proposal Cancelled by Split Lease' ||
    status === 'Proposal Rejected by Host'
  ) {
    return {
      condition: 'already_cancelled',
      workflow: 'crtCg2',
      allowCancel: false,
      message: 'This proposal is already cancelled or rejected'
    };
  }

  // Condition 2 & 5: Usual Order > 5 AND House manual not empty
  // Note: 'Usual Order' field doesn't exist in current schema
  // This would need to be added to the proposal table if this condition is needed
  const usualOrder = proposal['Usual Order'] || 0;
  const houseManualNotEmpty = proposal.listing?.['House Manual'] || false;

  if (usualOrder > 5 && houseManualNotEmpty) {
    return {
      condition: 'high_order_with_manual',
      workflow: 'crswt2',
      allowCancel: true,
      requiresConfirmation: true,
      confirmationMessage: 'You have an active rental history. Are you sure you want to cancel? This may affect your standing with the host and future rental opportunities.'
    };
  }

  // Condition 1, 4, and default: Standard cancellation
  return {
    condition: 'standard',
    workflow: 'crkec5',
    allowCancel: true,
    requiresConfirmation: true,
    confirmationMessage: 'Are you sure you want to cancel this proposal? This action cannot be undone.'
  };
}

/**
 * Execute proposal cancellation in database
 * Implements the actual cancellation logic from Bubble.io workflows
 *
 * @param {string} proposalId - Proposal ID to cancel
 * @param {string} reason - Optional reason for cancellation
 * @returns {Promise<Object>} Updated proposal data
 */
export async function cancelProposal(proposalId, reason = null) {
  if (!proposalId) {
    throw new Error('Proposal ID is required');
  }

  const now = new Date().toISOString();

  const updateData = {
    'Status': 'Proposal Cancelled by Guest',
    'Deleted': true, // Soft delete - don't remove from database
    'Modified Date': now
  };

  // Add reason if provided
  if (reason) {
    updateData['reason for cancellation'] = reason;
  }

  console.log('🗑️ Cancelling proposal:', proposalId);

  const { data, error } = await supabase
    .from('proposal')
    .update(updateData)
    .eq('_id', proposalId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error cancelling proposal:', error);
    throw new Error(`Failed to cancel proposal: ${error.message}`);
  }

  console.log('✅ Proposal cancelled successfully:', proposalId);
  return data;
}

/**
 * UI handler for cancel proposal button
 * Shows confirmation modal and executes cancellation
 * This is the main function to call from components
 *
 * @param {Object} proposal - Full proposal object
 * @param {Function} onSuccess - Callback on successful cancellation
 * @param {Function} onError - Callback on error
 * @param {Object} options - Additional options (showReasonPrompt, customMessage)
 */
export async function handleCancelProposal(proposal, onSuccess, onError, options = {}) {
  try {
    // Determine which workflow applies
    const condition = await determineCancellationCondition(proposal);

    if (!condition.allowCancel) {
      if (onError) {
        onError(condition.message);
      }
      return;
    }

    // Show confirmation dialog
    if (condition.requiresConfirmation) {
      const message = options.customMessage || condition.confirmationMessage;
      const confirmed = window.confirm(message);

      if (!confirmed) {
        console.log('ℹ️ User cancelled the cancellation');
        return; // User chose not to cancel
      }
    }

    // Optionally ask for cancellation reason
    let reason = null;
    if (options.showReasonPrompt) {
      reason = window.prompt('Please provide a reason for cancellation (optional):');
      // If user clicks Cancel on prompt, abort the cancellation
      if (reason === null) {
        console.log('ℹ️ User aborted cancellation');
        return;
      }
    }

    // Execute cancellation
    const proposalId = proposal._id || proposal.id;
    await cancelProposal(proposalId, reason);

    // Success callback
    if (onSuccess) {
      onSuccess({
        message: 'Proposal cancelled successfully',
        proposalId,
        reason
      });
    }

  } catch (err) {
    console.error('❌ Cancellation error:', err);
    if (onError) {
      onError(err.message || 'Failed to cancel proposal');
    }
  }
}

/**
 * Cancel proposal from Compare Terms modal (workflow crkZs5)
 * Same as regular cancellation but triggered from different UI location
 *
 * @param {Object} proposal - Full proposal object
 * @param {Function} onSuccess - Callback on successful cancellation
 * @param {Function} onError - Callback on error
 */
export async function handleCancelProposalFromCompareTerms(proposal, onSuccess, onError) {
  console.log('🗑️ Cancel triggered from Compare Terms modal (workflow crkZs5)');

  return handleCancelProposal(
    proposal,
    onSuccess,
    onError,
    {
      customMessage: 'Are you sure you want to decline this counteroffer and cancel your proposal? This action cannot be undone.',
      showReasonPrompt: true
    }
  );
}

/**
 * Check if a proposal can be cancelled
 * Useful for showing/hiding cancel buttons
 *
 * @param {Object} proposal - Proposal object
 * @returns {boolean} True if proposal can be cancelled
 */
export function canCancelProposal(proposal) {
  if (!proposal) {
    return false;
  }

  const status = proposal.Status || proposal.status;

  // Can't cancel if already cancelled or rejected
  if (
    status === 'Proposal Cancelled by Guest' ||
    status === 'Proposal Cancelled by Split Lease' ||
    status === 'Proposal Rejected by Host'
  ) {
    return false;
  }

  // Can't cancel if lease is already activated
  if (status === 'Initial Payment Submitted / Lease activated') {
    return false;
  }

  // Otherwise, can cancel
  return true;
}

/**
 * Get cancel button text based on proposal status
 *
 * @param {Object} proposal - Proposal object
 * @returns {string} Button text
 */
export function getCancelButtonText(proposal) {
  if (!proposal) {
    return 'Cancel Proposal';
  }

  const status = proposal.Status || proposal.status;

  // Special text for counteroffer scenario
  if (status === 'Host Counteroffer Submitted / Awaiting Guest Review') {
    return 'Decline Counteroffer';
  }

  return 'Cancel Proposal';
}

/**
 * Get cancellation reason options (for dropdown/select)
 * Based on common cancellation reasons from Bubble.io workflows
 *
 * @returns {Array<string>} Array of reason options
 */
export function getCancellationReasonOptions() {
  return [
    'Found another property',
    'Changed move-in dates',
    'Changed budget',
    'Changed location preference',
    'No longer need housing',
    'Host not responsive',
    'Terms not acceptable',
    'Other'
  ];
}
