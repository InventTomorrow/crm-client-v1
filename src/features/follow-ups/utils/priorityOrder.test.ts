import { describe, expect, it } from 'vitest';
import { followUpSettingsSchema, type FollowUpSettingsForm } from '../types';
import { moveStatusInPriority, toggleStatusInPriority } from './priorityOrder';

const VALID_SETTINGS: FollowUpSettingsForm = {
  enabled: true,
  intervalHours: 24,
  maxAttempts: 2,
  dailyLimit: 100,
  priority: ['HOT', 'WARM', 'PROSPECT'],
};

describe('moveStatusInPriority', () => {
  it('swaps a status with its neighbour', () => {
    expect(moveStatusInPriority(['HOT', 'WARM', 'PROSPECT'], 'WARM', -1)).toEqual(['WARM', 'HOT', 'PROSPECT']);
    expect(moveStatusInPriority(['HOT', 'WARM', 'PROSPECT'], 'WARM', 1)).toEqual(['HOT', 'PROSPECT', 'WARM']);
  });

  it('leaves the order alone at either end', () => {
    expect(moveStatusInPriority(['HOT', 'WARM'], 'HOT', -1)).toEqual(['HOT', 'WARM']);
    expect(moveStatusInPriority(['HOT', 'WARM'], 'WARM', 1)).toEqual(['HOT', 'WARM']);
  });
});

describe('toggleStatusInPriority', () => {
  it('removes an included status and appends a newly included one last', () => {
    expect(toggleStatusInPriority(['HOT', 'WARM'], 'HOT')).toEqual(['WARM']);
    expect(toggleStatusInPriority(['WARM'], 'HOT')).toEqual(['WARM', 'HOT']);
  });
});

describe('followUpSettingsSchema', () => {
  it('accepts valid settings', () => {
    expect(followUpSettingsSchema.safeParse(VALID_SETTINGS).success).toBe(true);
  });

  it.each([
    ['an impossible daily limit', { dailyLimit: 10_000 }],
    ['a daily limit below the minimum', { dailyLimit: 5 }],
    ['an empty number field', { intervalHours: Number.NaN }],
    ['no status to follow up', { priority: [] }],
    ['a repeated status', { priority: ['HOT', 'HOT'] }],
  ])('rejects %s', (_case, change) => {
    expect(followUpSettingsSchema.safeParse({ ...VALID_SETTINGS, ...change }).success).toBe(false);
  });
});
