/**
 * Dashboard Configuration Persistence Module
 *
 * Handles saving and loading guest dashboard preferences to/from localStorage.
 * Provides filtering and sorting functionality for proposals list.
 *
 * Configuration includes:
 * - View mode (card/list/table)
 * - Filter options (showCancelled, showRejected)
 * - Sort preferences (sortBy)
 * - Notification settings (email, desktop)
 * - Display preferences
 */

const CONFIG_STORAGE_KEY = 'guest_dashboard_config';

/**
 * Default configuration values
 * Applied when no saved config exists
 */
export const DEFAULT_CONFIG = {
  // View Options
  view: 'card', // 'card', 'list', or 'table'
  density: 'comfortable', // 'compact', 'comfortable', or 'spacious'

  // Filter Options
  showCancelled: false,
  showRejected: false,
  showDrafts: false,
  showCompleted: true,

  // Sort Options
  sortBy: 'date-desc', // 'date-asc', 'date-desc', 'status', 'price-asc', 'price-desc'

  // Display Options
  showImages: true,
  showHostInfo: true,
  showPricing: true,
  showProgress: true,

  // Notification Preferences
  emailNotifications: true,
  desktopNotifications: false,
  notifyOnCounteroffer: true,
  notifyOnStatusChange: true,

  // Advanced Options
  groupBy: 'none', // 'none', 'status', 'listing'
  itemsPerPage: 10
};

/**
 * Load dashboard configuration from localStorage
 * Merges saved config with defaults to ensure all keys exist
 *
 * @returns {Object} Dashboard configuration object
 */
export function loadDashboardConfig() {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all keys exist
      const config = { ...DEFAULT_CONFIG, ...parsed };
      console.log('✅ Loaded dashboard config from localStorage');
      return config;
    }
  } catch (err) {
    console.error('❌ Error loading dashboard config:', err);
  }

  console.log('ℹ️ Using default dashboard config');
  return { ...DEFAULT_CONFIG };
}

/**
 * Save dashboard configuration to localStorage
 *
 * @param {Object} config - Configuration object to save
 * @returns {boolean} True if save was successful
 */
export function saveDashboardConfig(config) {
  try {
    const configToSave = { ...DEFAULT_CONFIG, ...config };
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configToSave));
    console.log('✅ Saved dashboard config to localStorage');
    return true;
  } catch (err) {
    console.error('❌ Error saving dashboard config:', err);
    return false;
  }
}

/**
 * Update a specific config value
 *
 * @param {string} key - Config key to update
 * @param {any} value - New value
 * @returns {Object} Updated full config
 */
export function updateConfigValue(key, value) {
  const currentConfig = loadDashboardConfig();
  const updatedConfig = {
    ...currentConfig,
    [key]: value
  };
  saveDashboardConfig(updatedConfig);
  return updatedConfig;
}

/**
 * Reset configuration to defaults
 *
 * @returns {Object} Default configuration
 */
export function resetDashboardConfig() {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    console.log('✅ Reset dashboard config to defaults');
  } catch (err) {
    console.error('❌ Error resetting dashboard config:', err);
  }

  return { ...DEFAULT_CONFIG };
}

/**
 * Apply config filters to proposals array
 * Returns a filtered copy of the proposals
 *
 * @param {Array<Object>} proposals - Array of proposal objects
 * @param {Object} config - Dashboard configuration
 * @returns {Array<Object>} Filtered proposals array
 */
export function applyConfigFilters(proposals, config) {
  if (!proposals || !Array.isArray(proposals)) {
    return [];
  }

  let filtered = [...proposals];

  // Filter by status flags
  if (!config.showCancelled) {
    filtered = filtered.filter(
      p => !(p.Status || '').includes('Cancelled')
    );
  }

  if (!config.showRejected) {
    filtered = filtered.filter(
      p => !(p.Status || '').includes('Rejected')
    );
  }

  if (!config.showDrafts) {
    filtered = filtered.filter(
      p => (p.Status || '') !== 'Draft'
    );
  }

  if (!config.showCompleted) {
    filtered = filtered.filter(
      p => (p.Status || '') !== 'Initial Payment Submitted / Lease activated'
    );
  }

  return filtered;
}

/**
 * Apply sorting to proposals array
 * Returns a sorted copy of the proposals
 *
 * @param {Array<Object>} proposals - Array of proposal objects
 * @param {string} sortBy - Sort option key
 * @returns {Array<Object>} Sorted proposals array
 */
export function applyConfigSort(proposals, sortBy) {
  if (!proposals || !Array.isArray(proposals)) {
    return [];
  }

  const sorted = [...proposals];

  switch (sortBy) {
    case 'date-desc':
      sorted.sort((a, b) => {
        const dateA = new Date(a['Created Date'] || 0);
        const dateB = new Date(b['Created Date'] || 0);
        return dateB - dateA; // Newest first
      });
      break;

    case 'date-asc':
      sorted.sort((a, b) => {
        const dateA = new Date(a['Created Date'] || 0);
        const dateB = new Date(b['Created Date'] || 0);
        return dateA - dateB; // Oldest first
      });
      break;

    case 'status':
      sorted.sort((a, b) => {
        const statusA = (a.Status || '').toLowerCase();
        const statusB = (b.Status || '').toLowerCase();
        return statusA.localeCompare(statusB);
      });
      break;

    case 'price-asc':
      sorted.sort((a, b) => {
        const priceA = a['Total Price for Reservation (guest)'] || 0;
        const priceB = b['Total Price for Reservation (guest)'] || 0;
        return priceA - priceB; // Lowest first
      });
      break;

    case 'price-desc':
      sorted.sort((a, b) => {
        const priceA = a['Total Price for Reservation (guest)'] || 0;
        const priceB = b['Total Price for Reservation (guest)'] || 0;
        return priceB - priceA; // Highest first
      });
      break;

    case 'listing':
      sorted.sort((a, b) => {
        const nameA = (a.listing?.Name || '').toLowerCase();
        const nameB = (b.listing?.Name || '').toLowerCase();
        return nameA.localeCompare(nameB);
      });
      break;

    default:
      // No sorting
      break;
  }

  return sorted;
}

/**
 * Apply both filters and sorting to proposals
 * Convenience function that combines filtering and sorting
 *
 * @param {Array<Object>} proposals - Array of proposal objects
 * @param {Object} config - Dashboard configuration
 * @returns {Array<Object>} Filtered and sorted proposals array
 */
export function applyConfigFiltersAndSort(proposals, config) {
  const filtered = applyConfigFilters(proposals, config);
  const sorted = applyConfigSort(filtered, config.sortBy);
  return sorted;
}

/**
 * Group proposals by a specific field
 *
 * @param {Array<Object>} proposals - Array of proposal objects
 * @param {string} groupBy - Field to group by ('status', 'listing', 'none')
 * @returns {Object} Grouped proposals object { groupName: [proposals] }
 */
export function groupProposals(proposals, groupBy) {
  if (!proposals || !Array.isArray(proposals) || groupBy === 'none') {
    return { 'All Proposals': proposals };
  }

  const groups = {};

  proposals.forEach(proposal => {
    let groupKey;

    switch (groupBy) {
      case 'status':
        groupKey = proposal.Status || 'Unknown Status';
        break;

      case 'listing':
        groupKey = proposal.listing?.Name || 'Unknown Listing';
        break;

      default:
        groupKey = 'All Proposals';
        break;
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(proposal);
  });

  return groups;
}

/**
 * Get sort options for dropdown
 *
 * @returns {Array<Object>} Array of sort option objects with value and label
 */
export function getSortOptions() {
  return [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'status', label: 'Status' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'listing', label: 'Listing Name' }
  ];
}

/**
 * Get view options for dropdown
 *
 * @returns {Array<Object>} Array of view option objects with value and label
 */
export function getViewOptions() {
  return [
    { value: 'card', label: 'Card View', icon: '▦' },
    { value: 'list', label: 'List View', icon: '☰' },
    { value: 'table', label: 'Table View', icon: '▤' }
  ];
}

/**
 * Get group options for dropdown
 *
 * @returns {Array<Object>} Array of group option objects with value and label
 */
export function getGroupOptions() {
  return [
    { value: 'none', label: 'No Grouping' },
    { value: 'status', label: 'Group by Status' },
    { value: 'listing', label: 'Group by Listing' }
  ];
}

/**
 * Export configuration as JSON file
 * Useful for backup or sharing settings
 *
 * @param {Object} config - Configuration to export
 * @param {string} filename - Optional filename
 */
export function exportConfig(config, filename = 'dashboard-config.json') {
  try {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    console.log('✅ Config exported:', filename);
  } catch (err) {
    console.error('❌ Error exporting config:', err);
  }
}

/**
 * Import configuration from JSON file
 *
 * @param {File} file - JSON file to import
 * @param {Function} onSuccess - Callback on successful import
 * @param {Function} onError - Callback on error
 */
export function importConfig(file, onSuccess, onError) {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const config = JSON.parse(e.target.result);
      const mergedConfig = { ...DEFAULT_CONFIG, ...config };
      saveDashboardConfig(mergedConfig);
      console.log('✅ Config imported successfully');

      if (onSuccess) {
        onSuccess(mergedConfig);
      }
    } catch (err) {
      console.error('❌ Error importing config:', err);

      if (onError) {
        onError(err);
      }
    }
  };

  reader.onerror = (err) => {
    console.error('❌ Error reading config file:', err);

    if (onError) {
      onError(err);
    }
  };

  reader.readAsText(file);
}
