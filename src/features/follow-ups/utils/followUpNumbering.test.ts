import { describe, expect, it } from 'vitest';
import { formatFollowUpLabel, numberFollowUpMessages } from './followUpNumbering';

const reply = (id: string) => ({ id, aiIntentTag: null, isDraft: false });
const followUp = (id: string) => ({ id, aiIntentTag: 'FOLLOW_UP', isDraft: false });

describe('numberFollowUpMessages', () => {
  it('numbers follow-ups within a cycle and restarts after an ordinary message', () => {
    const numbers = numberFollowUpMessages([
      reply('r1'),
      followUp('f1'),
      followUp('f2'),
      reply('customer'),
      reply('r2'),
      followUp('f3'),
    ]);
    expect([...numbers]).toEqual([
      ['f1', 1],
      ['f2', 2],
      ['f3', 1],
    ]);
  });

  it('ignores drafts', () => {
    const numbers = numberFollowUpMessages([
      followUp('f1'),
      { id: 'draft', aiIntentTag: null, isDraft: true },
      followUp('f2'),
    ]);
    expect(numbers.get('f2')).toBe(2);
  });
});

describe('formatFollowUpLabel', () => {
  it('shows the position out of the max', () => {
    expect(formatFollowUpLabel(1, 2)).toBe('Follow-up 1/2');
  });

  it('never shows more sent than the max after the max was lowered', () => {
    expect(formatFollowUpLabel(3, 2)).toBe('Follow-up 3/3');
  });

  it('drops the max when it is unknown', () => {
    expect(formatFollowUpLabel(2, undefined)).toBe('Follow-up 2');
  });
});
