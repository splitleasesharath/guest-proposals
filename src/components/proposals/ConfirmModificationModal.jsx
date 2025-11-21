/**
 * ConfirmModificationModal Component
 * Auto-triggered confirmation dialog when proposal is modified by host
 * Ensures guest awareness and explicit acknowledgment of changes
 */

import { useEffect } from 'react';
import '../../styles/modals.css';

export default function ConfirmModificationModal({ isOpen, onClose, onConfirm, onViewDetails, modificationType }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        // Don't close on ESC - user must explicitly respond
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getModificationMessage = () => {
    switch (modificationType) {
      case 'counteroffer':
        return {
          title: 'Host Submitted a Counteroffer',
          message: 'The host has proposed changes to your original proposal terms, including pricing, dates, or schedule.',
          icon: '📝',
          color: 'yellow'
        };
      case 'dates':
        return {
          title: 'Proposal Dates Modified',
          message: 'The host has adjusted the check-in or check-out dates for your proposal.',
          icon: '📅',
          color: 'blue'
        };
      case 'pricing':
        return {
          title: 'Pricing Updated',
          message: 'The host has modified the pricing terms for your proposal.',
          icon: '💰',
          color: 'green'
        };
      case 'terms':
        return {
          title: 'Terms and Conditions Modified',
          message: 'The host has updated the terms and conditions of your proposal.',
          icon: '📋',
          color: 'blue'
        };
      default:
        return {
          title: 'Proposal Modified',
          message: 'The host has made changes to your proposal. Please review the updates.',
          icon: '⚠️',
          color: 'yellow'
        };
    }
  };

  const info = getModificationMessage();

  return (
    <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div
        className="modal-content modal-confirm modal-modification"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modification-header">
            <span className="modification-icon">{info.icon}</span>
            <div>
              <h2 className="modal-title">{info.title}</h2>
              <p className="modal-subtitle">Action required</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="confirm-message-box">
            <p className="confirm-message">{info.message}</p>
            <div className="confirm-notice">
              <strong>Important:</strong> You must review and acknowledge these changes before proceeding.
              The modified terms will replace your original proposal if you accept.
            </div>
          </div>

          {/* Modification Details Preview */}
          <div className="modification-preview">
            <h4 className="preview-title">What changed?</h4>
            <ul className="preview-list">
              <li>View a detailed side-by-side comparison of original vs. modified terms</li>
              <li>See exactly what changed and by how much</li>
              <li>Make an informed decision to accept or decline</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer modal-confirm-footer">
          <button
            className="btn-modal btn-modal-secondary"
            onClick={onViewDetails}
          >
            View Detailed Comparison
          </button>
          <div className="confirm-actions-group">
            <button
              className="btn-modal btn-modal-danger"
              onClick={() => {
                // TODO: Implement decline logic
                console.log('Declining modifications');
                onClose();
              }}
            >
              Decline Changes
            </button>
            <button
              className="btn-modal btn-modal-primary"
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              Acknowledge & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
