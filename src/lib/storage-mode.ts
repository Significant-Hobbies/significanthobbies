export type StorageMode = 'local' | 'account';

export type StorageCapability = 'local-ready' | 'account-only' | 'public-server';

export const STORAGE_CAPABILITIES = {
  trajectory: 'local-ready',
  onboarding: 'local-ready',
  profile: 'local-ready',
  bucketList: 'local-ready',
  timelines: 'local-ready',
  sideQuests: 'local-ready',
  commitments: 'local-ready',
  habits: 'local-ready',
  daily: 'local-ready',
  lookBack: 'local-ready',
  dashboard: 'local-ready',
  lifePlan: 'local-ready',
  publicProfiles: 'public-server',
  discovery: 'public-server',
} as const satisfies Record<string, StorageCapability>;
