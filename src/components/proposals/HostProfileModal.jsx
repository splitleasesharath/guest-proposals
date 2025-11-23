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

  // Mock featured listings data
  const featuredListings = host.featuredListings || [
    {
      id: 1,
      name: 'Restored Little Italy Loft with Gym, Pools, Doorman & Private Outdoor Space.',
      location: 'Manhattan, Little Italy',
      image: 'https://50bf0464e4735aabad1cc8848a0e8b8a.cdn.bubble.io/cdn-cgi/image/w=96,h=,f=auto,dpr=1,fit=contain,q=75/f1758070991261x467574734164542400/ap1.jpg'
    },
    {
      id: 2,
      name: 'Cozy 2BR Retreat with Kitchenette, 2 Baths, Gym & WiFi in Milford',
      location: '',
      image: 'https://50bf0464e4735aabad1cc8848a0e8b8a.cdn.bubble.io/cdn-cgi/image/w=96,h=,f=auto,dpr=1,fit=contain,q=75/f1754582536637x919649391378762800/Bedroom%202.jpeg'
    },
    {
      id: 3,
      name: 'Modern Private Room in Clinton, 2BR 2BA, Full Kitchen, WiFi, AC',
      location: 'Manhattan, Clinton',
      image: ''
    }
  ];

  return (
    <div className="host-profile-overlay">
      <div className="host-profile-popup">
        {/* Close button - top right */}
        <button
          className="host-profile-close-icon"
          onClick={onClose}
          aria-label="Close"
        >
          <svg viewBox="0 0 32 32" style={{ width: '100%', height: '100%' }}>
            <use href="/static/icon_libraries/fontawesome-4.7.0.svg#fa-close"></use>
          </svg>
        </button>

        <div className="host-profile-container">
          {/* Top Section: Host Info and Verifications */}
          <div className="host-profile-top">
            {/* Left: Host Photo and Name */}
            <div className="host-profile-left">
              <div className="host-profile-photo-wrapper">
                {host.profilePhoto && (
                  <img
                    src={host.profilePhoto}
                    alt={host.fullName || host.firstName}
                    className="host-profile-photo"
                  />
                )}
                <div className="host-profile-name-label">
                  Host: {host.firstName || host.fullName || 'Host'} {host.lastName?.[0] || 'S'}
                </div>
              </div>
            </div>

            {/* Right: Verification Status */}
            <div className="host-profile-verifications">
              <div className="verification-item">
                <img src="https://50bf0464e4735aabad1cc8848a0e8b8a.cdn.bubble.io/f1745962569232x297596559081963600/linkedinsmartphone-2-svgrepo-com%201.svg" alt="LinkedIn" className="verification-icon" />
                <span className="verification-label">Linkedin</span>
                <span className="verification-status unverified">Unverified</span>
              </div>
              <div className="verification-item">
                <img src="https://50bf0464e4735aabad1cc8848a0e8b8a.cdn.bubble.io/f1745967504304x260999828850027260/smartphone-2-svgrepo-com%204.svg" alt="Phone" className="verification-icon" />
                <span className="verification-label">Number</span>
                <span className="verification-status verified">Verified</span>
              </div>
              <div className="verification-item">
                <img src="https://50bf0464e4735aabad1cc8848a0e8b8a.cdn.bubble.io/f1745960229416x768160520933857200/message-letter.svg" alt="Email" className="verification-icon" />
                <span className="verification-label">Email</span>
                <span className="verification-status unverified">Unverified</span>
              </div>
              <div className="verification-item">
                <img src="https://50bf0464e4735aabad1cc8848a0e8b8a.cdn.bubble.io/f1745962597324x408000072653366140/user-id-svgrepo-com%201.svg" alt="ID" className="verification-icon" />
                <span className="verification-label">Identity</span>
                <span className="verification-status verified">Verified</span>
              </div>
            </div>

            {/* Biography Section */}
            <div className="host-profile-bio-section">
              <h3 className="bio-heading">Biography</h3>
              <p className="bio-text">
                {host.bio || "Winning in NYC! I'm Charlie Sheen, your ultimate tiger-blooded landlord with a flair for the wild and luxurious. Whether you're a rockstar or just want to live like one, I've got the loft that'll make your life #Winning every day. Just remember, here we party like it's the '90s, but with Wi-Fi"}
              </p>
            </div>
          </div>

          {/* Featured Listings Section */}
          <div className="host-featured-listings">
            <h3 className="featured-heading">Featured Listings from {host.firstName || 'Charlie'}</h3>
            <div className="featured-listings-grid">
              {featuredListings.map((listing) => (
                <div key={listing.id} className="featured-listing-card">
                  <div className="featured-listing-content">
                    {listing.image && (
                      <img
                        src={listing.image}
                        alt={listing.name}
                        className="featured-listing-image"
                      />
                    )}
                    <div className="featured-listing-info">
                      <div className="featured-listing-name">{listing.name}</div>
                      {listing.location && (
                        <div className="featured-listing-location">
                          <svg viewBox="0 0 32 32" className="location-icon">
                            <use href="/static/icon_libraries/fontawesome-4.7.0.svg#fa-map-marker"></use>
                          </svg>
                          <span>{listing.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <button className="host-profile-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
