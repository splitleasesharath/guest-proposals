/**
 * ProposalCard Component
 * Displays detailed information about a selected proposal
 */

import { useState } from 'react';
import { formatPrice, formatDate } from '../../lib/supabase/dataTransformers.js';
import { getStatusConfig, getStageFromStatus } from '../../lib/constants/proposalStatuses.js';
import { getAllStagesFormatted } from '../../lib/constants/proposalStages.js';
import { handleCancelProposal, canCancelProposal, getCancelButtonText } from '../../lib/workflows/cancelProposal.js';
import { handleRequestVirtualMeeting, getVMButtonText, isVMButtonDisabled } from '../../lib/workflows/virtualMeetings.js';
import {
  navigateToListing,
  navigateToMessaging,
  navigateToRentalApplication,
  navigateToDocumentReview,
  navigateToLeaseDocuments
} from '../../lib/workflows/navigation.js';
import { getVirtualMeetingState } from '../../lib/supabase/virtualMeetingQueries.js';
import MapsModal from './MapsModal.jsx';
import HostProfileModal from './HostProfileModal.jsx';
import CompareTermsModal from './CompareTermsModal.jsx';
import CounterOfferBanner from './CounterOfferBanner.jsx';
import RespondVirtualMeetingModal from './RespondVirtualMeetingModal.jsx';
import RequestVirtualMeetingModal from './RequestVirtualMeetingModal.jsx';
import CancelProposalModal from './CancelProposalModal.jsx';
import ModifyProposalModal from './ModifyProposalModal.jsx';

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
  // Get all stages formatted with status (completed/current/pending)
  const stages = getAllStagesFormatted(currentStage);

  return (
    <div className="progress-tracker">
      {stages.map((stage) => (
        <div key={stage.id} className={`progress-step ${stage.status}`}>
          <div className={`progress-circle ${stage.isCompleted || stage.isCurrent ? 'active' : ''} ${stage.isCurrent ? 'current' : ''}`}>
            <span className="stage-icon">{stage.isCompleted ? '✓' : stage.icon}</span>
          </div>
          <div className="progress-label" title={stage.description}>
            {stage.shortName}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProposalCard({ proposal, currentUserId, onUpdate }) {
  const [showMapsModal, setShowMapsModal] = useState(false);
  const [showHostProfileModal, setShowHostProfileModal] = useState(false);
  const [showRequestMeetingModal, setShowRequestMeetingModal] = useState(false);
  const [showRespondMeetingModal, setShowRespondMeetingModal] = useState(false);
  const [showCompareTermsModal, setShowCompareTermsModal] = useState(false);
  const [showCancelProposalModal, setShowCancelProposalModal] = useState(false);
  const [showModifyProposalModal, setShowModifyProposalModal] = useState(false);
  const [showHouseRules, setShowHouseRules] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!proposal) {
    return (
      <div className="proposal-card">
        <p>No proposal selected</p>
      </div>
    );
  }

  const { listing, host, virtualMeeting } = proposal;

  // Get status configuration from centralized system
  const statusInfo = getStatusConfig(proposal.status);

  // Get current stage from status (if active)
  const currentStage = getStageFromStatus(proposal.status);

  // Get virtual meeting state
  const vmState = virtualMeeting
    ? getVirtualMeetingState(virtualMeeting, proposal, currentUserId)
    : { state: 'no_meeting', showButton: true, buttonText: 'Request Virtual Meeting' };

  // Clear messages after 5 seconds
  if (error || successMessage) {
    setTimeout(() => {
      setError(null);
      setSuccessMessage(null);
    }, 5000);
  }

  return (
    <div className="proposal-card">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="alert alert-success">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Prominent Status Banner - Always show for non-pending proposals */}
      {!proposal.status.includes('Pending') && (
        <div className={`status-banner status-${statusInfo.color}`}>
          <strong>{statusInfo.label}</strong>
          {proposal.reasonForCancellation && (
            <p>Reason: {proposal.reasonForCancellation}</p>
          )}
        </div>
      )}

      {/* Counteroffer Banner - Show when host has made changes */}
      <CounterOfferBanner
        proposal={proposal}
        onCompareClick={() => setShowCompareTermsModal(true)}
      />

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
              <button
                className="btn-view-listing"
                onClick={() => navigateToListing(proposal)}
              >
                View Listing
              </button>
              <button
                className="btn-view-map"
                onClick={() => setShowMapsModal(true)}
              >
                View Map
              </button>
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

            {/* House Rules Accordion */}
            {listing?.houseRules && listing.houseRules.length > 0 && (
              <div className="house-rules-accordion">
                <button
                  className="house-rules-toggle"
                  onClick={() => setShowHouseRules(!showHouseRules)}
                  aria-expanded={showHouseRules}
                >
                  <span>See House Rules</span>
                  <span className={`toggle-icon ${showHouseRules ? 'open' : ''}`}>▼</span>
                </button>
                {showHouseRules && (
                  <div className="house-rules-content">
                    <ul className="house-rules-list">
                      {listing.houseRules.map((rule, index) => (
                        <li key={rule.id || index} className="house-rule-item">
                          {rule.icon ? (
                            <img src={rule.icon} alt="" className="rule-icon" />
                          ) : (
                            <span className="rule-bullet">•</span>
                          )}
                          <span className="rule-text">{rule.name || rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
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
                {proposal.cleaningFee && proposal.cleaningFee !== 0 && (
                  <p className="cleaning-fee">Cleaning fee {formatPrice(proposal.cleaningFee)}</p>
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

            {/* Action Buttons - Dynamic based on status */}
            <div className="proposal-actions">
              {/* Virtual Meeting Button - Dynamic based on VM state */}
              {vmState.showButton && (
                <button
                  className={`btn-request-meeting btn-${vmState.buttonStyle || 'primary'}`}
                  onClick={() => {
                    // State 1: No VM - Open request modal
                    if (!proposal.virtualMeeting) {
                      setShowRequestMeetingModal(true);
                      return;
                    }

                    // All other states - use workflow handler
                    handleRequestVirtualMeeting(
                      proposal,
                      currentUserId,
                      (result) => {
                        setSuccessMessage(result.message);
                        if (onUpdate) onUpdate();
                      },
                      (err) => setError(err),
                      () => setShowRespondMeetingModal(true)
                    );
                  }}
                  disabled={isVMButtonDisabled(virtualMeeting, currentUserId)}
                >
                  {vmState.buttonText}
                </button>
              )}

              {/* Modify Proposal Button (Guest Action 2) */}
              {proposal.status === 'Proposal Submitted by guest - Awaiting Rental Application' && (
                <button
                  className="btn-modify-proposal"
                  onClick={() => setShowModifyProposalModal(true)}
                >
                  Modify Proposal
                </button>
              )}

              {/* Status-based Action Buttons */}
              {proposal.status === 'Proposal Submitted by guest - Awaiting Rental Application' && (
                <button
                  className="btn-primary-action"
                  onClick={() => navigateToRentalApplication(proposal._id)}
                >
                  Submit Rental Application
                </button>
              )}

              {proposal.status === 'Host Counteroffer Submitted / Awaiting Guest Review' && (
                <button
                  className="btn-primary-action btn-review-counteroffer"
                  onClick={() => setShowCompareTermsModal(true)}
                >
                  Review Counteroffer
                </button>
              )}

              {proposal.status === 'Lease Documents Sent for Review' && (
                <button
                  className="btn-primary-action btn-review-docs"
                  onClick={() => navigateToLeaseDocuments(proposal._id)}
                >
                  Review Lease Documents
                </button>
              )}

              {proposal.status === 'Proposal or Counteroffer Accepted / Drafting Lease Documents' && (
                <button
                  className="btn-primary-action btn-see-details"
                  onClick={() => navigateToDocumentReview(proposal._id)}
                >
                  See Details
                </button>
              )}

              {/* Cancel/Delete Proposal */}
              {canCancelProposal(proposal) && (
                <button
                  className="btn-delete-proposal"
                  onClick={() => setShowCancelProposalModal(true)}
                >
                  {getCancelButtonText(proposal)}
                </button>
              )}
            </div>
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
              <button
                className="btn-host-profile"
                onClick={() => setShowHostProfileModal(true)}
              >
                Host Profile
              </button>
              <button
                className="btn-send-message"
                onClick={() => navigateToMessaging(host?._id, proposal._id)}
              >
                Send a Message
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracker - Always show below the main content */}
      <div className="progress-tracker-container">
        <ProgressTracker currentStage={currentStage} />
        {/* Proposal metadata */}
        <div className="proposal-metadata">
          Proposal unique id: {proposal._id} - Created on: {proposal.createdDate ? formatDate(proposal.createdDate) : 'N/A'}
        </div>
      </div>

      {/* Modals */}
      <MapsModal
        isOpen={showMapsModal}
        onClose={() => setShowMapsModal(false)}
        listing={listing}
      />
      <HostProfileModal
        isOpen={showHostProfileModal}
        onClose={() => setShowHostProfileModal(false)}
        host={host}
      />
      <RequestVirtualMeetingModal
        isOpen={showRequestMeetingModal}
        onClose={() => setShowRequestMeetingModal(false)}
        proposal={proposal}
      />
      <CompareTermsModal
        isOpen={showCompareTermsModal}
        onClose={() => setShowCompareTermsModal(false)}
        proposal={proposal}
        onAccept={(prop) => {
          // Accept counteroffer - update proposal status
          import('../../lib/workflows/counterofferActions.js')
            .then(({ acceptCounteroffer }) => acceptCounteroffer(prop._id))
            .then(() => {
              setSuccessMessage('Counteroffer accepted successfully!');
              setShowCompareTermsModal(false);
              if (onUpdate) onUpdate();
            })
            .catch((err) => setError(err.message || 'Failed to accept counteroffer'));
        }}
        onDecline={(prop) => {
          // Decline counteroffer - same as cancel proposal
          handleCancelProposal(
            prop,
            (result) => {
              setSuccessMessage('Counteroffer declined');
              setShowCompareTermsModal(false);
              if (onUpdate) onUpdate();
            },
            (err) => setError(err),
            {
              customMessage: 'Are you sure you want to decline this counteroffer?',
              showReasonPrompt: true
            }
          );
        }}
      />
      <RespondVirtualMeetingModal
        isOpen={showRespondMeetingModal}
        onClose={() => setShowRespondMeetingModal(false)}
        virtualMeeting={virtualMeeting}
        onRespond={(vmId, bookedDate) => {
          import('../../lib/workflows/virtualMeetings.js')
            .then(({ handleRespondWithDate }) =>
              handleRespondWithDate(
                vmId,
                bookedDate,
                (result) => {
                  setSuccessMessage(result.message);
                  setShowRespondMeetingModal(false);
                  if (onUpdate) onUpdate();
                },
                (err) => setError(err)
              )
            );
        }}
        onDecline={(vmId) => {
          import('../../lib/workflows/virtualMeetings.js')
            .then(({ handleDeclineVirtualMeeting }) =>
              handleDeclineVirtualMeeting(
                vmId,
                (result) => {
                  setSuccessMessage(result.message);
                  setShowRespondMeetingModal(false);
                  if (onUpdate) onUpdate();
                },
                (err) => setError(err)
              )
            );
        }}
      />
      <CancelProposalModal
        isOpen={showCancelProposalModal}
        onClose={() => setShowCancelProposalModal(false)}
        proposal={proposal}
        onConfirm={() => {
          // Call the workflow to cancel the proposal
          handleCancelProposal(
            proposal,
            (result) => {
              setSuccessMessage(result.message);
              setShowCancelProposalModal(false);
              if (onUpdate) onUpdate();
            },
            (err) => {
              setError(err);
              setShowCancelProposalModal(false);
            },
            {
              showReasonPrompt: false, // Don't show additional prompt since modal handles confirmation
              skipConfirmation: true // Skip window.confirm since modal already confirmed
            }
          );
        }}
      />
      <ModifyProposalModal
        isOpen={showModifyProposalModal}
        onClose={() => setShowModifyProposalModal(false)}
        proposal={proposal}
        onSave={(editedProposal) => {
          // TODO: Implement save logic - update proposal with edited values
          console.log('Saving edited proposal:', editedProposal);
          setSuccessMessage('Proposal modified successfully!');
          if (onUpdate) onUpdate();
        }}
      />
    </div>
  );
}
