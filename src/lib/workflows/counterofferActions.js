/**
 * Counteroffer Actions Workflow Module
 *
 * Handles accepting and declining counteroffers from hosts.
 * Implements workflow crkcx5: "B: Accept Host Terms is clicked"
 *
 * When a guest accepts a counteroffer:
 * - Update proposal status to 'Proposal or Counteroffer Accepted / Drafting Lease Documents'
 * - Trigger custom event "Accept counteroffer" (workflow crkaD5)
 * - Update Modified Date
 */

import { supabase } from '../supabase/supabase.js';

/**
 * Accept host's counteroffer
 * Implements workflow crkcx5 and triggers crkaD5
 *
 * @param {string} proposalId - Proposal ID
 * @returns {Promise<Object>} Updated proposal data
 */
export async function acceptCounteroffer(proposalId) {
  if (!proposalId) {
    throw new Error('Proposal ID is required');
  }

  console.log('✅ Accepting counteroffer for proposal:', proposalId);

  const now = new Date().toISOString();

  const updateData = {
    'Status': 'Proposal or Counteroffer Accepted / Drafting Lease Documents',
    'Modified Date': now
  };

  const { data, error } = await supabase
    .from('proposal')
    .update(updateData)
    .eq('_id', proposalId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error accepting counteroffer:', error);
    throw new Error(`Failed to accept counteroffer: ${error.message}`);
  }

  console.log('✅ Counteroffer accepted successfully:', proposalId);

  // TODO: Trigger custom event "Accept counteroffer" (workflow crkaD5)
  // This would typically involve backend notification logic
  // For now, just log it
  console.log('📧 Triggering "Accept counteroffer" event notifications');

  return data;
}

/**
 * Decline host's counteroffer
 * This is typically handled by the cancel proposal workflow,
 * but we provide this function for clarity and future extensions
 *
 * @param {string} proposalId - Proposal ID
 * @param {string} reason - Optional reason for declining
 * @returns {Promise<Object>} Updated proposal data
 */
export async function declineCounteroffer(proposalId, reason = null) {
  if (!proposalId) {
    throw new Error('Proposal ID is required');
  }

  console.log('❌ Declining counteroffer for proposal:', proposalId);

  const now = new Date().toISOString();

  const updateData = {
    'Status': 'Proposal Cancelled by Guest',
    'Deleted': true,
    'Modified Date': now
  };

  if (reason) {
    updateData['reason for cancellation'] = reason;
  }

  const { data, error } = await supabase
    .from('proposal')
    .update(updateData)
    .eq('_id', proposalId)
    .select()
    .single();

  if (error) {
    console.error('❌ Error declining counteroffer:', error);
    throw new Error(`Failed to decline counteroffer: ${error.message}`);
  }

  console.log('✅ Counteroffer declined:', proposalId);
  return data;
}

/**
 * Request modification to counteroffer
 * Allows guest to counter the host's counteroffer
 *
 * @param {string} proposalId - Proposal ID
 * @param {Object} modifications - Proposed modifications
 * @returns {Promise<Object>} Updated proposal data
 */
export async function requestCounterModification(proposalId, modifications) {
  if (!proposalId || !modifications) {
    throw new Error('Proposal ID and modifications are required');
  }

  console.log('🔄 Requesting modification to counteroffer:', proposalId);

  // This would involve updating specific fields and notifying the host
  // The implementation depends on the specific business logic
  // For now, this is a placeholder

  throw new Error('Counter-modification feature not yet implemented');
}

/**
 * Check if a proposal has a pending counteroffer that needs review
 *
 * @param {Object} proposal - Proposal object
 * @returns {boolean} True if counteroffer needs review
 */
export function hasPendingCounteroffer(proposal) {
  if (!proposal) {
    return false;
  }

  return (
    proposal['counter offer happened'] === true &&
    proposal.Status === 'Host Counteroffer Submitted / Awaiting Guest Review'
  );
}

/**
 * Get summary of counteroffer changes
 * Useful for notifications and quick reviews
 *
 * @param {Object} proposal - Proposal object
 * @returns {Object} Summary of changes
 */
export function getCounterofferSummary(proposal) {
  if (!proposal || !proposal['counter offer happened']) {
    return null;
  }

  const changes = {
    priceChanged: false,
    scheduleChanged: false,
    durationChanged: false,
    totalChanges: 0,
    details: []
  };

  // Check price changes
  if (
    proposal['hc total price'] != null &&
    proposal['hc total price'] !== proposal['Total Price for Reservation (guest)']
  ) {
    changes.priceChanged = true;
    changes.totalChanges++;
    changes.details.push({
      field: 'price',
      label: 'Total Price',
      original: proposal['Total Price for Reservation (guest)'],
      counteroffer: proposal['hc total price']
    });
  }

  // Check schedule changes
  const originalDays = JSON.stringify(proposal['Days Selected'] || []);
  const counterofferDays = JSON.stringify(proposal['hc days selected'] || []);
  if (counterofferDays !== originalDays && proposal['hc days selected'] != null) {
    changes.scheduleChanged = true;
    changes.totalChanges++;
    changes.details.push({
      field: 'schedule',
      label: 'Weekly Schedule',
      original: proposal['Days Selected'],
      counteroffer: proposal['hc days selected']
    });
  }

  // Check duration changes
  if (
    proposal['hc reservation span (weeks)'] != null &&
    proposal['hc reservation span (weeks)'] !== proposal['Reservation Span (Weeks)']
  ) {
    changes.durationChanged = true;
    changes.totalChanges++;
    changes.details.push({
      field: 'duration',
      label: 'Duration',
      original: proposal['Reservation Span (Weeks)'],
      counteroffer: proposal['hc reservation span (weeks)']
    });
  }

  return changes;
}
