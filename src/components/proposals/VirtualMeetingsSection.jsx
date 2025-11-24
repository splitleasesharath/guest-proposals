/**
 * VirtualMeetingsSection Component
 * Displays virtual meeting cards for the current proposal
 * Shows meeting date/time, host info, and response options
 */

import { useState } from 'react';
import { handleCancelVirtualMeetingRequest } from '../../lib/workflows/virtualMeetings.js';
import RespondVirtualMeetingModal from './RespondVirtualMeetingModal.jsx';
import '../../styles/virtual-meetings.css';

export default function VirtualMeetingsSection({ proposal, onUpdate }) {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Get virtual meeting from proposal (single meeting, not array)
  const virtualMeeting = proposal?.virtualMeeting;

  // Format suggested timeslots from JSONB array
  function formatTimeslots(timeslotsArray) {
    if (!timeslotsArray || !Array.isArray(timeslotsArray)) return [];

    return timeslotsArray.map(isoString => {
      try {
        const date = new Date(isoString);
        return {
          formatted: date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          iso: isoString
        };
      } catch (err) {
        console.error('Error formatting timeslot:', err);
        return null;
      }
    }).filter(Boolean);
  }

  function handleRespondClick(meeting) {
    setSelectedMeeting(meeting);
    setShowRespondModal(true);
  }

  function handleModalClose() {
    setShowRespondModal(false);
    setSelectedMeeting(null);
  }

  function getStatusBadgeClass(status) {
    const statusMap = {
      'suggested': 'vm-status-suggested',
      'confirmed': 'vm-status-confirmed',
      'awaiting_confirmation': 'vm-status-awaiting',
      'cancelled': 'vm-status-cancelled'
    };
    return statusMap[status?.toLowerCase()] || 'vm-status-suggested';
  }

  function getStatusLabel(status) {
    const labelMap = {
      'suggested': 'Suggested',
      'confirmed': 'Confirmed',
      'awaiting_confirmation': 'Awaiting Confirmation',
      'cancelled': 'Cancelled'
    };
    return labelMap[status?.toLowerCase()] || status;
  }

  function formatMeetingDateTime(dateString) {
    if (!dateString) return 'Date TBD';

    try {
      const date = new Date(dateString);
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
        timeZoneName: 'short'
      };
      return date.toLocaleString('en-US', options);
    } catch (err) {
      return dateString;
    }
  }

  // Don't show section if no virtual meeting exists
  if (!virtualMeeting) {
    return null;
  }

  const timeslots = formatTimeslots(virtualMeeting.suggestedTimeslots);
  const hostName = proposal.host?.firstName || 'Host';

  return (
    <div className="virtual-meetings-section">
      <div className="vm-section-header">
        <h2 className="vm-section-title">Virtual Meetings</h2>
      </div>

      <div className="vm-card">
        {/* Host Info & Property Name */}
        <div className="vm-card-host">
          {proposal.host?.profilePhoto && (
            <img
              src={proposal.host.profilePhoto}
              alt={hostName}
              className="vm-host-avatar"
            />
          )}
          <div className="vm-host-info">
            <p className="vm-host-name">
              {hostName} - {proposal.listing?.name}
            </p>
          </div>
        </div>

        {/* Meeting Status Message */}
        <div className="vm-meeting-status">
          <svg className="vm-calendar-icon" viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19,4H18V2H16V4H8V2H6V4H5C3.89,4 3,4.9 3,6V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V6A2,2 0 0,0 19,4M19,20H5V10H19V20M5,8V6H19V8H5Z" />
          </svg>
          <span className="vm-status-text">
            A virtual meeting with {hostName} has been suggested for the times:
          </span>
        </div>

        {/* Time Slots Pills */}
        <div className="vm-timeslots">
          {timeslots.map((slot, index) => (
            <div key={index} className="vm-timeslot-pill">
              {slot.formatted}
            </div>
          ))}
        </div>

        {/* Cancel Button */}
        <div className="vm-card-actions">
          <button
            className="btn-vm-cancel"
            onClick={() => setShowCancelModal(true)}
          >
            Cancel Virtual Meeting
          </button>
        </div>
      </div>

      {/* Respond Modal (if needed for other states) */}
      {selectedMeeting && (
        <RespondVirtualMeetingModal
          isOpen={showRespondModal}
          onClose={handleModalClose}
          meeting={selectedMeeting}
          proposal={proposal}
        />
      )}

      {/* Cancel Confirmation Modal - TODO: Create this component */}
      {showCancelModal && (
        <div className="vm-cancel-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="vm-cancel-modal" onClick={(e) => e.stopPropagation()}>
            <button className="vm-cancel-modal-close" onClick={() => setShowCancelModal(false)}>
              ✕
            </button>
            <div className="vm-cancel-modal-content">
              <div className="vm-cancel-header">
                <svg className="vm-cancel-icon" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
                </svg>
                <h3>Cancel Virtual Meeting?</h3>
              </div>
              <p className="vm-cancel-warning">This action cannot be undone</p>
              <div className="vm-cancel-details">
                <svg className="vm-calendar-icon" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M19,4H18V2H16V4H8V2H6V4H5C3.89,4 3,4.9 3,6V20A2,2 0 0,0 5,22H19A2,2 0 0,0 21,20V6A2,2 0 0,0 19,4M19,20H5V10H19V20M5,8V6H19V8H5Z" />
                </svg>
                <div>
                  <p className="vm-cancel-meeting-name">Meeting with {hostName}</p>
                  <p className="vm-cancel-property-name">{proposal.listing?.name}</p>
                </div>
              </div>
              <div className="vm-cancel-actions">
                <button className="btn-vm-cancel-no" onClick={() => setShowCancelModal(false)}>
                  No
                </button>
                <button
                  className="btn-vm-cancel-confirm"
                  onClick={() => {
                    setIsCancelling(true);
                    handleCancelVirtualMeetingRequest(
                      virtualMeeting.id,
                      (result) => {
                        console.log('✅ Virtual meeting cancelled:', result.message);
                        setShowCancelModal(false);
                        setIsCancelling(false);
                        if (onUpdate) onUpdate(); // Refresh proposal data
                      },
                      (err) => {
                        console.error('❌ Cancel error:', err);
                        alert(`Failed to cancel meeting: ${err}`);
                        setIsCancelling(false);
                      }
                    );
                  }}
                  disabled={isCancelling}
                >
                  {isCancelling ? 'Cancelling...' : 'Cancel Meeting'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
