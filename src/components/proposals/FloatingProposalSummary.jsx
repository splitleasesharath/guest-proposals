/**
 * FloatingProposalSummary Component
 * Sticky floating panel displaying key proposal information
 * Remains visible during scroll for quick reference
 */

import { formatPrice } from '../../lib/supabase/dataTransformers.js';
import '../../styles/floating-summary.css';

export default function FloatingProposalSummary({ proposal }) {
  if (!proposal) return null;

  const statusInfo = getStatusInfo(proposal.status);

  return (
    <div className="floating-summary">
      <div className="floating-summary-content">
        {/* Status Indicator */}
        <div className={`floating-status status-${statusInfo.color}`}>
          <span className="status-dot"></span>
          <span className="status-label">{statusInfo.shortLabel}</span>
        </div>

        {/* Price Display */}
        <div className="floating-price-section">
          <div className="floating-price-main">
            <span className="floating-price-label">Total</span>
            <span className="floating-price-value">{formatPrice(proposal.totalPrice)}</span>
          </div>
          {proposal.nightlyPrice && (
            <div className="floating-price-secondary">
              {formatPrice(proposal.nightlyPrice)}/night
            </div>
          )}
        </div>

        {/* Key Details */}
        <div className="floating-details">
          <div className="floating-detail-item">
            <span className="floating-detail-label">Duration</span>
            <span className="floating-detail-value">{proposal.reservationWeeks} Weeks</span>
          </div>
          {proposal.damageDeposit && (
            <div className="floating-detail-item">
              <span className="floating-detail-label">Deposit</span>
              <span className="floating-detail-value">{formatPrice(proposal.damageDeposit)}</span>
            </div>
          )}
          {proposal.cleaningFee && proposal.cleaningFee !== 0 && (
            <div className="floating-detail-item">
              <span className="floating-detail-label">Cleaning Fee</span>
              <span className="floating-detail-value">{formatPrice(proposal.cleaningFee)}</span>
            </div>
          )}
        </div>

        {/* Quick Action Button */}
        <button className="floating-action-btn">
          View Full Details
        </button>
      </div>
    </div>
  );
}

// Helper to get status display info (shortened for floating panel)
function getStatusInfo(status) {
  const statusMap = {
    'Proposal Cancelled by Guest': { color: 'red', shortLabel: 'Cancelled' },
    'Proposal Cancelled by Split Lease': { color: 'red', shortLabel: 'Cancelled' },
    'Proposal Rejected by Host': { color: 'red', shortLabel: 'Rejected' },
    'Proposal or Counteroffer Accepted / Drafting Lease Documents': { color: 'green', shortLabel: 'Accepted' },
    'Initial Payment Submitted / Lease activated': { color: 'green', shortLabel: 'Active' },
    'Lease Documents Sent for Review': { color: 'blue', shortLabel: 'Review Docs' },
    'Host Counteroffer Submitted / Awaiting Guest Review': { color: 'yellow', shortLabel: 'Counteroffer' },
    'Host Review': { color: 'blue', shortLabel: 'In Review' },
    'Proposal Submitted by guest - Awaiting Rental Application': { color: 'blue', shortLabel: 'Submit App' },
    'Pending': { color: 'gray', shortLabel: 'Pending' }
  };

  return statusMap[status] || { color: 'gray', shortLabel: 'Unknown' };
}
