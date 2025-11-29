/**
 * ModifyProposalModal Component
 * Allows guests to edit their proposal details before final submission
 * Includes calendar picker, date selection, and reservation details
 */

import { useState, useEffect } from 'react';
import { formatPrice } from '../../lib/supabase/dataTransformers.js';
import CalendarWidget from './CalendarWidget.jsx';
import '../../styles/modals.css';

export default function ModifyProposalModal({ isOpen, onClose, proposal, onSave, initialView = 'general' }) {
  const [showCalendar, setShowCalendar] = useState(initialView === 'editing');
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [editedProposal, setEditedProposal] = useState({
    moveInDate: '',
    checkInDay: '',
    checkOutDay: '',
    reservationWeeks: 0,
    nightsPerWeek: 0,
    daysSelected: []
  });

  useEffect(() => {
    if (isOpen && proposal) {
      // Initialize form with current proposal values
      setEditedProposal({
        moveInDate: proposal.moveInStart || '',
        checkInDay: proposal.checkInDay || '',
        checkOutDay: proposal.checkOutDay || '',
        reservationWeeks: proposal.reservationWeeks || 0,
        nightsPerWeek: proposal.nightsPerWeek || 0,
        daysSelected: proposal.daysSelected || []
      });
      // Reset view based on initialView prop
      setShowCalendar(initialView === 'editing');
    }
  }, [isOpen, proposal, initialView]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && !showCancelConfirmation) {
        setShowCancelConfirmation(true);
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showCancelConfirmation]);

  if (!isOpen || !proposal) return null;

  const handleDateSelect = (date) => {
    setEditedProposal(prev => ({
      ...prev,
      moveInDate: date.toISOString().split('T')[0]
    }));
    setShowCalendar(false);
  };

  const handleCheckInDayChange = (day) => {
    setEditedProposal(prev => ({ ...prev, checkInDay: day }));
  };

  const handleCheckOutDayChange = (day) => {
    setEditedProposal(prev => ({ ...prev, checkOutDay: day }));
  };

  const handleReservationWeeksChange = (weeks) => {
    setEditedProposal(prev => ({ ...prev, reservationWeeks: parseInt(weeks) || 0 }));
  };

  const handleDayToggle = (dayName) => {
    setEditedProposal(prev => {
      const newDaysSelected = prev.daysSelected.includes(dayName)
        ? prev.daysSelected.filter(d => d !== dayName)
        : [...prev.daysSelected, dayName];

      return {
        ...prev,
        daysSelected: newDaysSelected,
        nightsPerWeek: newDaysSelected.length
      };
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedProposal);
    }
    onClose();
  };

  const handleCancel = () => {
    setShowCancelConfirmation(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirmation(false);
    onClose();
  };

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayAbbreviations = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate total based on edited values
  const nightlyPrice = proposal.nightlyPrice || 0;
  const totalNights = editedProposal.reservationWeeks * editedProposal.nightsPerWeek;
  const calculatedTotal = nightlyPrice * totalNights;

  return (
    <>
      <div className="modal-overlay" onClick={handleCancel}>
        <div
          className="modal-content modal-modify-proposal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="modal-header">
            <div className="modal-header-left">
              {showCalendar && (
                <button
                  className="modal-back-btn"
                  onClick={() => setShowCalendar(false)}
                  aria-label="Back to form"
                >
                  ‹
                </button>
              )}
              <div>
                <h2 className="modal-title">
                  <span className="modal-title-icon">✏️</span>
                  Proposal Details
                </h2>
              </div>
            </div>
            <button
              className="modal-close-btn"
              onClick={handleCancel}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="modal-body">
            {!showCalendar ? (
              <>
                {/* Days Selected Widget */}
                <div className="form-section">
                  <div className="days-selector-visual">
                    <button
                      className="btn-calendar-icon"
                      onClick={() => setShowCalendar(true)}
                      aria-label="Open calendar"
                    >
                      📅
                    </button>
                    {dayAbbreviations.map((day, index) => {
                      const dayName = daysOfWeek[index];
                      const isSelected = editedProposal.daysSelected.includes(dayName);
                      return (
                        <button
                          key={index}
                          className={`day-selector-btn ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleDayToggle(dayName)}
                          aria-label={`Toggle ${dayName}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                  <p className="days-summary">
                    {editedProposal.nightsPerWeek} days, {editedProposal.nightsPerWeek} nights selected
                  </p>
                  <p className="check-days-summary">
                    Check-in day <strong>{editedProposal.checkInDay || 'Not set'}</strong>
                    <br />
                    Check-out day <strong>{editedProposal.checkOutDay || 'Not set'}</strong>
                    <br />
                    <strong>{formatPrice(nightlyPrice)}/night</strong>
                  </p>
                </div>

                {/* Move-In Date */}
                <div className="form-section">
                  <label className="form-label">Move-In Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={editedProposal.moveInDate}
                    onChange={(e) => setEditedProposal(prev => ({ ...prev, moveInDate: e.target.value }))}
                  />
                  <p className="form-helper-text">
                    {editedProposal.checkInDay || 'Select check-in day'}
                  </p>
                </div>

                {/* Flexible Move-in Date */}
                <div className="form-section">
                  <label className="form-label">
                    Flexible move-in date?
                    <span className="info-icon" title="Allow flexible move-in">ℹ️</span>
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type here your move-in range..."
                  />
                </div>

                {/* Reservation Span */}
                <div className="form-section">
                  <label className="form-label">Reservation Span</label>
                  <select
                    className="form-select"
                    value={editedProposal.reservationWeeks}
                    onChange={(e) => handleReservationWeeksChange(e.target.value)}
                  >
                    <option value="0">Select duration</option>
                    <option value="1">1 week</option>
                    <option value="2">2 weeks</option>
                    <option value="4">4 weeks (1 month)</option>
                    <option value="8">8 weeks (2 months)</option>
                    <option value="13">13 weeks (3 months)</option>
                    <option value="26">26 weeks (6 months)</option>
                    <option value="52">52 weeks (1 year)</option>
                  </select>
                </div>

                {/* Total Reservation */}
                <div className="form-section total-section">
                  <p className="total-reservation">
                    {formatPrice(calculatedTotal)} Total Reservation
                  </p>
                </div>
              </>
            ) : (
              /* Calendar View */
              <div className="calendar-section">
                <CalendarWidget
                  onDateSelect={handleDateSelect}
                  selectedDate={editedProposal.moveInDate ? new Date(editedProposal.moveInDate) : null}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          {!showCalendar && (
            <div className="modal-footer">
              <button
                className="btn-modal btn-modal-secondary"
                onClick={handleCancel}
              >
                Cancel edits
              </button>
              <button
                className="btn-modal btn-modal-primary"
                onClick={handleSave}
              >
                No changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmation && (
        <div className="modal-overlay" onClick={() => setShowCancelConfirmation(false)}>
          <div
            className="modal-content modal-confirm-cancel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Discard Changes?</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to discard your changes? Any unsaved modifications will be lost.</p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-modal btn-modal-secondary"
                onClick={() => setShowCancelConfirmation(false)}
              >
                Cancel
              </button>
              <button
                className="btn-modal btn-modal-danger"
                onClick={handleConfirmCancel}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
