/**
 * CancelProposalModal Component
 * Confirmation dialog for canceling a guest proposal
 * Displays property information and requires explicit confirmation
 */

import { useEffect } from 'react';
import '../../styles/modals.css';

export default function CancelProposalModal({
  isOpen,
  onClose,
  onConfirm,
  proposal
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const listingName = proposal?.listing?.name || 'this property';
  const listingPhoto = proposal?.listing?.featuredPhotoUrl || '';

  // Truncate long listing names
  const truncatedName = listingName.length > 50
    ? listingName.substring(0, 50) + '...'
    : listingName;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-cancel-proposal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (X icon in top right) */}
        <button
          className="modal-close-x-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        {/* Header with Icon */}
        <div className="modal-cancel-header">
          <div className="cancel-icon-wrapper">
            <svg
              className="cancel-trash-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </div>
          <div className="cancel-header-text">
            <h2 className="cancel-title">Cancel Proposal?</h2>
            <p className="cancel-subtitle">This action is irreversible</p>
          </div>
        </div>

        {/* Body with Property Preview */}
        <div className="modal-cancel-body">
          <div className="cancel-property-preview">
            {listingPhoto && (
              <img
                src={listingPhoto}
                alt={listingName}
                className="cancel-property-image"
              />
            )}
            <p className="cancel-property-text">
              Are you sure you want to cancel this proposal for{' '}
              <strong>{truncatedName}</strong>
            </p>
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="modal-cancel-footer">
          <button
            className="btn-modal btn-cancel-secondary"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="btn-modal btn-cancel-danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
