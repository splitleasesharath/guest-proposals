/**
 * ProposalCard Component
 * Displays detailed information about a selected proposal
 *
 * This is a stub - full implementation will be added in later phases
 */

import { formatPrice, formatDate } from '../../lib/supabase/dataTransformers.js';

export default function ProposalCard({ proposal }) {
  if (!proposal) {
    return (
      <div className="proposal-card">
        <p>No proposal selected</p>
      </div>
    );
  }

  const { listing, host, virtualMeeting } = proposal;

  return (
    <div className="proposal-card">
      <div className="proposal-header">
        <h3>{listing?.name || 'Unknown Listing'}</h3>
        <span className={`status-badge status-${proposal.status}`}>
          {proposal.status}
        </span>
      </div>

      <div className="proposal-section">
        <h4>Host Information</h4>
        <div className="host-info">
          {host?.profilePhoto && (
            <img src={host.profilePhoto} alt={host.fullName} className="host-photo" />
          )}
          <div>
            <p className="host-name">{host?.fullName || 'Unknown Host'}</p>
            <div className="host-verification">
              {host?.linkedInVerified && <span className="verify-badge">LinkedIn Verified</span>}
              {host?.phoneVerified && <span className="verify-badge">Phone Verified</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="proposal-section">
        <h4>Listing Details</h4>
        <p className="listing-address">
          {listing?.borough && `${listing.borough}, `}
          {listing?.hood || ''}
        </p>
        {listing?.photos && listing.photos.length > 0 && (
          <img
            src={listing.photos[0]}
            alt={listing.name}
            className="listing-photo"
          />
        )}
      </div>

      <div className="proposal-section">
        <h4>Reservation Details</h4>
        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">Move-in:</span>
            <span className="detail-value">{formatDate(proposal.moveInStart)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Duration:</span>
            <span className="detail-value">{proposal.reservationWeeks} weeks</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Nights per week:</span>
            <span className="detail-value">{proposal.nightsPerWeek}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Check-in day:</span>
            <span className="detail-value">{proposal.checkInDay || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="proposal-section">
        <h4>Pricing</h4>
        <div className="pricing-grid">
          <div className="price-item">
            <span className="price-label">Nightly Rate:</span>
            <span className="price-value">{formatPrice(proposal.nightlyPrice)}</span>
          </div>
          <div className="price-item total-price">
            <span className="price-label">Total Price:</span>
            <span className="price-value">{formatPrice(proposal.totalPrice)}</span>
          </div>
        </div>
      </div>

      {virtualMeeting && (
        <div className="proposal-section">
          <h4>Virtual Meeting</h4>
          <div className="virtual-meeting-info">
            {virtualMeeting.bookedDate && (
              <p>Scheduled: {formatDate(virtualMeeting.bookedDate)}</p>
            )}
            {virtualMeeting.meetingLink && (
              <a
                href={virtualMeeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="meeting-link-button"
              >
                Join Meeting
              </a>
            )}
          </div>
        </div>
      )}

      <div className="proposal-actions">
        <button className="action-button primary">View Full Details</button>
        <button className="action-button secondary">Contact Host</button>
      </div>
    </div>
  );
}
