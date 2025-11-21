/**
 * RespondVirtualMeetingModal Component
 * Reusable component for responding to virtual meeting requests
 * Allows guest to accept, suggest different time, or decline
 */

import { useState, useEffect } from 'react';
import CalendarWidget from './CalendarWidget.jsx';
import '../../styles/modals.css';

export default function RespondVirtualMeetingModal({ isOpen, onClose, meeting, proposal }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [responseType, setResponseType] = useState(null); // 'accept' | 'suggest' | 'decline'
  const [declineReason, setDeclineReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setShowCalendar(false);
      setSelectedDate(null);
      setSelectedTime('');
      setResponseType(null);
      setDeclineReason('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen || !meeting) return null;

  const host = proposal?.host;

  function formatMeetingDateTime(dateString) {
    if (!dateString) return 'Date TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZone: 'America/New_York',
        timeZoneName: 'short'
      });
    } catch (err) {
      return dateString;
    }
  }

  function handleAccept() {
    setResponseType('accept');
  }

  function handleSuggestTime() {
    setResponseType('suggest');
    setShowCalendar(true);
  }

  function handleDecline() {
    setResponseType('decline');
  }

  function handleDateSelect(date) {
    setSelectedDate(date);
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // TODO: Implement API call to update meeting response
      console.log('Submitting meeting response:', {
        meetingId: meeting.id,
        responseType,
        selectedDate,
        selectedTime,
        declineReason
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      alert(`Meeting ${responseType === 'accept' ? 'accepted' : responseType === 'decline' ? 'declined' : 'suggestion sent'}!`);

      onClose();
    } catch (error) {
      console.error('Failed to submit response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit =
    (responseType === 'accept') ||
    (responseType === 'suggest' && selectedDate && selectedTime) ||
    (responseType === 'decline' && declineReason.trim());

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-respond-vm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Respond to Virtual Meeting</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Meeting Details */}
          <div className="vm-respond-details">
            <div className="vm-respond-host">
              {host?.profilePhoto && (
                <img
                  src={host.profilePhoto}
                  alt={host.firstName || 'Host'}
                  className="vm-respond-avatar"
                />
              )}
              <div>
                <p className="vm-respond-host-name">
                  {host?.firstName || host?.fullName || 'Host'}
                </p>
                <p className="vm-respond-meeting-id">
                  Meeting ID: {meeting.uniqueId || meeting.id}
                </p>
              </div>
            </div>

            <div className="vm-respond-info">
              <div className="vm-info-row">
                <span className="vm-info-label">Proposed Date & Time:</span>
                <span className="vm-info-value">
                  {formatMeetingDateTime(meeting.bookedDate || meeting.scheduledDate)}
                </span>
              </div>

              {meeting.platform && (
                <div className="vm-info-row">
                  <span className="vm-info-label">Platform:</span>
                  <span className="vm-info-value">{meeting.platform}</span>
                </div>
              )}

              {meeting.notes && (
                <div className="vm-info-row">
                  <span className="vm-info-label">Notes:</span>
                  <span className="vm-info-value">{meeting.notes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Response Options */}
          {!responseType && (
            <div className="vm-respond-actions">
              <h3 className="vm-respond-subtitle">How would you like to respond?</h3>
              <div className="vm-respond-buttons">
                <button
                  className="btn-vm-action btn-vm-accept"
                  onClick={handleAccept}
                >
                  Accept Meeting
                </button>
                <button
                  className="btn-vm-action btn-vm-suggest"
                  onClick={handleSuggestTime}
                >
                  Suggest Different Time
                </button>
                <button
                  className="btn-vm-action btn-vm-decline"
                  onClick={handleDecline}
                >
                  Decline
                </button>
              </div>
            </div>
          )}

          {/* Accept Confirmation */}
          {responseType === 'accept' && (
            <div className="vm-respond-confirm">
              <p className="vm-confirm-message">
                You're accepting the meeting on{' '}
                <strong>{formatMeetingDateTime(meeting.bookedDate || meeting.scheduledDate)}</strong>.
                The host will receive a confirmation notification.
              </p>
            </div>
          )}

          {/* Suggest Different Time */}
          {responseType === 'suggest' && (
            <div className="vm-respond-suggest">
              <h3 className="vm-respond-subtitle">Suggest a Different Time</h3>
              <p className="vm-suggest-instructions">
                Select a date and time that works better for you:
              </p>

              {!showCalendar ? (
                <button
                  className="btn-show-calendar"
                  onClick={() => setShowCalendar(true)}
                >
                  Show Calendar
                </button>
              ) : (
                <>
                  <CalendarWidget
                    onDateSelect={handleDateSelect}
                    selectedDate={selectedDate}
                    meeting={meeting}
                  />

                  {selectedDate && (
                    <div className="vm-time-selector">
                      <label htmlFor="time-select">Select Time (EST):</label>
                      <input
                        id="time-select"
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="vm-time-input"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Decline Reason */}
          {responseType === 'decline' && (
            <div className="vm-respond-decline">
              <h3 className="vm-respond-subtitle">Decline Meeting</h3>
              <p className="vm-decline-instructions">
                Please let the host know why you're declining (optional):
              </p>
              <textarea
                className="vm-decline-reason"
                placeholder="E.g., Time doesn't work for me, Need to reschedule, Changed my mind..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {responseType && (
            <>
              <button
                className="btn-modal btn-modal-secondary"
                onClick={() => setResponseType(null)}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                className="btn-modal btn-modal-primary"
                onClick={handleSubmit}
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Response'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
