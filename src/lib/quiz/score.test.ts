import { describe, expect, it } from 'vitest';

import { quizProfiles } from '@/data/demo';

import { scoreQuiz } from './score';

describe('quiz scoring', () => {
  it('recommends the heritage-heart profile for warm, ornate, high-budget answers', () => {
    const answers = {
      q1: 'a',
      q2: 'c',
      q3: 'd',
      q4: 'a',
      q5: 'a',
      q6: 'c',
      q7: 'a',
      q8: 'd',
    };

    const result = scoreQuiz(answers, quizProfiles);

    expect(result.id).toBe('heritage-heart');
  });
});
