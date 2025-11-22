/**
 * Unit Tests for dashboardConfig.js
 * Tests configuration persistence, filtering, sorting, and grouping
 */

import {
  DEFAULT_CONFIG,
  loadDashboardConfig,
  saveDashboardConfig,
  updateConfigValue,
  resetDashboardConfig,
  applyConfigFilters,
  applyConfigSort,
  applyConfigFiltersAndSort,
  groupProposals,
  getSortOptions,
  getViewOptions,
  getGroupOptions,
} from '../dashboardConfig.js';

// Mock proposals for testing
const mockProposals = [
  {
    _id: '1',
    Status: 'Proposal Submitted by guest - Awaiting Rental Application',
    'Created Date': '2025-01-01',
    'Total Price for Reservation (guest)': 2000,
    listing: { Name: 'Beach House' }
  },
  {
    _id: '2',
    Status: 'Proposal Cancelled by Guest',
    'Created Date': '2025-01-05',
    'Total Price for Reservation (guest)': 1500,
    listing: { Name: 'Mountain Cabin' }
  },
  {
    _id: '3',
    Status: 'Proposal Rejected by Host',
    'Created Date': '2025-01-03',
    'Total Price for Reservation (guest)': 2500,
    listing: { Name: 'City Apartment' }
  },
  {
    _id: '4',
    Status: 'Draft',
    'Created Date': '2025-01-02',
    'Total Price for Reservation (guest)': 1000,
    listing: { Name: 'Beach House' }
  },
  {
    _id: '5',
    Status: 'Initial Payment Submitted / Lease activated',
    'Created Date': '2025-01-04',
    'Total Price for Reservation (guest)': 3000,
    listing: { Name: 'Lake House' }
  }
];

describe('DEFAULT_CONFIG', () => {
  test('should have all required configuration keys', () => {
    expect(DEFAULT_CONFIG).toHaveProperty('view');
    expect(DEFAULT_CONFIG).toHaveProperty('density');
    expect(DEFAULT_CONFIG).toHaveProperty('showCancelled');
    expect(DEFAULT_CONFIG).toHaveProperty('showRejected');
    expect(DEFAULT_CONFIG).toHaveProperty('showDrafts');
    expect(DEFAULT_CONFIG).toHaveProperty('showCompleted');
    expect(DEFAULT_CONFIG).toHaveProperty('sortBy');
    expect(DEFAULT_CONFIG).toHaveProperty('showImages');
    expect(DEFAULT_CONFIG).toHaveProperty('showHostInfo');
    expect(DEFAULT_CONFIG).toHaveProperty('showPricing');
    expect(DEFAULT_CONFIG).toHaveProperty('showProgress');
    expect(DEFAULT_CONFIG).toHaveProperty('emailNotifications');
    expect(DEFAULT_CONFIG).toHaveProperty('desktopNotifications');
    expect(DEFAULT_CONFIG).toHaveProperty('notifyOnCounteroffer');
    expect(DEFAULT_CONFIG).toHaveProperty('notifyOnStatusChange');
    expect(DEFAULT_CONFIG).toHaveProperty('groupBy');
    expect(DEFAULT_CONFIG).toHaveProperty('itemsPerPage');
  });

  test('should have sensible default values', () => {
    expect(DEFAULT_CONFIG.view).toBe('card');
    expect(DEFAULT_CONFIG.showCancelled).toBe(false);
    expect(DEFAULT_CONFIG.showRejected).toBe(false);
    expect(DEFAULT_CONFIG.showDrafts).toBe(false);
    expect(DEFAULT_CONFIG.showCompleted).toBe(true);
    expect(DEFAULT_CONFIG.sortBy).toBe('date-desc');
    expect(DEFAULT_CONFIG.groupBy).toBe('none');
  });
});

describe('loadDashboardConfig', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should return default config when no saved config exists', () => {
    const config = loadDashboardConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  test('should load saved config from localStorage', () => {
    const savedConfig = { ...DEFAULT_CONFIG, view: 'list', showCancelled: true };
    localStorage.setItem('guest_dashboard_config', JSON.stringify(savedConfig));

    const config = loadDashboardConfig();
    expect(config.view).toBe('list');
    expect(config.showCancelled).toBe(true);
  });

  test('should merge saved config with defaults', () => {
    const partialConfig = { view: 'table' };
    localStorage.setItem('guest_dashboard_config', JSON.stringify(partialConfig));

    const config = loadDashboardConfig();
    expect(config.view).toBe('table');
    expect(config.sortBy).toBe(DEFAULT_CONFIG.sortBy); // Default value preserved
  });

  test('should handle invalid JSON gracefully', () => {
    localStorage.setItem('guest_dashboard_config', 'invalid json');

    const config = loadDashboardConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
  });
});

describe('saveDashboardConfig', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should save config to localStorage', () => {
    const config = { ...DEFAULT_CONFIG, view: 'list' };
    const result = saveDashboardConfig(config);

    expect(result).toBe(true);
    const saved = JSON.parse(localStorage.getItem('guest_dashboard_config'));
    expect(saved.view).toBe('list');
  });

  test('should merge with defaults when saving partial config', () => {
    const partialConfig = { view: 'table' };
    saveDashboardConfig(partialConfig);

    const saved = JSON.parse(localStorage.getItem('guest_dashboard_config'));
    expect(saved.view).toBe('table');
    expect(saved.sortBy).toBe(DEFAULT_CONFIG.sortBy);
  });

  test('should return true on successful save', () => {
    const result = saveDashboardConfig(DEFAULT_CONFIG);
    expect(result).toBe(true);
  });
});

describe('updateConfigValue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should update a single config value', () => {
    const updatedConfig = updateConfigValue('view', 'list');
    expect(updatedConfig.view).toBe('list');
  });

  test('should persist the update to localStorage', () => {
    updateConfigValue('showCancelled', true);

    const loaded = loadDashboardConfig();
    expect(loaded.showCancelled).toBe(true);
  });

  test('should preserve other config values', () => {
    saveDashboardConfig({ ...DEFAULT_CONFIG, sortBy: 'price-asc' });
    const updated = updateConfigValue('view', 'table');

    expect(updated.view).toBe('table');
    expect(updated.sortBy).toBe('price-asc');
  });
});

describe('resetDashboardConfig', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('should remove config from localStorage', () => {
    saveDashboardConfig({ ...DEFAULT_CONFIG, view: 'list' });
    resetDashboardConfig();

    const stored = localStorage.getItem('guest_dashboard_config');
    expect(stored).toBeNull();
  });

  test('should return default config', () => {
    const config = resetDashboardConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
  });
});

describe('applyConfigFilters', () => {
  test('should return empty array for null/undefined proposals', () => {
    expect(applyConfigFilters(null, DEFAULT_CONFIG)).toEqual([]);
    expect(applyConfigFilters(undefined, DEFAULT_CONFIG)).toEqual([]);
  });

  test('should return empty array for non-array input', () => {
    expect(applyConfigFilters({}, DEFAULT_CONFIG)).toEqual([]);
    expect(applyConfigFilters('not an array', DEFAULT_CONFIG)).toEqual([]);
  });

  test('should filter out cancelled proposals when showCancelled is false', () => {
    const config = { ...DEFAULT_CONFIG, showCancelled: false };
    const filtered = applyConfigFilters(mockProposals, config);

    expect(filtered.some(p => p.Status.includes('Cancelled'))).toBe(false);
  });

  test('should include cancelled proposals when showCancelled is true', () => {
    const config = { ...DEFAULT_CONFIG, showCancelled: true };
    const filtered = applyConfigFilters(mockProposals, config);

    expect(filtered.some(p => p.Status.includes('Cancelled'))).toBe(true);
  });

  test('should filter out rejected proposals when showRejected is false', () => {
    const config = { ...DEFAULT_CONFIG, showRejected: false };
    const filtered = applyConfigFilters(mockProposals, config);

    expect(filtered.some(p => p.Status.includes('Rejected'))).toBe(false);
  });

  test('should filter out drafts when showDrafts is false', () => {
    const config = { ...DEFAULT_CONFIG, showDrafts: false };
    const filtered = applyConfigFilters(mockProposals, config);

    expect(filtered.some(p => p.Status === 'Draft')).toBe(false);
  });

  test('should filter out completed proposals when showCompleted is false', () => {
    const config = { ...DEFAULT_CONFIG, showCompleted: false };
    const filtered = applyConfigFilters(mockProposals, config);

    expect(filtered.some(p => p.Status === 'Initial Payment Submitted / Lease activated')).toBe(false);
  });

  test('should apply multiple filters simultaneously', () => {
    const config = {
      ...DEFAULT_CONFIG,
      showCancelled: false,
      showRejected: false,
      showDrafts: false,
      showCompleted: false
    };
    const filtered = applyConfigFilters(mockProposals, config);

    expect(filtered.length).toBe(1); // Only the active proposal
    expect(filtered[0]._id).toBe('1');
  });
});

describe('applyConfigSort', () => {
  test('should return empty array for null/undefined proposals', () => {
    expect(applyConfigSort(null, 'date-desc')).toEqual([]);
    expect(applyConfigSort(undefined, 'date-desc')).toEqual([]);
  });

  test('should sort by date descending (newest first)', () => {
    const sorted = applyConfigSort(mockProposals, 'date-desc');
    expect(sorted[0]._id).toBe('2'); // 2025-01-05
    expect(sorted[1]._id).toBe('5'); // 2025-01-04
    expect(sorted[4]._id).toBe('1'); // 2025-01-01
  });

  test('should sort by date ascending (oldest first)', () => {
    const sorted = applyConfigSort(mockProposals, 'date-asc');
    expect(sorted[0]._id).toBe('1'); // 2025-01-01
    expect(sorted[4]._id).toBe('2'); // 2025-01-05
  });

  test('should sort by status alphabetically', () => {
    const sorted = applyConfigSort(mockProposals, 'status');
    expect(sorted[0].Status).toBe('Draft');
    expect(sorted[4].Status).toBe('Proposal Submitted by guest - Awaiting Rental Application');
  });

  test('should sort by price ascending (lowest first)', () => {
    const sorted = applyConfigSort(mockProposals, 'price-asc');
    expect(sorted[0]._id).toBe('4'); // $1000
    expect(sorted[4]._id).toBe('5'); // $3000
  });

  test('should sort by price descending (highest first)', () => {
    const sorted = applyConfigSort(mockProposals, 'price-desc');
    expect(sorted[0]._id).toBe('5'); // $3000
    expect(sorted[4]._id).toBe('4'); // $1000
  });

  test('should sort by listing name alphabetically', () => {
    const sorted = applyConfigSort(mockProposals, 'listing');
    expect(sorted[0].listing.Name).toBe('Beach House');
    expect(sorted[sorted.length - 1].listing.Name).toBe('Mountain Cabin');
  });

  test('should not modify original array', () => {
    const original = [...mockProposals];
    applyConfigSort(mockProposals, 'date-desc');
    expect(mockProposals).toEqual(original);
  });
});

describe('applyConfigFiltersAndSort', () => {
  test('should apply both filters and sorting', () => {
    const config = {
      ...DEFAULT_CONFIG,
      showCancelled: false,
      showRejected: false,
      sortBy: 'price-asc'
    };

    const result = applyConfigFiltersAndSort(mockProposals, config);

    // Should exclude cancelled and rejected
    expect(result.some(p => p.Status.includes('Cancelled'))).toBe(false);
    expect(result.some(p => p.Status.includes('Rejected'))).toBe(false);

    // Should be sorted by price ascending
    expect(result[0]['Total Price for Reservation (guest)']).toBeLessThanOrEqual(
      result[1]['Total Price for Reservation (guest)']
    );
  });
});

describe('groupProposals', () => {
  test('should return all proposals in single group when groupBy is "none"', () => {
    const grouped = groupProposals(mockProposals, 'none');
    expect(Object.keys(grouped)).toEqual(['All Proposals']);
    expect(grouped['All Proposals'].length).toBe(mockProposals.length);
  });

  test('should group by status', () => {
    const grouped = groupProposals(mockProposals, 'status');
    const groupKeys = Object.keys(grouped);

    expect(groupKeys.length).toBeGreaterThan(1);
    expect(groupKeys).toContain('Draft');
    expect(groupKeys).toContain('Proposal Cancelled by Guest');
  });

  test('should group by listing name', () => {
    const grouped = groupProposals(mockProposals, 'listing');
    const groupKeys = Object.keys(grouped);

    expect(groupKeys).toContain('Beach House');
    expect(groupKeys).toContain('Mountain Cabin');
    expect(grouped['Beach House'].length).toBe(2); // Two proposals for Beach House
  });

  test('should handle proposals with missing status', () => {
    const proposals = [{ _id: '1' }];
    const grouped = groupProposals(proposals, 'status');

    expect(grouped['Unknown Status']).toBeDefined();
  });

  test('should handle proposals with missing listing name', () => {
    const proposals = [{ _id: '1', listing: {} }];
    const grouped = groupProposals(proposals, 'listing');

    expect(grouped['Unknown Listing']).toBeDefined();
  });

  test('should return all proposals for invalid groupBy', () => {
    const grouped = groupProposals(mockProposals, 'invalid');
    expect(Object.keys(grouped)).toEqual(['All Proposals']);
  });

  test('should handle null/undefined proposals', () => {
    expect(groupProposals(null, 'status')).toEqual({ 'All Proposals': null });
    expect(groupProposals(undefined, 'status')).toEqual({ 'All Proposals': undefined });
  });
});

describe('getSortOptions', () => {
  test('should return array of sort options', () => {
    const options = getSortOptions();
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);
  });

  test('each option should have value and label', () => {
    const options = getSortOptions();
    options.forEach(option => {
      expect(option).toHaveProperty('value');
      expect(option).toHaveProperty('label');
      expect(typeof option.value).toBe('string');
      expect(typeof option.label).toBe('string');
    });
  });

  test('should include all standard sort options', () => {
    const options = getSortOptions();
    const values = options.map(o => o.value);

    expect(values).toContain('date-desc');
    expect(values).toContain('date-asc');
    expect(values).toContain('status');
    expect(values).toContain('price-asc');
    expect(values).toContain('price-desc');
    expect(values).toContain('listing');
  });
});

describe('getViewOptions', () => {
  test('should return array of view options', () => {
    const options = getViewOptions();
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBe(3);
  });

  test('each option should have value, label, and icon', () => {
    const options = getViewOptions();
    options.forEach(option => {
      expect(option).toHaveProperty('value');
      expect(option).toHaveProperty('label');
      expect(option).toHaveProperty('icon');
    });
  });

  test('should include card, list, and table views', () => {
    const options = getViewOptions();
    const values = options.map(o => o.value);

    expect(values).toContain('card');
    expect(values).toContain('list');
    expect(values).toContain('table');
  });
});

describe('getGroupOptions', () => {
  test('should return array of group options', () => {
    const options = getGroupOptions();
    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBe(3);
  });

  test('each option should have value and label', () => {
    const options = getGroupOptions();
    options.forEach(option => {
      expect(option).toHaveProperty('value');
      expect(option).toHaveProperty('label');
    });
  });

  test('should include none, status, and listing grouping', () => {
    const options = getGroupOptions();
    const values = options.map(o => o.value);

    expect(values).toContain('none');
    expect(values).toContain('status');
    expect(values).toContain('listing');
  });
});
