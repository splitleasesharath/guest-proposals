/**
 * CalendarWidget Component
 * Interactive calendar for selecting dates for virtual meetings
 * Displays suggested, confirmed, and awaiting confirmation days
 */

import { useState } from 'react';
import '../../styles/calendar-widget.css';

export default function CalendarWidget({ onDateSelect, selectedDate, meeting }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [view, setView] = useState('month'); // 'month' | 'week' | 'day'

  // Get days in month
  function getDaysInMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add padding for days from previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  function handlePrevMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  }

  function handleNextMonth() {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  }

  function handleDateClick(date) {
    if (date && !isPastDate(date)) {
      onDateSelect(date);
    }
  }

  function isPastDate(date) {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  function isSelectedDate(date) {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  }

  function isToday(date) {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  function getDayStatus(date) {
    // TODO: Integrate with actual meeting data to show:
    // - Virtual Meeting Suggested Days (purple)
    // - Virtual Meeting Confirmed Days (green)
    // - Awaiting Split Lease Confirmation (yellow)

    // For now, return null (no special status)
    return null;
  }

  const days = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-widget">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button
          className="calendar-nav-btn"
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          ‹
        </button>
        <h3 className="calendar-month-title">{monthName}</h3>
        <button
          className="calendar-nav-btn"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* View Selector */}
      <div className="calendar-view-selector">
        <button
          className={`calendar-view-btn ${view === 'month' ? 'active' : ''}`}
          onClick={() => setView('month')}
        >
          Month
        </button>
        <button
          className={`calendar-view-btn ${view === 'week' ? 'active' : ''}`}
          onClick={() => setView('week')}
          disabled
        >
          Week
        </button>
        <button
          className={`calendar-view-btn ${view === 'day' ? 'active' : ''}`}
          onClick={() => setView('day')}
          disabled
        >
          Day
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Day headers */}
        {dayNames.map((dayName) => (
          <div key={dayName} className="calendar-day-header">
            {dayName}
          </div>
        ))}

        {/* Date cells */}
        {days.map((date, index) => {
          const past = isPastDate(date);
          const selected = isSelectedDate(date);
          const today = isToday(date);
          const status = getDayStatus(date);

          return (
            <div
              key={index}
              className={`calendar-day-cell ${!date ? 'empty' : ''} ${past ? 'past' : ''} ${
                selected ? 'selected' : ''
              } ${today ? 'today' : ''} ${status ? `status-${status}` : ''}`}
              onClick={() => handleDateClick(date)}
            >
              {date && <span className="calendar-day-number">{date.getDate()}</span>}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="calendar-legend-item">
          <span className="calendar-legend-dot status-suggested"></span>
          <span className="calendar-legend-label">Virtual Meeting Suggested Days</span>
        </div>
        <div className="calendar-legend-item">
          <span className="calendar-legend-dot status-confirmed"></span>
          <span className="calendar-legend-label">Virtual Meeting Confirmed Days</span>
        </div>
        <div className="calendar-legend-item">
          <span className="calendar-legend-dot status-awaiting"></span>
          <span className="calendar-legend-label">Awaiting Split Lease Confirmation</span>
        </div>
      </div>
    </div>
  );
}
