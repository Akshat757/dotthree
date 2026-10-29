'use client';

import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Img } from '@/components/ui/img';
import { quizQuestions } from '@/data/demo';
import { cn } from '@/lib/utils';

export function QuizBrowser() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [step, setStep] = useState(0);

  const question = quizQuestions[step];
  const progress = ((step + 1) / quizQuestions.length) * 100;
  const currentAnswer = question ? answers[question.id] : undefined;

  const handleSelect = (optionId: string) => {
    if (!question) return;

    const nextAnswers = { ...answers, [question.id]: optionId };
    setAnswers(nextAnswers);

    if (step === quizQuestions.length - 1) {
      const params = new URLSearchParams();
      Object.entries(nextAnswers).forEach(([key, value]) => params.set(key, value));
      router.push(`/quiz/result/?${params.toString()}`);
      return;
    }

    setStep((previous) => previous + 1);
  };

  if (!question) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-e1 md:p-8">
      <div className="mb-6 flex items-center justify-between gap-3 text-caption text-ink-muted">
        <span>
          Question {step + 1} of {quizQuestions.length}
        </span>
        <span>
          {Object.keys(answers).length}/{quizQuestions.length} answered
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunk">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-8">
        <p className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-2.5 py-1 text-caption font-medium text-accent-hover">
          <Sparkles className="size-3.5" aria-hidden />
          Style match
        </p>
        <h2 className="mt-4 max-w-2xl font-display text-h2 text-ink">{question.prompt}</h2>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {question.options.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.id)}
            className={cn(
              'group overflow-hidden rounded-lg border bg-canvas text-left transition-colors focus-visible:ring-2 focus-visible:ring-focus/40 focus-visible:outline-none',
              currentAnswer === option.id
                ? 'border-accent bg-accent-soft shadow-e1'
                : 'border-line hover:border-accent/70 hover:bg-surface-sunk',
            )}
          >
            <div className="overflow-hidden">
              <Img
                image={option.image}
                aspect="4/3"
                className="transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </div>
            <div className="flex items-center justify-between gap-3 p-4">
              <span className="text-body-s font-medium text-ink">{option.label}</span>
              <ArrowRight
                className="size-4 text-ink-muted transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep((previous) => Math.max(0, previous - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="size-4" aria-hidden /> Previous
        </Button>
        <p className="text-body-s text-ink-muted">
          {currentAnswer ? 'Answer saved' : 'Pick one option to continue'}
        </p>
      </div>
    </div>
  );
}
