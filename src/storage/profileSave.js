/** @typedef {{ id: string, name: string, createdAt: string }} ProfileMeta */

export const PROFILE_META_KEY = 'farm-profiles-meta-v1';
export const LEGACY_PLANTINGS_KEY = 'farm-plantings-v1';
export const LEGACY_CAUGHT_KEY = 'farm-caught-v1';
export const EXPORT_SCHEMA_VERSION = 1;

export function profileSaveKey(profileId) {
  return `farm-profile-save-v1:${profileId}`;
}

export function createEmptySave() {
  return {
    plantings: [],
    caughtFish: [],
    bundleTracker: {
      variant: 'standard',
      checkedItems: {},
      completedBundles: {},
      bundleNotes: {},
    },
  };
}

export function createProfile(name) {
  return {
    id: `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim() || 'Новая ферма',
    createdAt: new Date().toISOString(),
  };
}

export function normalizeSave(raw) {
  const base = createEmptySave();
  if (!raw || typeof raw !== 'object') return base;
  return {
    plantings: Array.isArray(raw.plantings) ? raw.plantings : base.plantings,
    caughtFish: Array.isArray(raw.caughtFish) ? raw.caughtFish : base.caughtFish,
    bundleTracker: {
      variant: raw.bundleTracker?.variant === 'remixed' ? 'remixed' : 'standard',
      checkedItems:
        raw.bundleTracker?.checkedItems && typeof raw.bundleTracker.checkedItems === 'object'
          ? { ...raw.bundleTracker.checkedItems }
          : {},
      completedBundles:
        raw.bundleTracker?.completedBundles && typeof raw.bundleTracker.completedBundles === 'object'
          ? { ...raw.bundleTracker.completedBundles }
          : {},
      bundleNotes:
        raw.bundleTracker?.bundleNotes && typeof raw.bundleTracker.bundleNotes === 'object'
          ? { ...raw.bundleTracker.bundleNotes }
          : {},
    },
  };
}