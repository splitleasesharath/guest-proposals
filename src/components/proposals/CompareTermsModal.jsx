/**
 * CompareTermsModal Component
 * Displays side-by-side comparison of original proposal vs modified/counteroffer terms
 * Triggered when host modifies proposal or submits counteroffer
 */

import { useEffect } from 'react';
import { formatPrice, formatDate } from '../../lib/supabase/dataTransformers.js';
import '../../styles/modals.css';

export default function CompareTermsModal({ isOpen, onClose, originalProposal, modifiedProposal }) {
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

  if (!isOpen || !originalProposal || !modifiedProposal) return null;

  // Helper to determine if a field changed
  function hasChanged(originalValue, modifiedValue) {
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

  // Comparison items
  const comparisons = [
    {
      label: 'Total Price',
      original: formatPrice(originalProposal.totalPrice),
      modified: formatPrice(modifiedProposal.totalPrice),
      changed: hasChanged(originalProposal.totalPrice, modifiedProposal.totalPrice),
      isPriceField: true
    },
    {
      label: 'Nightly Rate',
      original: formatPrice(originalProposal.nightlyPrice),
      modified: formatPrice(modifiedProposal.nightlyPrice),
      changed: hasChanged(originalProposal.nightlyPrice, modifiedProposal.nightlyPrice),
      isPriceField: true
    },
    {
      label: 'Check-in Date',
      original: originalProposal.checkInDay,
      modified: modifiedProposal.checkInDay,
      changed: hasChanged(originalProposal.checkInDay, modifiedProposal.checkInDay)
    },
    {
      label: 'Check-out Date',
      original: originalProposal.checkOutDay,
      modified: modifiedProposal.checkOutDay,
      changed: hasChanged(originalProposal.checkOutDay, modifiedProposal.checkOutDay)
    },
    {
      label: 'Duration',
      original: `${originalProposal.reservationWeeks} Weeks`,
      modified: `${modifiedProposal.reservationWeeks} Weeks`,
      changed: hasChanged(originalProposal.reservationWeeks, modifiedProposal.reservationWeeks)
    },
    {
      label: 'Weekly Schedule',
      original: formatDaysSelected(originalProposal.daysSelected),
      modified: formatDaysSelected(modifiedProposal.daysSelected),
      changed: JSON.stringify(originalProposal.daysSelected) !== JSON.stringify(modifiedProposal.daysSelected)
    },
    {
      label: 'Move-in Date',
      original: formatDate(originalProposal.moveInStart),
      modified: formatDate(modifiedProposal.moveInStart),
      changed: hasChanged(originalProposal.moveInStart, modifiedProposal.moveInStart)
    },
    {
      label: 'Damage Deposit',
      original: formatPrice(originalProposal.damageDeposit),
      modified: formatPrice(modifiedProposal.damageDeposit),
      changed: hasChanged(originalProposal.damageDeposit, modifiedProposal.damageDeposit),
      isPriceField: true
    }
  ];

  // Add cleaning fee if it exists
  if (originalProposal.cleaningFee || modifiedProposal.cleaningFee) {
    comparisons.push({
      label: 'Cleaning Fee',
      original: formatPrice(originalProposal.cleaningFee || 0),
      modified: formatPrice(modifiedProposal.cleaningFee || 0),
      changed: hasChanged(originalProposal.cleaningFee, modifiedProposal.cleaningFee),
      isPriceField: true
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
              // TODO: Implement decline counteroffer
              console.log('Declining counteroffer');
              onClose();
            }}
          >
            Decline Counteroffer
          </button>
          <button
            className="btn-modal btn-modal-primary"
            onClick={() => {
              // TODO: Implement accept counteroffer
              console.log('Accepting counteroffer');
              onClose();
            }}
          >
            Accept Counteroffer
          </button>
        </div>
      </div>
    </div>
  );
}
