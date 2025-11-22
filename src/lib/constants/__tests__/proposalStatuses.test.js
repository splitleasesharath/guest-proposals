/**
 * Unit Tests for proposalStatuses.js
 * Tests all status configuration functions and utilities
 */

import {
  PROPOSAL_STATUSES,
  getStatusConfig,
  getStageFromStatus,
  getActionsForStatus,
  isActiveStatus,
  isTerminalStatus,
  isCompletedStatus,
  getStatusesByColor,
  getStatusesByStage,
} from '../proposalStatuses.js';

describe('PROPOSAL_STATUSES', () => {
  test('should have all required status objects', () => {
    expect(PROPOSAL_STATUSES.CANCELLED_BY_GUEST).toBeDefined();
    expect(PROPOSAL_STATUSES.CANCELLED_BY_SPLITLEASE).toBeDefined();
    expect(PROPOSAL_STATUSES.REJECTED_BY_HOST).toBeDefined();
    expect(PROPOSAL_STATUSES.PROPOSAL_SUBMITTED_AWAITING_RENTAL_APP).toBeDefined();
    expect(PROPOSAL_STATUSES.PENDING_CONFIRMATION).toBeDefined();
    expect(PROPOSAL_STATUSES.RENTAL_APP_SUBMITTED).toBeDefined();
    expect(PROPOSAL_STATUSES.HOST_REVIEW).toBeDefined();
    expect(PROPOSAL_STATUSES.COUNTEROFFER_SUBMITTED_AWAITING_GUEST_REVIEW).toBeDefined();
    expect(PROPOSAL_STATUSES.PROPOSAL_OR_COUNTEROFFER_ACCEPTED).toBeDefined();
    expect(PROPOSAL_STATUSES.REVIEWING_DOCUMENTS).toBeDefined();
    expect(PROPOSAL_STATUSES.LEASE_DOCUMENTS_SENT_FOR_REVIEW).toBeDefined();
    expect(PROPOSAL_STATUSES.LEASE_SIGNED_AWAITING_INITIAL_PAYMENT).toBeDefined();
    expect(PROPOSAL_STATUSES.INITIAL_PAYMENT_SUBMITTED_LEASE_ACTIVATED).toBeDefined();
    expect(PROPOSAL_STATUSES.DRAFT).toBeDefined();
    expect(PROPOSAL_STATUSES.EXPIRED).toBeDefined();
  });

  test('each status should have required properties', () => {
    Object.values(PROPOSAL_STATUSES).forEach(status => {
      expect(status).toHaveProperty('key');
      expect(status).toHaveProperty('color');
      expect(status).toHaveProperty('label');
      expect(status).toHaveProperty('stage');
      expect(status).toHaveProperty('actions');
      expect(typeof status.key).toBe('string');
      expect(typeof status.color).toBe('string');
      expect(typeof status.label).toBe('string');
      expect(Array.isArray(status.actions)).toBe(true);
    });
  });
});

describe('getStatusConfig', () => {
  test('should return correct config for valid status key', () => {
    const config = getStatusConfig('Proposal Cancelled by Guest');
    expect(config).toEqual({
      key: 'Proposal Cancelled by Guest',
      color: 'red',
      label: 'Cancelled by You',
      stage: null,
      actions: ['view_listing', 'explore_rentals']
    });
  });

  test('should return default config for null status', () => {
    const config = getStatusConfig(null);
    expect(config).toEqual({
      key: 'Unknown',
      color: 'gray',
      label: 'Unknown Status',
      stage: null,
      actions: []
    });
  });

  test('should return default config for undefined status', () => {
    const config = getStatusConfig(undefined);
    expect(config.key).toBe('Unknown');
    expect(config.color).toBe('gray');
  });

  test('should return fallback config for unknown status', () => {
    const config = getStatusConfig('Some Unknown Status');
    expect(config).toEqual({
      key: 'Some Unknown Status',
      color: 'gray',
      label: 'Some Unknown Status',
      stage: null,
      actions: []
    });
  });

  test('should handle counteroffer status correctly', () => {
    const config = getStatusConfig('Host Counteroffer Submitted / Awaiting Guest Review');
    expect(config.color).toBe('yellow');
    expect(config.stage).toBe(3);
    expect(config.actions).toContain('review_counteroffer');
    expect(config.actions).toContain('accept_counteroffer');
  });
});

describe('getStageFromStatus', () => {
  test('should return correct stage for active status', () => {
    expect(getStageFromStatus('Proposal Submitted by guest - Awaiting Rental Application')).toBe(1);
    expect(getStageFromStatus('Rental Application Submitted')).toBe(2);
    expect(getStageFromStatus('Host Review')).toBe(3);
    expect(getStageFromStatus('Reviewing Documents')).toBe(4);
    expect(getStageFromStatus('Lease Documents Sent for Review')).toBe(5);
    expect(getStageFromStatus('Initial Payment Submitted / Lease activated')).toBe(6);
  });

  test('should return null for terminal statuses', () => {
    expect(getStageFromStatus('Proposal Cancelled by Guest')).toBeNull();
    expect(getStageFromStatus('Proposal Rejected by Host')).toBeNull();
    expect(getStageFromStatus('Draft')).toBeNull();
    expect(getStageFromStatus('Expired')).toBeNull();
  });

  test('should return null for unknown status', () => {
    expect(getStageFromStatus('Unknown Status')).toBeNull();
  });
});

describe('getActionsForStatus', () => {
  test('should return correct actions for draft status', () => {
    const actions = getActionsForStatus('Draft');
    expect(actions).toContain('edit_proposal');
    expect(actions).toContain('submit_proposal');
    expect(actions).toContain('delete_proposal');
  });

  test('should return correct actions for counteroffer status', () => {
    const actions = getActionsForStatus('Host Counteroffer Submitted / Awaiting Guest Review');
    expect(actions).toContain('review_counteroffer');
    expect(actions).toContain('compare_terms');
    expect(actions).toContain('accept_counteroffer');
    expect(actions).toContain('decline_counteroffer');
  });

  test('should return empty array for unknown status', () => {
    const actions = getActionsForStatus('Unknown Status');
    expect(actions).toEqual([]);
  });

  test('should return actions for cancelled status', () => {
    const actions = getActionsForStatus('Proposal Cancelled by Guest');
    expect(actions).toContain('view_listing');
    expect(actions).toContain('explore_rentals');
  });
});

describe('isActiveStatus', () => {
  test('should return true for active statuses', () => {
    expect(isActiveStatus('Proposal Submitted by guest - Awaiting Rental Application')).toBe(true);
    expect(isActiveStatus('Rental Application Submitted')).toBe(true);
    expect(isActiveStatus('Host Review')).toBe(true);
    expect(isActiveStatus('Reviewing Documents')).toBe(true);
  });

  test('should return false for terminal statuses', () => {
    expect(isActiveStatus('Proposal Cancelled by Guest')).toBe(false);
    expect(isActiveStatus('Proposal Rejected by Host')).toBe(false);
    expect(isActiveStatus('Draft')).toBe(false);
    expect(isActiveStatus('Expired')).toBe(false);
  });

  test('should return false for unknown status', () => {
    expect(isActiveStatus('Unknown Status')).toBe(false);
  });
});

describe('isTerminalStatus', () => {
  test('should return true for cancelled statuses', () => {
    expect(isTerminalStatus('Proposal Cancelled by Guest')).toBe(true);
    expect(isTerminalStatus('Proposal Cancelled by Split Lease')).toBe(true);
  });

  test('should return true for rejected status', () => {
    expect(isTerminalStatus('Proposal Rejected by Host')).toBe(true);
  });

  test('should return false for active statuses', () => {
    expect(isTerminalStatus('Proposal Submitted by guest - Awaiting Rental Application')).toBe(false);
    expect(isTerminalStatus('Rental Application Submitted')).toBe(false);
  });

  test('should return false for draft and expired', () => {
    expect(isTerminalStatus('Draft')).toBe(false);
    expect(isTerminalStatus('Expired')).toBe(false);
  });
});

describe('isCompletedStatus', () => {
  test('should return true only for lease activated status', () => {
    expect(isCompletedStatus('Initial Payment Submitted / Lease activated')).toBe(true);
  });

  test('should return false for all other statuses', () => {
    expect(isCompletedStatus('Proposal Submitted by guest - Awaiting Rental Application')).toBe(false);
    expect(isCompletedStatus('Rental Application Submitted')).toBe(false);
    expect(isCompletedStatus('Proposal Cancelled by Guest')).toBe(false);
    expect(isCompletedStatus('Draft')).toBe(false);
  });
});

describe('getStatusesByColor', () => {
  test('should return all red statuses', () => {
    const redStatuses = getStatusesByColor('red');
    expect(redStatuses.length).toBeGreaterThan(0);
    expect(redStatuses.every(s => s.color === 'red')).toBe(true);
  });

  test('should return all blue statuses', () => {
    const blueStatuses = getStatusesByColor('blue');
    expect(blueStatuses.length).toBeGreaterThan(0);
    expect(blueStatuses.every(s => s.color === 'blue')).toBe(true);
  });

  test('should return all yellow statuses', () => {
    const yellowStatuses = getStatusesByColor('yellow');
    expect(yellowStatuses.length).toBeGreaterThan(0);
    expect(yellowStatuses.every(s => s.color === 'yellow')).toBe(true);
  });

  test('should return all green statuses', () => {
    const greenStatuses = getStatusesByColor('green');
    expect(greenStatuses.length).toBeGreaterThan(0);
    expect(greenStatuses.every(s => s.color === 'green')).toBe(true);
  });

  test('should return all gray statuses', () => {
    const grayStatuses = getStatusesByColor('gray');
    expect(grayStatuses.length).toBeGreaterThan(0);
    expect(grayStatuses.every(s => s.color === 'gray')).toBe(true);
  });

  test('should return empty array for non-existent color', () => {
    const statuses = getStatusesByColor('purple');
    expect(statuses).toEqual([]);
  });
});

describe('getStatusesByStage', () => {
  test('should return all statuses for stage 1', () => {
    const stage1Statuses = getStatusesByStage(1);
    expect(stage1Statuses.length).toBeGreaterThan(0);
    expect(stage1Statuses.every(s => s.stage === 1)).toBe(true);
  });

  test('should return statuses for each stage 1-6', () => {
    for (let i = 1; i <= 6; i++) {
      const stageStatuses = getStatusesByStage(i);
      expect(stageStatuses.length).toBeGreaterThan(0);
      expect(stageStatuses.every(s => s.stage === i)).toBe(true);
    }
  });

  test('should return empty array for non-existent stage', () => {
    const statuses = getStatusesByStage(7);
    expect(statuses).toEqual([]);
  });

  test('should return all statuses with null stage', () => {
    const statuses = getStatusesByStage(null);
    // Terminal statuses (cancelled, rejected, draft, expired) have stage: null
    expect(statuses.length).toBeGreaterThan(0);
    expect(statuses.every(s => s.stage === null)).toBe(true);
  });
});
