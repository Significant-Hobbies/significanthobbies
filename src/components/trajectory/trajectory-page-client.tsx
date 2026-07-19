'use client';

import { TRAJECTORY_BUCKETS, type TrajectoryBucket } from '~/lib/trajectory';
import type { TrajectoryState } from '~/lib/actions/trajectory';

import { BucketSection } from './bucket-section';

interface Props {
  state: TrajectoryState;
}

/**
 * Top-level client for /trajectory. Renders the 4 fixed buckets in
 * canonical order. Each bucket section is self-contained — holds its own
 * ideal editor and entry form state.
 */
export function TrajectoryPageClient({ state }: Props) {
  return (
    <div className="space-y-10">
      {TRAJECTORY_BUCKETS.map((bucket: TrajectoryBucket) => (
        <BucketSection key={bucket} bucket={bucket} eras={state.erasByBucket[bucket]} />
      ))}
    </div>
  );
}
