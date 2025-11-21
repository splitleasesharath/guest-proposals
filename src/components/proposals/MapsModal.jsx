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
      // Get coordinates from listing (assuming lat/lng are available)
      // If not available, we'll need to geocode the address
      const coordinates = listing.coordinates || {
        lat: 40.7580, // Default to Brooklyn Bridge if no coords
        lng: -73.9855
      };

      // Create map
      const googleMap = new window.google.maps.Map(mapRef.current, {
        center: coordinates,
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Add property marker
      const marker = new window.google.maps.Marker({
        position: coordinates,
        map: googleMap,
        title: listing.name,
        animation: window.google.maps.Animation.DROP,
      });

      // Add info window with property details
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${listing.name}</h3>
            <p style="margin: 0 0 4px 0; color: #6B7280; font-size: 14px;">
              ${listing.hoodName ? `${listing.hoodName}, ` : ''}${listing.boroughName || ''}
            </p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMap, marker);
      });

      // Open info window by default
      infoWindow.open(googleMap, marker);

      // Draw neighborhood boundary if coordinates available
      // TODO: Implement neighborhood polygon overlay using Geo-Hoods data

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
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-maps"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Property Location</h2>
          <button
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close map"
          >
            ✕
          </button>
        </div>

        {/* Map Container */}
        <div className="modal-body modal-maps-body">
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
            className="map-container"
            style={{
              width: '100%',
              height: '100%',
              display: loading || error ? 'none' : 'block'
            }}
          ></div>
        </div>

        {/* Footer with location info */}
        <div className="modal-footer modal-maps-footer">
          <div className="location-details">
            <p className="location-neighborhood">
              <strong>Neighborhood:</strong> {listing.hoodName || 'N/A'}
            </p>
            <p className="location-borough">
              <strong>Borough:</strong> {listing.boroughName || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
