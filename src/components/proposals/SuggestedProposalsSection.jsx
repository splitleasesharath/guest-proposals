/**
 * SuggestedProposalsSection Component
 * Displays alternative listing recommendations based on guest interests
 * Shows when preferred listings unavailable or to encourage exploration
 */

import { formatPrice } from '../../lib/supabase/dataTransformers.js';
import '../../styles/suggested-proposals.css';

export default function SuggestedProposalsSection({ suggestions }) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="suggested-proposals-section">
      <div className="suggested-header">
        <h3 className="suggested-title">You Might Also Like</h3>
        <p className="suggested-subtitle">
          Based on your search preferences and interests
        </p>
      </div>

      <div className="suggested-grid">
        {suggestions.map((suggestion) => (
          <SuggestionCard key={suggestion.id} suggestion={suggestion} />
        ))}
      </div>
    </div>
  );
}

function SuggestionCard({ suggestion }) {
  const { listing } = suggestion;

  return (
    <div className="suggestion-card">
      {/* Suggested Badge */}
      <div className="suggested-badge">Suggested</div>

      {/* Listing Image */}
      {listing.featuredPhotoUrl && (
        <div className="suggestion-image-container">
          <img
            src={listing.featuredPhotoUrl}
            alt={listing.name}
            className="suggestion-image"
          />
        </div>
      )}

      {/* Content */}
      <div className="suggestion-content">
        {/* Listing Name */}
        <h4 className="suggestion-listing-name">{listing.name}</h4>

        {/* Location */}
        <p className="suggestion-location">
          {listing.hoodName && listing.boroughName
            ? `${listing.hoodName}, ${listing.boroughName}`
            : listing.hoodName || listing.boroughName}
        </p>

        {/* Key Features */}
        {listing.features && listing.features.length > 0 && (
          <ul className="suggestion-features">
            {listing.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="feature-item">
                <span className="feature-bullet">•</span>
                <span className="feature-text">{feature}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Pricing */}
        {listing.nightlyPrice && (
          <div className="suggestion-pricing">
            <span className="suggestion-price">{formatPrice(listing.nightlyPrice)}</span>
            <span className="suggestion-price-label">/ night</span>
          </div>
        )}

        {/* Availability Match Indicator */}
        {suggestion.availabilityMatch && (
          <div className="availability-match">
            <span className="match-icon">✓</span>
            <span className="match-text">Matches your dates</span>
          </div>
        )}

        {/* Actions */}
        <div className="suggestion-actions">
          <button
            className="btn-view-details"
            onClick={() => {
              window.location.href = `/listing/${listing.id}`;
            }}
          >
            View Details
          </button>
          <button
            className="btn-submit-interest"
            onClick={() => {
              console.log('Submit interest for:', listing.id);
            }}
          >
            Submit Interest
          </button>
        </div>
      </div>
    </div>
  );
}
