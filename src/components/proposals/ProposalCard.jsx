/**
 * ProposalCard Component
 * Displays detailed information about a selected proposal
 */

import { formatPrice, formatDate } from '../../lib/supabase/dataTransformers.js';

// Helper to get status display info
function getStatusInfo(status) {
  const statusMap = {
    'Proposal Cancelled by Guest': { color: 'red', label: 'Cancelled by You' },
    'Proposal Cancelled by Split Lease': { color: 'red', label: 'Proposal Cancelled' },
    'Proposal Rejected by Host': { color: 'red', label: 'Rejected by Host' },
    'Proposal or Counteroffer Accepted / Drafting Lease Documents': { color: 'green', label: 'Proposal Accepted! Drafting Lease' },
    'Initial Payment Submitted / Lease activated': { color: 'green', label: 'Lease Activated' },
    'Lease Documents Sent for Review': { color: 'blue', label: 'Review Lease Documents' },
    'Host Counteroffer Submitted / Awaiting Guest Review': { color: 'yellow', label: 'Host Counteroffer - Your Review' },
    'Host Review': { color: 'blue', label: 'Under Host Review' },
    'Proposal Submitted by guest - Awaiting Rental Application': { color: 'blue', label: 'Submit Rental Application' },
    'Pending': { color: 'gray', label: 'Pending' }
  };

  return statusMap[status] || { color: 'gray', label: status };
}

// Helper to render weekly schedule
function WeeklySchedule({ nightsSelected }) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="weekly-schedule">
      {days.map((day, index) => {
        const isSelected = nightsSelected && nightsSelected.includes(dayNames[index]);
        return (
          <div key={index} className={`day-cell ${isSelected ? 'selected' : ''}`}>
            {day}
          </div>
        );
      })}
    </div>
  );
}

// Progress tracker component
function ProgressTracker({ currentStage }) {
  const stages = [
    'Proposal Submitted',
    'Rental Application Submitted',
    'Host Review Complete',
    'Drafting Lease Docs',
    'Lease Documents',
    'Initial Payment'
  ];

  const currentIndex = currentStage ? parseInt(currentStage) - 1 : 0;

  return (
    <div className="progress-tracker">
      {stages.map((stage, index) => (
        <div key={index} className="progress-step">
          <div className={`progress-circle ${index <= currentIndex ? 'completed' : ''} ${index === currentIndex ? 'current' : ''}`}>
            {index < currentIndex ? '✓' : index + 1}
          </div>
          <div className="progress-label">{stage}</div>
        </div>
      ))}
    </div>
  );
}

export default function ProposalCard({ proposal }) {
  if (!proposal) {
    return (
      <div className="proposal-card">
        <p>No proposal selected</p>
      </div>
    );
  }

  const { listing, host } = proposal;
  const statusInfo = getStatusInfo(proposal.status);

  return (
    <div className="proposal-card">
      {/* Prominent Status Banner - Always show for non-pending proposals */}
      {!proposal.status.includes('Pending') && (
        <div className={`status-banner status-${statusInfo.color}`}>
          <strong>{statusInfo.label}</strong>
          {proposal.reasonForCancellation && (
            <p>Reason: {proposal.reasonForCancellation}</p>
          )}
        </div>
      )}

      <div className="proposal-header">
        <h3>{listing?.name}</h3>
        {/* Location Information */}
        {listing?.address?.address && (
          <p className="listing-location">
            {listing.hood || listing.borough}
          </p>
        )}
        <span className={`status-badge status-${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="proposal-section">
        <h4>Host Information</h4>
        <div className="host-info">
          {host?.profilePhoto && (
            <img src={host.profilePhoto} alt={host.fullName} className="host-photo" />
          )}
          <div>
            <p className="host-name">{host?.fullName}</p>
            <div className="host-verification">
              {host?.linkedInVerified && <span className="verify-badge">LinkedIn Verified</span>}
              {host?.phoneVerified && <span className="verify-badge">Phone Verified</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="proposal-section">
        <h4>Listing Details</h4>
        {listing?.address?.address && (
          <p className="listing-address">{listing.address.address}</p>
        )}
        {(listing?.borough || listing?.hood) && (
          <p className="listing-area">
            {listing.hood && `${listing.hood}, `}
            {listing.borough}
          </p>
        )}
        <div className="listing-actions">
          <button className="action-button secondary">View Listing</button>
          <button className="action-button secondary">View Map</button>
          <button className="action-button secondary">Host Profile</button>
          <button className="action-button secondary">Send a Message</button>
        </div>
      </div>

      <div className="proposal-section">
        <h4>Schedule</h4>
        <div className="schedule-info">
          <p><strong>{proposal.checkInDay}</strong> thru <strong>{proposal.checkOutDay}</strong></p>
          <p className="duration-text">{proposal.reservationWeeks} Weeks</p>
        </div>
        <WeeklySchedule nightsSelected={proposal.nightsSelected} />
        {(listing?.checkInTime || listing?.checkOutTime) && (
          <div className="times-grid">
            {listing?.checkInTime && (
              <div>
                <span className="time-label">Check-in:</span>
                <span className="time-value">{listing.checkInTime}</span>
              </div>
            )}
            {listing?.checkOutTime && (
              <div>
                <span className="time-label">Check-out:</span>
                <span className="time-value">{listing.checkOutTime}</span>
              </div>
            )}
          </div>
        )}
        {proposal.moveInStart && (
          <p className="move-in-date">
            <strong>Anticipated Move-in:</strong> {formatDate(proposal.moveInStart)}
          </p>
        )}
      </div>

      <div className="proposal-section">
        <h4>Pricing</h4>
        <div className="pricing-details">
          {proposal.totalPrice && (
            <div className="price-row">
              <span>Total Price:</span>
              <span className="price-large">{formatPrice(proposal.totalPrice)}</span>
            </div>
          )}
          {proposal.nightlyPrice && (
            <div className="price-row">
              <span>Nightly Rate:</span>
              <span>{formatPrice(proposal.nightlyPrice)}</span>
            </div>
          )}
          {proposal.damageDeposit && (
            <div className="price-row">
              <span>Damage Deposit:</span>
              <span>{formatPrice(proposal.damageDeposit)}</span>
            </div>
          )}
          {proposal.cleaningFee && (
            <div className="price-row">
              <span>Cleaning Fee:</span>
              <span>{formatPrice(proposal.cleaningFee)}</span>
            </div>
          )}
        </div>
      </div>

      {listing?.houseRules && (
        <div className="proposal-section">
          <h4>House Rules</h4>
          <button className="action-button text-button">See House Rules</button>
        </div>
      )}

      {/* Progress Tracker */}
      {proposal.proposalStage && (
        <div className="proposal-section">
          <h4>Progress</h4>
          <ProgressTracker currentStage={proposal.proposalStage} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="proposal-actions">
        {!proposal.status.includes('Cancelled') && !proposal.status.includes('Rejected') && (
          <>
            <button className="action-button primary">See Details</button>
            {proposal.virtualMeetingId && (
              <button className="action-button secondary">Virtual Meetings</button>
            )}
            <button className="action-button secondary">Remind Split Lease</button>
            <button className="action-button danger">Cancel Proposal</button>
          </>
        )}
      </div>
    </div>
  );
}
