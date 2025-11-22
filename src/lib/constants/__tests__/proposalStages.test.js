/**
 * Unit Tests for proposalStages.js
 * Tests all stage configuration functions and utilities
 */

import {
  PROPOSAL_STAGES,
  getStageById,
  getStageByName,
  getStageProgress,
  getCompletedStages,
  getRemainingStages,
  isStageCompleted,
  isCurrentStage,
  isStagePending,
  getPreviousStage,
  getNextStage,
  formatStageDisplay,
  getAllStagesFormatted,
} from '../proposalStages.js';

describe('PROPOSAL_STAGES', () => {
  test('should have exactly 6 stages', () => {
    expect(PROPOSAL_STAGES).toHaveLength(6);
  });

  test('each stage should have required properties', () => {
    PROPOSAL_STAGES.forEach(stage => {
      expect(stage).toHaveProperty('id');
      expect(stage).toHaveProperty('name');
      expect(stage).toHaveProperty('shortName');
      expect(stage).toHaveProperty('icon');
      expect(stage).toHaveProperty('description');
      expect(stage).toHaveProperty('helpText');
      expect(typeof stage.id).toBe('number');
      expect(typeof stage.name).toBe('string');
      expect(typeof stage.shortName).toBe('string');
      expect(typeof stage.icon).toBe('string');
      expect(typeof stage.description).toBe('string');
      expect(typeof stage.helpText).toBe('string');
    });
  });

  test('stages should be in sequential order from 1 to 6', () => {
    PROPOSAL_STAGES.forEach((stage, index) => {
      expect(stage.id).toBe(index + 1);
    });
  });
});

describe('getStageById', () => {
  test('should return correct stage for valid ID', () => {
    const stage1 = getStageById(1);
    expect(stage1).toBeDefined();
    expect(stage1.id).toBe(1);
    expect(stage1.name).toBe('Proposal Submitted');

    const stage6 = getStageById(6);
    expect(stage6).toBeDefined();
    expect(stage6.id).toBe(6);
    expect(stage6.name).toBe('Initial Payment');
  });

  test('should return null for invalid IDs', () => {
    expect(getStageById(0)).toBeNull();
    expect(getStageById(7)).toBeNull();
    expect(getStageById(-1)).toBeNull();
    expect(getStageById(null)).toBeNull();
    expect(getStageById(undefined)).toBeNull();
  });

  test('should handle all valid IDs 1-6', () => {
    for (let i = 1; i <= 6; i++) {
      const stage = getStageById(i);
      expect(stage).toBeDefined();
      expect(stage.id).toBe(i);
    }
  });
});

describe('getStageByName', () => {
  test('should return stage for exact name match', () => {
    const stage = getStageByName('Proposal Submitted');
    expect(stage).toBeDefined();
    expect(stage.id).toBe(1);
  });

  test('should return stage for case-insensitive name match', () => {
    const stage = getStageByName('PROPOSAL SUBMITTED');
    expect(stage).toBeDefined();
    expect(stage.id).toBe(1);
  });

  test('should return stage for short name match', () => {
    const stage = getStageByName('Submitted');
    expect(stage).toBeDefined();
    expect(stage.id).toBe(1);
  });

  test('should return stage for case-insensitive short name', () => {
    const stage = getStageByName('submitted');
    expect(stage).toBeDefined();
    expect(stage.id).toBe(1);
  });

  test('should return null for invalid names', () => {
    expect(getStageByName('Invalid Stage')).toBeNull();
    expect(getStageByName(null)).toBeNull();
    expect(getStageByName(undefined)).toBeNull();
    expect(getStageByName('')).toBeNull();
  });
});

describe('getStageProgress', () => {
  test('should calculate progress correctly for no completed stages', () => {
    const progress = getStageProgress(1, []);
    expect(progress.current).toBe(1);
    expect(progress.completed).toEqual([]);
    expect(progress.percentage).toBe(0);
    expect(progress.isComplete).toBe(false);
    expect(progress.remainingStages).toBe(6);
  });

  test('should calculate progress for 3 completed stages', () => {
    const progress = getStageProgress(4, [1, 2, 3]);
    expect(progress.current).toBe(4);
    expect(progress.completed).toEqual([1, 2, 3]);
    expect(progress.percentage).toBe(50); // 3/6 = 50%
    expect(progress.isComplete).toBe(false);
    expect(progress.remainingStages).toBe(3);
  });

  test('should calculate progress for all stages completed', () => {
    const progress = getStageProgress(6, [1, 2, 3, 4, 5, 6]);
    expect(progress.current).toBe(6);
    expect(progress.percentage).toBe(100);
    expect(progress.isComplete).toBe(true);
    expect(progress.remainingStages).toBe(0);
  });

  test('should return nextStage when not at final stage', () => {
    const progress = getStageProgress(3, [1, 2]);
    expect(progress.nextStage).toBeDefined();
    expect(progress.nextStage.id).toBe(4);
  });

  test('should return null nextStage at final stage', () => {
    const progress = getStageProgress(6, [1, 2, 3, 4, 5, 6]);
    expect(progress.nextStage).toBeNull();
  });
});

describe('getCompletedStages', () => {
  test('should return empty array for stage 0 or null', () => {
    expect(getCompletedStages(null)).toEqual([]);
    expect(getCompletedStages(undefined)).toEqual([]);
  });

  test('should return only stage 1 for current stage 1', () => {
    const stages = getCompletedStages(1);
    expect(stages).toHaveLength(1);
    expect(stages[0].id).toBe(1);
  });

  test('should return stages 1-3 for current stage 3', () => {
    const stages = getCompletedStages(3);
    expect(stages).toHaveLength(3);
    expect(stages.map(s => s.id)).toEqual([1, 2, 3]);
  });

  test('should return all stages for stage 6', () => {
    const stages = getCompletedStages(6);
    expect(stages).toHaveLength(6);
  });
});

describe('getRemainingStages', () => {
  test('should return all stages when currentStage is null', () => {
    const stages = getRemainingStages(null);
    expect(stages).toHaveLength(6);
  });

  test('should return stages 2-6 for current stage 1', () => {
    const stages = getRemainingStages(1);
    expect(stages).toHaveLength(5);
    expect(stages[0].id).toBe(2);
    expect(stages[4].id).toBe(6);
  });

  test('should return empty array for final stage', () => {
    const stages = getRemainingStages(6);
    expect(stages).toEqual([]);
  });

  test('should return stages 4-6 for current stage 3', () => {
    const stages = getRemainingStages(3);
    expect(stages).toHaveLength(3);
    expect(stages.map(s => s.id)).toEqual([4, 5, 6]);
  });
});

describe('isStageCompleted', () => {
  test('should return true for stages before current', () => {
    expect(isStageCompleted(1, 3)).toBe(true);
    expect(isStageCompleted(2, 3)).toBe(true);
  });

  test('should return false for current stage', () => {
    expect(isStageCompleted(3, 3)).toBe(false);
  });

  test('should return false for stages after current', () => {
    expect(isStageCompleted(4, 3)).toBe(false);
    expect(isStageCompleted(5, 3)).toBe(false);
  });

  test('should return false for null or undefined values', () => {
    expect(isStageCompleted(null, 3)).toBe(false);
    expect(isStageCompleted(1, null)).toBe(false);
    expect(isStageCompleted(null, null)).toBe(false);
  });
});

describe('isCurrentStage', () => {
  test('should return true when stageId matches currentStage', () => {
    expect(isCurrentStage(3, 3)).toBe(true);
    expect(isCurrentStage(1, 1)).toBe(true);
  });

  test('should return false when stageId does not match', () => {
    expect(isCurrentStage(1, 3)).toBe(false);
    expect(isCurrentStage(5, 3)).toBe(false);
  });

  test('should return false for null or undefined values', () => {
    expect(isCurrentStage(null, 3)).toBe(false);
    expect(isCurrentStage(3, null)).toBe(false);
  });
});

describe('isStagePending', () => {
  test('should return true for stages after current', () => {
    expect(isStagePending(4, 3)).toBe(true);
    expect(isStagePending(5, 3)).toBe(true);
    expect(isStagePending(6, 3)).toBe(true);
  });

  test('should return false for current stage', () => {
    expect(isStagePending(3, 3)).toBe(false);
  });

  test('should return false for completed stages', () => {
    expect(isStagePending(1, 3)).toBe(false);
    expect(isStagePending(2, 3)).toBe(false);
  });

  test('should return true for null currentStage', () => {
    expect(isStagePending(1, null)).toBe(true);
  });
});

describe('getPreviousStage', () => {
  test('should return null for stage 1', () => {
    expect(getPreviousStage(1)).toBeNull();
  });

  test('should return null for invalid stages', () => {
    expect(getPreviousStage(0)).toBeNull();
    expect(getPreviousStage(-1)).toBeNull();
    expect(getPreviousStage(null)).toBeNull();
  });

  test('should return correct previous stage', () => {
    const prevStage = getPreviousStage(3);
    expect(prevStage).toBeDefined();
    expect(prevStage.id).toBe(2);
  });

  test('should work for all valid stages 2-6', () => {
    for (let i = 2; i <= 6; i++) {
      const prevStage = getPreviousStage(i);
      expect(prevStage).toBeDefined();
      expect(prevStage.id).toBe(i - 1);
    }
  });
});

describe('getNextStage', () => {
  test('should return null for stage 6', () => {
    expect(getNextStage(6)).toBeNull();
  });

  test('should return null for invalid stages', () => {
    expect(getNextStage(7)).toBeNull();
    expect(getNextStage(null)).toBeNull();
  });

  test('should return correct next stage', () => {
    const nextStage = getNextStage(3);
    expect(nextStage).toBeDefined();
    expect(nextStage.id).toBe(4);
  });

  test('should work for all valid stages 1-5', () => {
    for (let i = 1; i <= 5; i++) {
      const nextStage = getNextStage(i);
      expect(nextStage).toBeDefined();
      expect(nextStage.id).toBe(i + 1);
    }
  });
});

describe('formatStageDisplay', () => {
  test('should return null for invalid stageId', () => {
    expect(formatStageDisplay(0, 3)).toBeNull();
    expect(formatStageDisplay(7, 3)).toBeNull();
  });

  test('should format completed stage correctly', () => {
    const formatted = formatStageDisplay(1, 3);
    expect(formatted).toBeDefined();
    expect(formatted.status).toBe('completed');
    expect(formatted.statusLabel).toBe('Completed');
    expect(formatted.isCompleted).toBe(true);
    expect(formatted.isCurrent).toBe(false);
    expect(formatted.isPending).toBe(false);
  });

  test('should format current stage correctly', () => {
    const formatted = formatStageDisplay(3, 3);
    expect(formatted).toBeDefined();
    expect(formatted.status).toBe('current');
    expect(formatted.statusLabel).toBe('In Progress');
    expect(formatted.isCompleted).toBe(false);
    expect(formatted.isCurrent).toBe(true);
    expect(formatted.isPending).toBe(false);
  });

  test('should format pending stage correctly', () => {
    const formatted = formatStageDisplay(5, 3);
    expect(formatted).toBeDefined();
    expect(formatted.status).toBe('pending');
    expect(formatted.statusLabel).toBe('Pending');
    expect(formatted.isCompleted).toBe(false);
    expect(formatted.isCurrent).toBe(false);
    expect(formatted.isPending).toBe(true);
  });

  test('should include all original stage properties', () => {
    const formatted = formatStageDisplay(1, 3);
    expect(formatted.id).toBe(1);
    expect(formatted.name).toBe('Proposal Submitted');
    expect(formatted.shortName).toBe('Submitted');
    expect(formatted.icon).toBe('📝');
    expect(formatted.description).toBeDefined();
    expect(formatted.helpText).toBeDefined();
  });
});

describe('getAllStagesFormatted', () => {
  test('should return 6 formatted stages', () => {
    const formatted = getAllStagesFormatted(3);
    expect(formatted).toHaveLength(6);
  });

  test('should correctly mark stages as completed, current, or pending', () => {
    const formatted = getAllStagesFormatted(3);

    // Stages 1-2 should be completed
    expect(formatted[0].status).toBe('completed');
    expect(formatted[1].status).toBe('completed');

    // Stage 3 should be current
    expect(formatted[2].status).toBe('current');

    // Stages 4-6 should be pending
    expect(formatted[3].status).toBe('pending');
    expect(formatted[4].status).toBe('pending');
    expect(formatted[5].status).toBe('pending');
  });

  test('should work for first stage', () => {
    const formatted = getAllStagesFormatted(1);
    expect(formatted[0].status).toBe('current');
    expect(formatted.slice(1).every(s => s.status === 'pending')).toBe(true);
  });

  test('should work for last stage', () => {
    const formatted = getAllStagesFormatted(6);
    expect(formatted[5].status).toBe('current');
    expect(formatted.slice(0, 5).every(s => s.status === 'completed')).toBe(true);
  });
});
