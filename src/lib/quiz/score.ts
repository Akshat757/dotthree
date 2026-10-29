import { quizProfiles, quizQuestions } from '@/data/demo';
import type { QuizDimension, QuizProfile, QuizQuestion } from '@/types/content';

export type QuizAnswers = Record<string, string>;

export const EMPTY_VECTOR: Record<QuizDimension, number> = {
  colourTemp: 0,
  materialWarmth: 0,
  ornament: 0,
  storage: 0,
  entertaining: 0,
  naturalLight: 0,
  pattern: 0,
  budget: 0,
};

export function answerVectorFor(
  answers: QuizAnswers,
  questions: QuizQuestion[] = quizQuestions,
): Record<QuizDimension, number> {
  const vector: Record<QuizDimension, number> = { ...EMPTY_VECTOR };

  for (const question of questions) {
    const selected = answers[question.id];
    if (!selected) continue;

    const option = question.options.find((entry) => entry.id === selected);
    if (!option) continue;

    for (const [dimension, value] of Object.entries(option.vector) as [QuizDimension, number][]) {
      vector[dimension] += value;
    }
  }

  return vector;
}

export function cosineSimilarity(
  source: Record<QuizDimension, number>,
  target: Record<QuizDimension, number>,
): number {
  const dot = Object.keys(EMPTY_VECTOR).reduce((sum, key) => {
    const dimension = key as QuizDimension;
    return sum + source[dimension] * target[dimension];
  }, 0);

  const sourceNorm = Math.sqrt(
    Object.keys(EMPTY_VECTOR).reduce((sum, key) => {
      const dimension = key as QuizDimension;
      return sum + source[dimension] ** 2;
    }, 0),
  );

  const targetNorm = Math.sqrt(
    Object.keys(EMPTY_VECTOR).reduce((sum, key) => {
      const dimension = key as QuizDimension;
      return sum + target[dimension] ** 2;
    }, 0),
  );

  if (sourceNorm === 0 || targetNorm === 0) return 0;
  return dot / (sourceNorm * targetNorm);
}

export function scoreQuiz(
  answers: QuizAnswers,
  profiles: QuizProfile[] = quizProfiles,
): QuizProfile {
  if (!profiles.length) {
    throw new Error('No quiz profiles available for scoring.');
  }

  const fallback = profiles[0]!;
  if (!Object.keys(answers).length) return fallback;

  const answerVector = answerVectorFor(answers);
  const ranked = profiles
    .map((profile) => ({
      profile,
      score: cosineSimilarity(answerVector, profile.vector),
    }))
    .sort((left, right) => right.score - left.score);

  return ranked[0]?.profile ?? fallback;
}

export function parseQuizAnswers(
  source: URLSearchParams | Record<string, string | string[] | undefined>,
): QuizAnswers {
  if (source instanceof URLSearchParams) {
    return Object.fromEntries(
      Array.from(source.entries())
        .filter(([, value]) => Boolean(value))
        .map(([key, value]) => [key, value]),
    );
  }

  const answers: QuizAnswers = {};
  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      answers[key] = value[0] ?? '';
      continue;
    }
    if (value) answers[key] = value;
  }
  return answers;
}
