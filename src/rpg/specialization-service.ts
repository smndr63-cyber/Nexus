import type { RpgProfileData } from './types';
import { selectMainSpecialization } from './specializations';
import { getSpecializationChangeFee } from './specialization-fees';

export interface SpecializationWallet {
  coins: number;
  rpg?: RpgProfileData;
}

export type SpecializationChangeResult =
  | {
      ok: true;
      changed: boolean;
      charged: number;
    }
  | {
      ok: false;
      reason:
        | 'invalid_change_count'
        | 'invalid_balance'
        | 'insufficient_funds'
        | 'active_battle'
        | 'unknown_profession'
        | 'unknown_specialization'
        | 'persistence_failed';
    };

type MutableRecord = Record<string, unknown>;

function isRecord(value: unknown): value is MutableRecord {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

// Mevcut nesneleri mümkün olduğunca koruyarak içeriklerini eşitler.
function syncRecord(
  target: MutableRecord,
  source: MutableRecord
): void {
  for (const key of Object.keys(target)) {
    if (!(key in source)) {
      delete target[key];
    }
  }

  for (const [key, sourceValue] of Object.entries(source)) {
    const targetValue = target[key];

    if (isRecord(targetValue) && isRecord(sourceValue)) {
      syncRecord(targetValue, sourceValue);
      continue;
    }

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      const clonedItems = structuredClone(sourceValue);
      targetValue.splice(0, targetValue.length);

      for (const item of clonedItems) {
        targetValue.push(item);
      }

      continue;
    }

    target[key] = structuredClone(sourceValue);
  }
}

export function changeMainSpecialization(
  wallet: SpecializationWallet,
  professionId: string,
  specializationId: string,
  persist: () => void
): SpecializationChangeResult {
  if (!Number.isSafeInteger(wallet.coins) || wallet.coins < 0) {
    return { ok: false, reason: 'invalid_balance' };
  }

  const originalProfile = wallet.rpg;
  const current = originalProfile?.mainSpecialization;

  if (originalProfile?.activeBattle || originalProfile?.activeWorldBossId) {
    return { ok: false, reason: 'active_battle' };
  }

  const isChanging =
    current !== undefined &&
    (
      current.professionId !== professionId ||
      current.specializationId !== specializationId
    );

  let charged = 0;

  if (isChanging) {
    const completedChanges =
      originalProfile?.specializationChangeCount ?? 0;

    const calculatedFee =
      getSpecializationChangeFee(completedChanges);

    if (calculatedFee === null) {
      return { ok: false, reason: 'invalid_change_count' };
    }

    charged = calculatedFee;
  }

  if (wallet.coins < charged) {
    return { ok: false, reason: 'insufficient_funds' };
  }

  let candidateProfile: RpgProfileData;

  try {
    candidateProfile = originalProfile
      ? structuredClone(originalProfile)
      : {};
  } catch {
    return { ok: false, reason: 'persistence_failed' };
  }

  const result = selectMainSpecialization(
    candidateProfile,
    professionId,
    specializationId
  );

  if (!result.ok) {
    return result;
  }

  if (!result.changed) {
    return { ok: true, changed: false, charged: 0 };
  }

  let previousProfile: RpgProfileData | undefined;

  try {
    previousProfile = originalProfile
      ? structuredClone(originalProfile)
      : undefined;
  } catch {
    return { ok: false, reason: 'persistence_failed' };
  }

  const previousCoins = wallet.coins;

  try {
    if (originalProfile) {
      syncRecord(
        originalProfile as unknown as MutableRecord,
        candidateProfile as unknown as MutableRecord
      );
      wallet.rpg = originalProfile;
    } else {
      wallet.rpg = candidateProfile;
    }

    wallet.coins -= charged;
    persist();

    return {
      ok: true,
      changed: true,
      charged
    };
  } catch {
    wallet.coins = previousCoins;

    try {
      if (originalProfile && previousProfile) {
        syncRecord(
          originalProfile as unknown as MutableRecord,
          previousProfile as unknown as MutableRecord
        );
        wallet.rpg = originalProfile;
      } else {
        delete wallet.rpg;
      }
    } catch {
      return { ok: false, reason: 'persistence_failed' };
    }

    return { ok: false, reason: 'persistence_failed' };
  }
}