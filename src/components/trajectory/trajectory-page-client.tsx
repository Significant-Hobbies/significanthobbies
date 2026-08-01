'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import {
  createTrajectoryContract,
  importLocalTrajectory,
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
import {
  archiveLocalTrajectory,
  createLocalTrajectory,
  readLocalTrajectory,
  reviewLocalTrajectory,
} from '~/lib/local-trajectory';
import type { StorageMode } from '~/lib/storage-mode';
import { StorageModeProvider, StorageModeStatus } from '~/components/storage-mode-provider';
import {
  TRAJECTORY_NODES,
  TrajectoryMap,
  type TrajectoryField,
} from '~/components/trajectory/trajectory-map';

interface Props {
  state: TrajectoryContractState;
  storageMode: StorageMode;
}

const EMPTY: ContractInput = {
  constraintsText: '',
  intentText: '',
  decisionPolicyText: '',
  feedbackLoopText: '',
  cadence: 'weekly',
};

export function TrajectoryPageClient({ state: initialState, storageMode }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState(initialState);
  const [localLoading, setLocalLoading] = useState(storageMode === 'local');
  const [draft, setDraft] = useState<ContractInput>(initialState.active ?? EMPTY);
  const [selectedDraftField, setSelectedDraftField] = useState<TrajectoryField>('constraintsText');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [signalText, setSignalText] = useState('');
  const [decision, setDecision] = useState<ReviewDecision>('continue');
  const [revision, setRevision] = useState<ContractInput>(initialState.active ?? EMPTY);
  const [selectedRevisionField, setSelectedRevisionField] =
    useState<TrajectoryField>('constraintsText');
  const [error, setError] = useState('');
  const [pendingImport, setPendingImport] = useState<TrajectoryContractState | null>(null);
  const [importConflict, setImportConflict] = useState(false);
  const [importDismissed, setImportDismissed] = useState(false);

  useEffect(() => {
    readLocalTrajectory()
      .then((localState) => {
        if (storageMode === 'local') {
          setState(localState);
          setDraft(localState.active ?? EMPTY);
          setRevision(localState.active ?? EMPTY);
        } else if (localState.contracts.length > 0) {
          setPendingImport(localState);
        }
      })
      .catch(() => setError('Browser storage is unavailable. Your draft remains on this page.'))
      .finally(() => storageMode === 'local' && setLocalLoading(false));
  }, [storageMode]);

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

  function saveContract() {
    if (storageMode === 'account') return refreshAfter(createTrajectoryContract(draft));
    setError('');
    startTransition(async () => {
      try {
        const next = await createLocalTrajectory(draft);
        setState(next);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Could not save trajectory.');
      }
    });
  }

  function saveReview(activeId: string) {
    const payload = {
      contractId: activeId,
      signalText,
      decision,
      revision: decision === 'adjust' ? revision : undefined,
    };
    if (storageMode === 'account') return refreshAfter(reviewTrajectoryContract(payload));
    setError('');
    startTransition(async () => {
      try {
        const next = await reviewLocalTrajectory(payload);
        setState(next);
        setReviewOpen(false);
        setSignalText('');
        setDecision('continue');
        setRevision(next.active ?? EMPTY);
      } catch (saveError) {
        setError(saveError instanceof Error ? saveError.message : 'Could not save review.');
      }
    });
  }

  function importFromDevice(replaceAccount = false) {
    if (!pendingImport) return;
    setError('');
    startTransition(async () => {
      const result = await importLocalTrajectory(
        pendingImport,
        replaceAccount ? 'replace-account' : 'merge'
      );
      if (result.conflict) return setImportConflict(true);
      if (!result.success) {
        return setError(
          result.error ?? 'Could not import the trajectory. Your device copy is safe.'
        );
      }
      await archiveLocalTrajectory();
      setPendingImport(null);
      setImportConflict(false);
      router.refresh();
    });
  }

  function keepAccountTrajectory() {
    startTransition(async () => {
      await archiveLocalTrajectory();
      setPendingImport(null);
      setImportConflict(false);
    });
  }

  const importPanel =
    storageMode === 'account' && pendingImport && !importDismissed ? (
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Trajectory found on this device
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Import it into this account for cross-device access. The device copy stays intact until
          the import succeeds.
        </p>
        {importConflict && (
          <p className="mt-3 text-sm text-foreground">
            This account already has an active trajectory. Choose which one should remain active.
          </p>
        )}
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {!importConflict && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => importFromDevice(false)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Import from this device
            </button>
          )}
          {importConflict && (
            <>
              <button
                type="button"
                disabled={isPending}
                onClick={() => importFromDevice(true)}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                Use device trajectory
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={keepAccountTrajectory}
                className="rounded-xl border border-border px-4 py-2 text-sm font-medium"
              >
                Keep account trajectory
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setImportDismissed(true)}
            className="rounded-xl px-4 py-2 text-sm text-muted-foreground"
          >
            Keep it on this device for now
          </button>
        </div>
      </section>
    ) : null;

  if (localLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading your trajectory from this device…</p>
    );
  }

  if (!state.active) {
    return (
      <StorageModeProvider mode={storageMode}>
        <div className="space-y-8">
          {importPanel}
          <section className="rounded-2xl border border-border bg-card p-4 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Frame your focus
            </p>
            <h2 className="mt-2 font-serif text-2xl font-semibold">
              Map the direction, not the destination.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Start anywhere. Each part changes how the others make sense; select a point on the map
              and keep it short.
            </p>
            <div className="mt-3">
              <StorageModeStatus />
            </div>
            <div className="mt-6">
              <TrajectoryMap
                value={draft}
                selected={selectedDraftField}
                onSelect={setSelectedDraftField}
              />
            </div>
            <FocusedContractEditor
              value={draft}
              onChange={setDraft}
              selected={selectedDraftField}
              onSelect={setSelectedDraftField}
              disabled={isPending}
            />
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            <button
              type="button"
              disabled={isPending}
              onClick={saveContract}
              className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {isPending ? 'Saving…' : 'Set this trajectory'}
            </button>
          </section>
        </div>
      </StorageModeProvider>
    );
  }

  const active = state.active;
  return (
    <StorageModeProvider mode={storageMode}>
      <div className="space-y-8">
        {importPanel}
        <section className="rounded-2xl border border-primary/25 bg-card p-4 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Current trajectory
            </p>
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Review {active.cadence}
            </span>
          </div>
          <div className="mt-3">
            <StorageModeStatus />
          </div>
          <p className="mt-4 max-w-2xl font-serif text-xl leading-relaxed text-foreground">
            {contractSummary(active)}
          </p>
          <div className="mt-6">
            <TrajectoryMap value={active} mode="view" />
          </div>
          <button
            type="button"
            onClick={() => setReviewOpen(!reviewOpen)}
            className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {reviewOpen ? 'Close review' : 'Review this trajectory'}
          </button>
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
              <div className="mt-6 border-t border-border pt-6">
                <p className="mb-4 text-sm text-muted-foreground">
                  Select the part of the path that reality changed.
                </p>
                <TrajectoryMap
                  value={revision}
                  selected={selectedRevisionField}
                  onSelect={setSelectedRevisionField}
                />
                <FocusedContractEditor
                  value={revision}
                  onChange={setRevision}
                  selected={selectedRevisionField}
                  onSelect={setSelectedRevisionField}
                  disabled={isPending}
                />
              </div>
            )}
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
            <button
              type="button"
              disabled={isPending}
              onClick={() => saveReview(active.id)}
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
    </StorageModeProvider>
  );
}

function FocusedContractEditor({
  value,
  onChange,
  selected,
  onSelect,
  disabled,
}: {
  value: ContractInput;
  onChange: (value: ContractInput) => void;
  selected: TrajectoryField;
  onSelect: (field: TrajectoryField) => void;
  disabled: boolean;
}) {
  const selectedIndex = TRAJECTORY_NODES.findIndex(({ field }) => field === selected);
  const node = TRAJECTORY_NODES[selectedIndex];
  const previous = TRAJECTORY_NODES[selectedIndex - 1];
  const next = TRAJECTORY_NODES[selectedIndex + 1];
  if (!node) return null;

  return (
    <div className="mt-4 rounded-2xl border border-border bg-background p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <label className="block flex-1 text-sm font-medium" htmlFor={`trajectory-${node.field}`}>
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Editing {selectedIndex + 1} of 4
          </span>
          <span className="mt-1 block font-serif text-xl font-semibold">{node.label}</span>
          <span className="mt-1 block text-xs font-normal text-muted-foreground">
            {node.prompt}
          </span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!previous || disabled}
            onClick={() => previous && onSelect(previous.field)}
            className="min-h-10 rounded-lg border border-border px-3 text-sm disabled:opacity-35"
            aria-label="Previous trajectory part"
          >
            ←
          </button>
          <button
            type="button"
            disabled={!next || disabled}
            onClick={() => next && onSelect(next.field)}
            className="min-h-10 rounded-lg border border-border px-3 text-sm disabled:opacity-35"
            aria-label="Next trajectory part"
          >
            →
          </button>
        </div>
      </div>
      <textarea
        id={`trajectory-${node.field}`}
        aria-label={node.label}
        rows={4}
        value={value[node.field]}
        disabled={disabled}
        onChange={(event) => onChange({ ...value, [node.field]: event.target.value })}
        placeholder={node.placeholder}
        autoFocus
        className="mt-4 w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-sm leading-relaxed disabled:opacity-70"
      />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-border pt-4">
        <label className="block min-w-44 text-sm font-medium">
          Review rhythm
          <select
            value={value.cadence}
            disabled={disabled}
            onChange={(event) =>
              onChange({ ...value, cadence: event.target.value as ContractCadence })
            }
            className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </label>
        {next && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSelect(next.field)}
            className="min-h-10 rounded-lg bg-muted px-4 text-sm font-medium text-foreground hover:bg-accent"
          >
            Continue to {next.label.toLowerCase()} →
          </button>
        )}
      </div>
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
      <ol className="relative mt-5 space-y-5 border-l border-primary/25 pl-6">
        {state.contracts.map((contract) => {
          const previous = contract.previousContractId
            ? (byId.get(contract.previousContractId) ?? null)
            : null;
          const changed = changedContractFields(contract, previous);
          const reviews = state.reviews.filter((review) => review.contractId === contract.id);
          return (
            <li key={contract.id} className="relative rounded-xl border border-border bg-card p-4">
              <span
                aria-hidden="true"
                className="absolute -left-[1.82rem] top-5 size-3 rounded-full border-2 border-background bg-primary"
              />
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
