/**
 * RequestVirtualMeetingModal Component
 * Modal for guests to request a virtual meeting with 3 time slot selections
 * Features: Calendar with month selector, time slot grid (11am-10pm EST), 3 slot selection requirement
 */

import { useState, useEffect } from 'react';
import '../../styles/request-virtual-meeting.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const TIME_SLOTS = [
  '11:00 am', '12:00 pm', '1:00 pm', '2:00 pm', '3:00 pm', '4:00 pm',
  '5:00 pm', '6:00 pm', '7:00 pm', '8:00 pm', '9:00 pm', '10:00 pm'
];

export default function RequestVirtualMeetingModal({ isOpen, onClose, proposal }) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      const now = new Date();
      setCurrentMonth(now.getMonth());
      setCurrentYear(now.getFullYear());
      setSelectedDate(null);
      setSelectedTimeSlots([]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Generate calendar days for current month
  function getDaysInMonth() {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Previous month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        isCurrentMonth: false,
        isNextMonth: false,
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i)
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        isCurrentMonth: true,
        isNextMonth: false,
        date: new Date(currentYear, currentMonth, day)
      });
    }

    // Next month padding
    const remainingCells = 42 - days.length; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isNextMonth: true,
        date: new Date(currentYear, currentMonth + 1, day)
      });
    }

    return days;
  }

  function handleMonthChange(e) {
    setCurrentMonth(parseInt(e.target.value) - 1);
  }

  function handlePrevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }

  function handleNextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }

  function isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  function isPastDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  function isSelectedDate(date) {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  }

  function handleDateClick(dayInfo) {
    if (!dayInfo.isCurrentMonth || isPastDate(dayInfo.date)) return;
    setSelectedDate(dayInfo.date);
    setSelectedTimeSlots([]); // Clear time slots when date changes
  }

  function handleTimeSlotClick(timeSlot) {
    if (!selectedDate) return;

    if (selectedTimeSlots.includes(timeSlot)) {
      // Deselect
      setSelectedTimeSlots(selectedTimeSlots.filter(slot => slot !== timeSlot));
    } else if (selectedTimeSlots.length < 3) {
      // Select (max 3)
      setSelectedTimeSlots([...selectedTimeSlots, timeSlot]);
    }
  }

  function handleClearTimeSlots() {
    setSelectedTimeSlots([]);
  }

  async function handleSubmit() {
    if (isSubmitting || selectedTimeSlots.length < 3) return;

    setIsSubmitting(true);

    try {
      // TODO: Implement API call to create virtual meeting request
      console.log('Submitting virtual meeting request:', {
        proposalId: proposal.id,
        date: selectedDate,
        timeSlots: selectedTimeSlots
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Virtual meeting request sent successfully!');
      onClose();
    } catch (error) {
      console.error('Failed to submit virtual meeting request:', error);
      alert('Failed to send request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const days = getDaysInMonth();
  const remainingSlots = 3 - selectedTimeSlots.length;
  const canSubmit = selectedTimeSlots.length === 3;

  return (
    <div className="rvm-modal-overlay" onClick={onClose}>
      <div
        className="rvm-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glass effect background */}
        <div className="rvm-glass-effect">
          {/* Header */}
          <div className="rvm-header">
            <h2 className="rvm-title">Request Virtual Meeting</h2>
            <button
              className="rvm-close-btn"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Calendar Section */}
          <div className="rvm-calendar-container">
            {/* Month Selector */}
            <div className="rvm-month-selector">
              <select
                className="rvm-month-dropdown"
                value={currentMonth + 1}
                onChange={handleMonthChange}
              >
                <option value="" disabled>Month</option>
                {MONTHS.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>
              <button
                className="rvm-nav-btn rvm-nav-up"
                onClick={handlePrevMonth}
                aria-label="Previous month"
              >
                ▲
              </button>
              <button
                className="rvm-nav-btn rvm-nav-down"
                onClick={handleNextMonth}
                aria-label="Next month"
              >
                ▼
              </button>
            </div>

            {/* Day Headers */}
            <div className="rvm-day-headers">
              <div className="rvm-day-header">Sun</div>
              <div className="rvm-day-header">Mon</div>
              <div className="rvm-day-header">Tue</div>
              <div className="rvm-day-header">Wed</div>
              <div className="rvm-day-header">Thu</div>
              <div className="rvm-day-header">Fri</div>
              <div className="rvm-day-header">Sat</div>
            </div>

            {/* Calendar Grid */}
            <div className="rvm-calendar-grid">
              {days.map((dayInfo, index) => {
                const isCurrent = dayInfo.isCurrentMonth;
                const isPast = isPastDate(dayInfo.date);
                const isSelected = isSelectedDate(dayInfo.date);
                const isTodayDate = isToday(dayInfo.date);

                return (
                  <div
                    key={index}
                    className={`rvm-day-cell ${!isCurrent ? 'rvm-day-other-month' : ''} ${
                      isPast ? 'rvm-day-past' : ''
                    } ${isSelected ? 'rvm-day-selected' : ''} ${
                      isTodayDate ? 'rvm-day-today' : ''
                    }`}
                    onClick={() => handleDateClick(dayInfo)}
                  >
                    {dayInfo.day}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Time Slots Section */}
          {selectedDate && (
            <div className="rvm-time-slots-container">
              <div className="rvm-time-slots-header">
                <h3 className="rvm-time-slots-title">Select 3 Time Slots (EST)</h3>
                {selectedTimeSlots.length > 0 && (
                  <button
                    className="rvm-clear-btn"
                    onClick={handleClearTimeSlots}
                  >
                    Clear Time Slots
                  </button>
                )}
              </div>

              <div className="rvm-time-slots-grid">
                {TIME_SLOTS.map((timeSlot) => {
                  const isSelected = selectedTimeSlots.includes(timeSlot);
                  return (
                    <button
                      key={timeSlot}
                      className={`rvm-time-slot ${isSelected ? 'rvm-time-slot-selected' : ''}`}
                      onClick={() => handleTimeSlotClick(timeSlot)}
                    >
                      {timeSlot}
                    </button>
                  );
                })}
              </div>

              {/* Selected Slots Display */}
              {selectedTimeSlots.length > 0 && (
                <div className="rvm-selected-slots">
                  {selectedTimeSlots.map((timeSlot, index) => {
                    const formattedDate = selectedDate.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                    return (
                      <div key={index} className="rvm-selected-slot-item">
                        <svg className="rvm-slot-clock-icon" viewBox="0 0 24 24" width="20" height="20">
                          <path fill="currentColor" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.2,16.2L11,13V7H12.5V12.2L17,14.7L16.2,16.2Z" />
                        </svg>
                        <span className="rvm-slot-text">
                          {timeSlot} (EST) &nbsp;{formattedDate}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            className="rvm-submit-btn"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting
              ? 'Submitting...'
              : canSubmit
              ? 'Submit Request'
              : `Select ${remainingSlots} Time Slot${remainingSlots !== 1 ? 's' : ''} more`}
          </button>
        </div>
      </div>
    </div>
  );
}
