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

// Helper to render weekly schedule with circular badges
function WeeklySchedule({ daysSelected }) {
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="weekly-schedule">
      {days.map((day, index) => {
        const isSelected = daysSelected && daysSelected.includes(dayNames[index]);
        return (
          <div key={index} className={`day-badge ${isSelected ? 'selected' : 'unselected'}`}>
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
    'Rental App Submitted',
    'Host Review',
    'Review Documents',
    'Lease Documents',
    'Initial Payment'
  ];

  const currentIndex = currentStage ? parseInt(currentStage) - 1 : 0;

  return (
    <div className="progress-tracker">
      {stages.map((stage, index) => {
        const isCompleted = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <div key={index} className={`progress-step ${isCompleted ? 'completed' : ''}`}>
            <div className={`progress-circle ${isCompleted || isCurrent ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
              {isCompleted ? '✓' : ''}
            </div>
            <div className="progress-label">{stage}</div>
          </div>
        );
      })}
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

      {/* Main Content: Two Column Layout */}
      <div className="proposal-content">
        {/* Left Column: Listing Details */}
        <div className="proposal-left">
          {/* Listing Header */}
          <div className="listing-header">
            <h1 className="listing-title">{listing?.name}</h1>
            <p className="listing-subtitle">
              {listing?.hoodName && listing?.boroughName
                ? `${listing.hoodName}, ${listing.boroughName}`
                : listing?.hoodName || listing?.boroughName || ''}
            </p>
            <div className="listing-actions">
              <button className="btn-view-listing">View Listing</button>
              <button className="btn-view-map">View Map</button>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="schedule-section">
            <p className="schedule-days">{proposal.checkInDay} to {proposal.checkOutDay}</p>
            <p className="duration-text">Duration <span className="duration-value">{proposal.reservationWeeks} Weeks</span></p>
            <WeeklySchedule daysSelected={proposal.daysSelected} />
            <div className="schedule-times">
              <p>Check-in {listing?.checkInTime} Check-out {listing?.checkOutTime}</p>
              {proposal.moveInStart && (
                <p>Anticipated Move-in {formatDate(proposal.moveInStart)}</p>
              )}
            </div>
            {listing?.houseRules && (
              <button className="link-button">See House Rules</button>
            )}
          </div>

          {/* Pricing Section */}
          <div className="pricing-section">
            <div className="pricing-grid">
              <div className="pricing-details-left">
                {proposal.totalPrice && (
                  <p className="total-price">Total {formatPrice(proposal.totalPrice)}</p>
                )}
                <p className="fee-note">No maintenance fee</p>
                {proposal.damageDeposit && (
                  <p className="deposit">Damage deposit {formatPrice(proposal.damageDeposit)}</p>
                )}
              </div>
              <div className="pricing-details-right">
                {proposal.nightlyPrice && (
                  <p className="nightly-rate">
                    <span className="rate-amount">{formatPrice(proposal.nightlyPrice)}</span>
                    <span className="rate-label">/ night</span>
                  </p>
                )}
              </div>
            </div>
            <button className="btn-delete-proposal">Delete Proposal</button>
          </div>
        </div>

        {/* Right Column: Host Profile Card */}
        <div className="proposal-right">
          <div className="host-profile-card">
            {/* Background: Listing Photo */}
            <div className="host-card-background">
              {listing?.featuredPhotoUrl && (
                <img src={listing.featuredPhotoUrl} alt={listing.name} className="property-photo" />
              )}
            </div>
            {/* Overlay: Host Info */}
            <div className="host-card-overlay">
              {host?.profilePhoto && (
                <img src={host.profilePhoto} alt={host.fullName} className="host-avatar" />
              )}
              <p className="host-name-label">{host?.firstName || host?.fullName}</p>
              <button className="btn-host-profile">Host Profile</button>
              <button className="btn-send-message">Send a Message</button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracker - Always show below the main content */}
      <div className="progress-tracker-container">
        <ProgressTracker currentStage={proposal.proposalStage} />
      </div>
    </div>
  );
}
