/**
 * VirtualMeetingsSection Component
 * Displays virtual meeting cards for the current proposal
 * Shows meeting date/time, host info, and response options
 */

import { useState } from 'react';
import RespondVirtualMeetingModal from './RespondVirtualMeetingModal.jsx';
import '../../styles/virtual-meetings.css';

export default function VirtualMeetingsSection({ proposal }) {
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showRespondModal, setShowRespondModal] = useState(false);

  // Get virtual meetings from proposal
  const virtualMeetings = proposal?.virtualMeetings || [];

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

  return (
    <div className="virtual-meetings-section">
      <div className="vm-section-header">
        <h2 className="vm-section-title">Virtual Meetings</h2>
        <p className="vm-section-subtitle">
          Schedule and manage virtual meetings with your host
        </p>
      </div>

      {virtualMeetings.length > 0 && (
        <div className="vm-cards-container">
          {virtualMeetings.map((meeting) => (
          <div key={meeting.id} className="vm-card">
            {/* Host Info */}
            <div className="vm-card-host">
              {proposal.host?.profilePhoto && (
                <img
                  src={proposal.host.profilePhoto}
                  alt={proposal.host.firstName || 'Host'}
                  className="vm-host-avatar"
                />
              )}
              <div className="vm-host-info">
                <p className="vm-host-name">
                  Meeting with {proposal.host?.firstName || 'Host'}
                </p>
                <p className="vm-meeting-id">Meeting ID: {meeting.uniqueId || meeting.id}</p>
              </div>
            </div>

            {/* Meeting Details */}
            <div className="vm-card-details">
              <div className="vm-detail-row">
                <span className="vm-detail-label">Date & Time:</span>
                <span className="vm-detail-value">
                  {formatMeetingDateTime(meeting.bookedDate || meeting.scheduledDate)}
                </span>
              </div>

              {meeting.platform && (
                <div className="vm-detail-row">
                  <span className="vm-detail-label">Platform:</span>
                  <span className="vm-detail-value">{meeting.platform}</span>
                </div>
              )}

              {meeting.meetingLink && meeting.status === 'confirmed' && (
                <div className="vm-detail-row">
                  <span className="vm-detail-label">Link:</span>
                  <a
                    href={meeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vm-meeting-link"
                  >
                    Join Meeting
                  </a>
                </div>
              )}

              {/* Status Badge */}
              <div className="vm-status-container">
                <span className={`vm-status-badge ${getStatusBadgeClass(meeting.status)}`}>
                  {getStatusLabel(meeting.status)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="vm-card-actions">
              {meeting.status !== 'confirmed' && meeting.status !== 'cancelled' && (
                <button
                  className="btn-vm-respond"
                  onClick={() => handleRespondClick(meeting)}
                >
                  Respond to Virtual Meeting
                </button>
              )}
              {meeting.status === 'confirmed' && (
                <button className="btn-vm-reschedule" disabled>
                  Reschedule (Coming Soon)
                </button>
              )}
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Respond Modal */}
      {selectedMeeting && (
        <RespondVirtualMeetingModal
          isOpen={showRespondModal}
          onClose={handleModalClose}
          meeting={selectedMeeting}
          proposal={proposal}
        />
      )}
    </div>
  );
}
