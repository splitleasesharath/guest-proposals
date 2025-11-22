/**
 * CompareTermsModal Component
 * Displays side-by-side comparison of original proposal vs host counteroffer terms
 * Works with actual database structure (hc_* fields for counteroffer)
 * Triggered when host modifies proposal or submits counteroffer
 */

import { useEffect } from 'react';
import { formatPrice, formatDate } from '../../lib/supabase/dataTransformers.js';
import '../../styles/modals.css';

export default function CompareTermsModal({ isOpen, onClose, proposal, onAccept, onDecline }) {
  // Handle ESC key (but don't close - matching Bubble.io behavior for priority popups)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        // Don't close on ESC for priority popups (marked with *)
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Only show if counteroffer exists
  if (!isOpen || !proposal || !proposal['counter offer happened']) {
    return null;
  }

  // Helper to determine if a field changed
  function hasChanged(originalValue, modifiedValue) {
    // Handle null/undefined cases
    if (originalValue == null && modifiedValue == null) return false;
    if (originalValue == null || modifiedValue == null) return true;
    return originalValue !== modifiedValue;
  }

  // Helper to format days selected
  function formatDaysSelected(days) {
    if (!days || days.length === 0) return 'None';
    const dayAbbr = {
      'Sunday': 'Sun',
      'Monday': 'Mon',
      'Tuesday': 'Tue',
      'Wednesday': 'Wed',
      'Thursday': 'Thu',
      'Friday': 'Fri',
      'Saturday': 'Sat'
    };
    return days.map(d => dayAbbr[d] || d).join(', ');
  }

  // Extract original and counteroffer terms from proposal
  const originalTerms = {
    daysSelected: proposal['Days Selected'],
    nightsPerWeek: proposal['nights per week (num)'],
    reservationWeeks: proposal['Reservation Span (Weeks)'],
    checkInDay: proposal['check in day'],
    checkOutDay: proposal['check out day'],
    moveInStart: proposal['Move in range start'],
    totalPrice: proposal['Total Price for Reservation (guest)'],
    nightlyPrice: proposal['proposal nightly price'],
    damageDeposit: proposal['damage deposit'],
    cleaningFee: proposal['cleaning fee'],
    houseRules: proposal['House Rules']
  };

  const counterofferTerms = {
    daysSelected: proposal['hc days selected'],
    nightsPerWeek: proposal['hc nights per week'],
    reservationWeeks: proposal['hc reservation span (weeks)'],
    checkInDay: proposal['hc check in day'],
    checkOutDay: proposal['hc check out day'],
    moveInStart: proposal['Move in range start'], // Counteroffer doesn't change move-in date
    totalPrice: proposal['hc total price'],
    nightlyPrice: proposal['hc nightly price'],
    damageDeposit: proposal['hc damage deposit'],
    cleaningFee: proposal['hc cleaning fee'],
    houseRules: proposal['hc house rules']
  };

  // Build comparison items
  const comparisons = [
    {
      label: 'Total Price',
      original: formatPrice(originalTerms.totalPrice),
      modified: formatPrice(counterofferTerms.totalPrice),
      changed: hasChanged(originalTerms.totalPrice, counterofferTerms.totalPrice),
      isPriceField: true
    },
    {
      label: 'Nightly Rate',
      original: formatPrice(originalTerms.nightlyPrice),
      modified: formatPrice(counterofferTerms.nightlyPrice),
      changed: hasChanged(originalTerms.nightlyPrice, counterofferTerms.nightlyPrice),
      isPriceField: true
    },
    {
      label: 'Duration (Weeks)',
      original: `${originalTerms.reservationWeeks || 0} Weeks`,
      modified: `${counterofferTerms.reservationWeeks || 0} Weeks`,
      changed: hasChanged(originalTerms.reservationWeeks, counterofferTerms.reservationWeeks)
    },
    {
      label: 'Nights per Week',
      original: originalTerms.nightsPerWeek || 0,
      modified: counterofferTerms.nightsPerWeek || 0,
      changed: hasChanged(originalTerms.nightsPerWeek, counterofferTerms.nightsPerWeek)
    },
    {
      label: 'Check-in Day',
      original: originalTerms.checkInDay || 'Not set',
      modified: counterofferTerms.checkInDay || originalTerms.checkInDay || 'Not set',
      changed: hasChanged(originalTerms.checkInDay, counterofferTerms.checkInDay)
    },
    {
      label: 'Check-out Day',
      original: originalTerms.checkOutDay || 'Not set',
      modified: counterofferTerms.checkOutDay || originalTerms.checkOutDay || 'Not set',
      changed: hasChanged(originalTerms.checkOutDay, counterofferTerms.checkOutDay)
    },
    {
      label: 'Weekly Schedule',
      original: formatDaysSelected(originalTerms.daysSelected),
      modified: formatDaysSelected(counterofferTerms.daysSelected || originalTerms.daysSelected),
      changed: JSON.stringify(originalTerms.daysSelected) !== JSON.stringify(counterofferTerms.daysSelected)
    },
    {
      label: 'Damage Deposit',
      original: formatPrice(originalTerms.damageDeposit),
      modified: formatPrice(counterofferTerms.damageDeposit || originalTerms.damageDeposit),
      changed: hasChanged(originalTerms.damageDeposit, counterofferTerms.damageDeposit),
      isPriceField: true
    }
  ];

  // Add cleaning fee if it exists
  if (originalTerms.cleaningFee || counterofferTerms.cleaningFee) {
    comparisons.push({
      label: 'Cleaning Fee',
      original: formatPrice(originalTerms.cleaningFee || 0),
      modified: formatPrice(counterofferTerms.cleaningFee || originalTerms.cleaningFee || 0),
      changed: hasChanged(originalTerms.cleaningFee, counterofferTerms.cleaningFee),
      isPriceField: true
    });
  }

  // Add house rules comparison if changed
  if (JSON.stringify(originalTerms.houseRules) !== JSON.stringify(counterofferTerms.houseRules)) {
    comparisons.push({
      label: 'House Rules',
      original: `${(originalTerms.houseRules || []).length} rules`,
      modified: `${(counterofferTerms.houseRules || []).length} rules`,
      changed: true
    });
  }

  // Count changes
  const changesCount = comparisons.filter(c => c.changed).length;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-compare-terms"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Compare Terms</h2>
            <p className="modal-subtitle">
              {changesCount} {changesCount === 1 ? 'change' : 'changes'} detected
            </p>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close comparison"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="compare-terms-grid">
            {/* Original Terms Column */}
            <div className="compare-column original">
              <h3>Original Proposal</h3>
              <div className="compare-items">
                {comparisons.map((item, index) => (
                  <div key={index} className="compare-item">
                    <p className="compare-label">{item.label}</p>
                    <p className={`compare-value ${item.changed ? 'changed' : ''}`}>
                      {item.original || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Modified Terms Column */}
            <div className="compare-column modified">
              <h3>Host Counteroffer</h3>
              <div className="compare-items">
                {comparisons.map((item, index) => (
                  <div key={index} className="compare-item">
                    <p className="compare-label">{item.label}</p>
                    <p className={`compare-value ${item.changed ? (item.isPriceField ? 'price-changed' : 'changed') : ''}`}>
                      {item.modified || 'N/A'}
                      {item.changed && (
                        <span className="change-indicator"> ✓</span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary of Changes */}
          {changesCount > 0 && (
            <div className="compare-summary">
              <h4>Summary of Changes:</h4>
              <ul className="changes-list">
                {comparisons
                  .filter(c => c.changed)
                  .map((item, index) => (
                    <li key={index}>
                      <strong>{item.label}:</strong> {item.original} → {item.modified}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="modal-footer">
          <button
            className="btn-modal btn-modal-secondary"
            onClick={onClose}
          >
            Close
          </button>
          <button
            className="btn-modal btn-modal-danger"
            onClick={() => {
              if (onDecline) {
                onDecline(proposal);
              } else {
                console.log('Declining counteroffer');
              }
              onClose();
            }}
          >
            Decline Counteroffer
          </button>
          <button
            className="btn-modal btn-modal-primary"
            onClick={() => {
              if (onAccept) {
                onAccept(proposal);
              } else {
                console.log('Accepting counteroffer');
              }
              onClose();
            }}
          >
            Accept Host's Terms
          </button>
        </div>
      </div>
    </div>
  );
}
