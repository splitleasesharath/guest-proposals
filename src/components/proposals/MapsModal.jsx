/**
 * MapsModal Component
 * Displays interactive map showing property location, neighborhood, and nearby amenities
 * Triggered from "View Map" button in ProposalCard
 */

import { useEffect, useRef, useState } from 'react';
import '../../styles/modals.css';

export default function MapsModal({ isOpen, onClose, listing }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !listing) return;

    // Load Google Maps script dynamically
    loadGoogleMapsScript()
      .then(() => initializeMap())
      .catch(err => {
        console.error('Failed to load Google Maps:', err);
        setError('Unable to load map. Please try again later.');
        setLoading(false);
      });

    return () => {
      // Cleanup
      if (map) {
        // Google Maps cleanup is automatic
      }
    };
  }, [isOpen, listing]);

  function loadGoogleMapsScript() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        resolve();
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.addEventListener('load', resolve);
        existingScript.addEventListener('error', reject);
        return;
      }

      // Load script
      const script = document.createElement('script');
      // TODO: Replace with actual API key from environment variables
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', resolve);
      script.addEventListener('error', reject);
      document.head.appendChild(script);
    });
  }

  function initializeMap() {
    if (!mapRef.current || !window.google) return;

    try {
      // Get coordinates from listing
      // Default to Little Italy, Manhattan if no coords available
      const coordinates = listing.coordinates ||
        listing.location?.coordinates || {
          lat: 40.713252,
          lng: -74.011074
        };

      // Create map with styling similar to original
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: coordinates,
        zoom: 16,
        mapTypeControl: false,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        styles: [], // Default Google Maps styling
      });

      // Custom marker icon (purple pin from Bubble.io)
      const markerIcon = {
        url: 'https://50bf0464e4735aabad1cc8848a0e8b8a.cdn.bubble.io/f1733750606174x369432346427862400/EXPANDED%20-%20SLpin%20purple%20%28100%20%C3%97%20100%20px%29%20%281%29.png',
        scaledSize: new window.google.maps.Size(100, 100),
        origin: new window.google.maps.Point(0, 0),
        anchor: new window.google.maps.Point(50, 100),
      };

      // Add property marker with custom icon
      const marker = new window.google.maps.Marker({
        position: coordinates,
        map: googleMap,
        title: listing.name,
        icon: markerIcon,
        animation: window.google.maps.Animation.DROP,
      });

      // Add label with price below the marker
      const priceLabel = new window.google.maps.Marker({
        position: {
          lat: coordinates.lat - 0.0002, // Slightly below the main marker
          lng: coordinates.lng
        },
        map: googleMap,
        label: {
          text: `$${Math.round(listing.nightlyPrice || 263)}`,
          color: '#000000',
          fontSize: '14px',
          fontFamily: 'Roboto, Arial, sans-serif',
          fontWeight: '400',
        },
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 0,
        },
      });

      // Add info window with property details
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">${listing.name}</h3>
            <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 14px;">
              ${listing.hoodName ? `${listing.hoodName}, ` : ''}${listing.boroughName || ''}
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMap, marker);
      });

      setMap(googleMap);
      setLoading(false);
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Unable to display map. Please try again.');
      setLoading(false);
    }
  }

  // Handle ESC key - but don't close (matching Bubble.io behavior)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        // Don't close on ESC
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

  return (
    <div className="maps-modal-overlay">
      <div className="maps-modal-popup">
        {/* Close button */}
        <button
          className="maps-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header with listing info */}
        <div className="maps-modal-header">
          <div className="maps-listing-info">
            <h2 className="maps-listing-title">{listing?.name}</h2>
            <p className="maps-listing-description">
              {listing?.description?.substring(0, 150) || 'Experience unrivaled character and contemporary luxury in this stunningly restored studio loft located in the vibrant heart of Little Italy. Original exposed wooden beams lend historic charm, while sl'}
            </p>
          </div>
          <button className="maps-view-listing-btn">
            View Listing
          </button>
        </div>

        {/* Map Container */}
        <div className="maps-modal-body">
          {loading && (
            <div className="map-loading">
              <div className="loading-spinner"></div>
              <p>Loading map...</p>
            </div>
          )}

          {error && (
            <div className="map-error">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Reload Page</button>
            </div>
          )}

          <div
            ref={mapRef}
            className="maps-container"
            style={{
              width: '100%',
              height: '100%',
              display: loading || error ? 'none' : 'block'
            }}
          ></div>
        </div>

        {/* Footer with pricing */}
        <div className="maps-modal-footer">
          <div className="maps-pricing-info">
            <span className="maps-total-price">
              ${listing?.totalPrice?.toFixed(2) || '8,190.00'} in total |
              Maintenance Fee: ${listing?.maintenanceFee?.toFixed(2) || '60.00'} |
              Damage deposit ${listing?.damageDeposit?.toFixed(2) || '500.00'}
            </span>
          </div>
          <div className="maps-nightly-price">
            ${listing?.nightlyPrice?.toFixed(2) || '204.75'} / night
          </div>
          <button className="maps-go-leases-btn">
            Go to Leases
          </button>
        </div>
      </div>
    </div>
  );
}
