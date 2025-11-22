/**
 * CounterOfferBanner Component
 *
 * Displays a prominent banner when the host has made a counteroffer
 * Shows how many terms have changed and provides a button to compare
 */

import { formatPrice } from '../../lib/supabase/dataTransformers.js';

export default function CounterOfferBanner({ proposal, onCompareClick }) {
  // Only show banner if counteroffer happened
  if (!proposal || !proposal['counter offer happened']) {
    return null;
  }

  // Detect which fields have changed
  const changes = [];

  // Price changes
  if (proposal['hc total price'] != null &&
      proposal['hc total price'] !== proposal['Total Price for Reservation (guest)']) {
    changes.push({
      field: 'price',
      label: 'Total Price',
      original: formatPrice(proposal['Total Price for Reservation (guest)']),
      counteroffer: formatPrice(proposal['hc total price'])
    });
  }

  if (proposal['hc nightly price'] != null &&
      proposal['hc nightly price'] !== proposal['proposal nightly price']) {
    changes.push({
      field: 'nightlyPrice',
      label: 'Nightly Rate',
      original: formatPrice(proposal['proposal nightly price']),
      counteroffer: formatPrice(proposal['hc nightly price'])
    });
  }

  // Duration changes
  if (proposal['hc reservation span (weeks)'] != null &&
      proposal['hc reservation span (weeks)'] !== proposal['Reservation Span (Weeks)']) {
    changes.push({
      field: 'duration',
      label: 'Duration (Weeks)',
      original: proposal['Reservation Span (Weeks)'],
      counteroffer: proposal['hc reservation span (weeks)']
    });
  }

  // Nights per week
  if (proposal['hc nights per week'] != null &&
      proposal['hc nights per week'] !== proposal['nights per week (num)']) {
    changes.push({
      field: 'nightsPerWeek',
      label: 'Nights per Week',
      original: proposal['nights per week (num)'],
      counteroffer: proposal['hc nights per week']
    });
  }

  // Schedule changes
  const originalDays = JSON.stringify(proposal['Days Selected'] || []);
  const counterofferDays = JSON.stringify(proposal['hc days selected'] || []);
  if (counterofferDays !== originalDays && proposal['hc days selected'] != null) {
    changes.push({
      field: 'schedule',
      label: 'Weekly Schedule',
      original: (proposal['Days Selected'] || []).join(', '),
      counteroffer: (proposal['hc days selected'] || []).join(', ')
    });
  }

  // Check-in/Check-out changes
  if (proposal['hc check in day'] &&
      proposal['hc check in day'] !== proposal['check in day']) {
    changes.push({
      field: 'checkInDay',
      label: 'Check-in Day',
      original: proposal['check in day'],
      counteroffer: proposal['hc check in day']
    });
  }

  if (proposal['hc check out day'] &&
      proposal['hc check out day'] !== proposal['check out day']) {
    changes.push({
      field: 'checkOutDay',
      label: 'Check-out Day',
      original: proposal['check out day'],
      counteroffer: proposal['hc check out day']
    });
  }

  // Deposit and fees
  if (proposal['hc damage deposit'] != null &&
      proposal['hc damage deposit'] !== proposal['damage deposit']) {
    changes.push({
      field: 'damageDeposit',
      label: 'Damage Deposit',
      original: formatPrice(proposal['damage deposit']),
      counteroffer: formatPrice(proposal['hc damage deposit'])
    });
  }

  if (proposal['hc cleaning fee'] != null &&
      proposal['hc cleaning fee'] !== proposal['cleaning fee']) {
    changes.push({
      field: 'cleaningFee',
      label: 'Cleaning Fee',
      original: formatPrice(proposal['cleaning fee']),
      counteroffer: formatPrice(proposal['hc cleaning fee'])
    });
  }

  // House rules changes
  const originalRules = JSON.stringify(proposal['House Rules'] || []);
  const counterofferRules = JSON.stringify(proposal['hc house rules'] || []);
  if (counterofferRules !== originalRules && proposal['hc house rules'] != null) {
    changes.push({
      field: 'houseRules',
      label: 'House Rules',
      original: `${(proposal['House Rules'] || []).length} rules`,
      counteroffer: `${(proposal['hc house rules'] || []).length} rules`
    });
  }

  const changeCount = changes.length;

  // If no changes detected, don't show the banner
  if (changeCount === 0) {
    return null;
  }

  return (
    <div className="counteroffer-banner">
      <div className="banner-icon" aria-hidden="true">✏️</div>
      <div className="banner-content">
        <h3 className="banner-title">Host has proposed changes</h3>
        <p className="banner-description">
          {changeCount} term{changeCount !== 1 ? 's' : ''} modified
        </p>
        {changes.length > 0 && changes.length <= 3 && (
          <ul className="quick-changes-list">
            {changes.map((change, index) => (
              <li key={index} className="quick-change-item">
                <span className="change-label">{change.label}:</span>{' '}
                <span className="change-value original">{change.original}</span>
                {' → '}
                <span className="change-value counteroffer">{change.counteroffer}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        className="btn-compare-terms"
        onClick={onCompareClick}
        aria-label="Compare original and counteroffer terms"
      >
        Compare Terms
      </button>
    </div>
  );
}
