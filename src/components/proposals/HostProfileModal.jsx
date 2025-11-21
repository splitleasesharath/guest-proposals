/**
 * HostProfileModal Component
 * Displays detailed host profile information
 * Triggered from "Host Profile" button in ProposalCard
 */

import { useEffect } from 'react';
import '../../styles/modals.css';

export default function HostProfileModal({ isOpen, onClose, host }) {
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

  if (!isOpen || !host) return null;

  // Mock data for stats (these would come from database in production)
  const hostStats = {
    rating: host.rating || '4.9',
    reviews: host.reviewCount || '127',
    responseTime: host.responseTime || '< 1 hour',
    listingsCount: host.listingsCount || '3',
    yearsHosting: host.yearsHosting || '2',
    responseRate: host.responseRate || '98%'
  };

  const isVerified = host.isIdentityVerified || host.identityVerified || false;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-host-profile"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Host Profile</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close profile"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div className="host-profile-content">
            {/* Host Header with Photo and Name */}
            <div className="host-profile-header">
              {host.profilePhoto && (
                <img
                  src={host.profilePhoto}
                  alt={host.fullName || host.firstName}
                  className="host-profile-avatar-large"
                />
              )}
              <div className="host-profile-info">
                <h3 className="host-profile-name">
                  {host.fullName || `${host.firstName || ''} ${host.lastName || ''}`.trim() || 'Host'}
                </h3>
                {isVerified && (
                  <div className="host-profile-verified">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Identity Verified
                  </div>
                )}
              </div>
            </div>

            {/* Host Statistics */}
            <div className="host-profile-section">
              <h3>Host Statistics</h3>
              <div className="host-profile-stats">
                <div className="host-stat">
                  <p className="host-stat-value">★ {hostStats.rating}</p>
                  <p className="host-stat-label">Rating</p>
                </div>
                <div className="host-stat">
                  <p className="host-stat-value">{hostStats.reviews}</p>
                  <p className="host-stat-label">Reviews</p>
                </div>
                <div className="host-stat">
                  <p className="host-stat-value">{hostStats.responseTime}</p>
                  <p className="host-stat-label">Response Time</p>
                </div>
              </div>
            </div>

            {/* Hosting Information */}
            <div className="host-profile-section">
              <h3>Hosting Information</h3>
              <div className="host-profile-stats">
                <div className="host-stat">
                  <p className="host-stat-value">{hostStats.listingsCount}</p>
                  <p className="host-stat-label">Active Listings</p>
                </div>
                <div className="host-stat">
                  <p className="host-stat-value">{hostStats.yearsHosting}</p>
                  <p className="host-stat-label">Years Hosting</p>
                </div>
                <div className="host-stat">
                  <p className="host-stat-value">{hostStats.responseRate}</p>
                  <p className="host-stat-label">Response Rate</p>
                </div>
              </div>
            </div>

            {/* About Section */}
            {host.bio && (
              <div className="host-profile-section">
                <h3>About {host.firstName || 'Host'}</h3>
                <p className="host-about-text">{host.bio}</p>
              </div>
            )}

            {/* Languages */}
            {host.languages && host.languages.length > 0 && (
              <div className="host-profile-section">
                <h3>Languages</h3>
                <p className="host-about-text">
                  {Array.isArray(host.languages)
                    ? host.languages.join(', ')
                    : host.languages}
                </p>
              </div>
            )}

            {/* Location */}
            {host.location && (
              <div className="host-profile-section">
                <h3>Location</h3>
                <p className="host-about-text">{host.location}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Action Button */}
        <div className="modal-footer">
          <button className="btn-modal btn-modal-primary">
            Send a Message
          </button>
        </div>
      </div>
    </div>
  );
}
