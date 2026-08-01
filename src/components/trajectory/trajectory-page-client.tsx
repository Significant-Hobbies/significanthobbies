'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import {
  createTrajectoryContract,
  reviewTrajectoryContract,
  type ContractInput,
  type TrajectoryContractState,
} from '~/lib/actions/trajectory-contract';
import {
  changedContractFields,
  CONTRACT_FIELD_LABELS,
  contractSummary,
  type ContractCadence,
  type ReviewDecision,
  type TrajectoryContractRecord,
} from '~/lib/trajectory-contract';

interface Props {
  state: TrajectoryContractState;
  readOnly?: boolean;
}

const EMPTY: ContractInput = {
  constraintsText: '',
  intentText: '',
  decisionPolicyText: '',
  feedbackLoopText: '',
  cadence: 'weekly',
};

const PROMPTS = [
  [
    'constraintsText',
    'Constraints',
    'What must this direction respect?',
    'Full-time work, limited weekday energy, and a small monthly budget.',
  ],
  [
    'intentText',
    'Intent',
    'What direction matters now?',
    'Make and share small films consistently.',
  ],
  [
    'decisionPolicyText',
    'Decision policy',
    'What rule will guide tradeoffs?',
    'Prefer publishing something small over polishing something ambitious.',
  ],
  [
    'feedbackLoopText',
    'Feedback loop',
    'What will you notice, and when?',
    'Each Sunday, review what I made, whether I wanted to return, and what caused friction.',
  ],
] as const;

export function TrajectoryPageClient({ state, readOnly = false }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [draft, setDraft] = useState<ContractInput>(state.active ?? EMPTY);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [signalText, setSignalText] = useState('');
  const [decision, setDecision] = useState<ReviewDecision>('continue');
  const [revision, setRevision] = useState<ContractInput>(state.active ?? EMPTY);
  const [error, setError] = useState('');

  function refreshAfter(action: Promise<{ success: boolean; error?: string }>) {
    setError('');
    startTransition(async () => {
      const result = await action;
      if (!result.success) return setError(result.error ?? 'Could not save trajectory.');
      setReviewOpen(false);
      setSignalText('');
      setDecision('continue');
      router.refresh();
    });
  }

  if (!state.active) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Frame your focus
        </p>
        <h2 className="mt-2 font-serif text-2xl font-semibold">
          One direction. Four useful answers.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Keep these short. This is a rule for living the next stretch, not a life plan.
        </p>
        <ContractFields value={draft} onChange={setDraft} disabled={readOnly || isPending} />
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        {!readOnly && (
          <button
            type="button"
            disabled={isPending}
            onClick={() => refreshAfter(createTrajectoryContract(draft))}
            className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {isPending ? 'Saving…' : 'Set this trajectory'}
          </button>
        )}
      </section>
    );
  }

  const active = state.active;
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-primary/25 bg-card p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Current trajectory
          </p>
          <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            Review {active.cadence}
          </span>
        </div>
        <p className="mt-4 font-serif text-xl leading-relaxed text-foreground">
          {contractSummary(active)}
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {PROMPTS.map(([field, label]) => (
            <div key={field} className="rounded-xl bg-muted/45 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-subtle">{label}</p>
              <p className="mt-2 text-sm leading-relaxed">{active[field]}</p>
            </div>
          ))}
        </div>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setReviewOpen(!reviewOpen)}
            className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {reviewOpen ? 'Close review' : 'Review this trajectory'}
          </button>
        )}
      </section>

      {reviewOpen && (
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
          <h2 className="font-serif text-2xl font-semibold">What did reality tell you?</h2>
          <label className="mt-5 block text-sm font-medium" htmlFor="trajectory-signal">
            Observed signal
          </label>
          <textarea
            id="trajectory-signal"
            rows={4}
            value={signalText}
            onChange={(event) => setSignalText(event.target.value)}
            placeholder="What gave you energy? What caused friction? What changed?"
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
          />
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(['continue', 'adjust', 'complete', 'release'] as ReviewDecision[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setDecision(item)}
                className={`rounded-xl border px-3 py-2 text-sm capitalize ${decision === item ? 'border-primary bg-primary/10 text-primary' : 'border-border'}`}
              >
                {item}
              </button>
            ))}
          </div>
          {decision === 'adjust' && (
            <div className="mt-6 border-t border-border pt-2">
              <ContractFields value={revision} onChange={setRevision} disabled={isPending} />
            </div>
          )}
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              refreshAfter(
                reviewTrajectoryContract({
                  contractId: active.id,
                  signalText,
                  decision,
                  revision: decision === 'adjust' ? revision : undefined,
                })
              )
            }
            className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {isPending
              ? 'Saving…'
              : decision === 'continue'
                ? 'Save review and continue'
                : `Save and ${decision}`}
          </button>
        </section>
      )}

      <History state={state} />
    </div>
  );
}

function ContractFields({
  value,
  onChange,
  disabled,
}: {
  value: ContractInput;
  onChange: (value: ContractInput) => void;
  disabled: boolean;
}) {
  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-2">
      {PROMPTS.map(([field, label, hint, placeholder]) => (
        <label key={field} className="block text-sm font-medium">
          {label}
          <span className="mt-1 block text-xs font-normal text-muted-foreground">{hint}</span>
          <textarea
            rows={4}
            value={value[field]}
            disabled={disabled}
            onChange={(event) => onChange({ ...value, [field]: event.target.value })}
            placeholder={placeholder}
            className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm disabled:opacity-70"
          />
        </label>
      ))}
      <label className="block text-sm font-medium sm:col-span-2">
        Review rhythm
        <select
          value={value.cadence}
          disabled={disabled}
          onChange={(event) =>
            onChange({ ...value, cadence: event.target.value as ContractCadence })
          }
          className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <span className="mt-1 block text-xs font-normal text-muted-foreground">
          A check-in context, not a streak or notification.
        </span>
      </label>
    </div>
  );
}

function History({ state }: { state: TrajectoryContractState }) {
  if (state.contracts.length < 2 && state.reviews.length === 0) return null;
  const byId = new Map(state.contracts.map((contract) => [contract.id, contract]));
  return (
    <section>
      <h2 className="font-serif text-2xl font-semibold">What changed</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Your decisions and earlier framing stay visible. Nothing is scored.
      </p>
      <ol className="mt-5 space-y-4">
        {state.contracts.map((contract) => {
          const previous = contract.previousContractId
            ? (byId.get(contract.previousContractId) ?? null)
            : null;
          const changed = changedContractFields(contract, previous);
          const reviews = state.reviews.filter((review) => review.contractId === contract.id);
          return (
            <li key={contract.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold capitalize">{contract.status}</span>
                <time className="text-xs text-subtle">
                  {contract.openedAt.toLocaleDateString()}
                </time>
              </div>
              {changed.length > 0 && (
                <p className="mt-2 text-xs text-primary">
                  Changed: {changed.map((field) => CONTRACT_FIELD_LABELS[field]).join(', ')}
                </p>
              )}
              <p className="mt-3 text-sm">{contractSummary(contract)}</p>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="mt-3 border-l-2 border-primary/30 pl-3 text-sm text-muted-foreground"
                >
                  <span className="font-medium capitalize text-foreground">{review.decision}:</span>{' '}
                  {review.signalText}
                </div>
              ))}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
