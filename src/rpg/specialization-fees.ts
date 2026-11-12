const SPECIALIZATION_CHANGE_FEES = [
  500,
  1000,
  2000,
  3500,
  5000,
  7500,
  10000
] as const;

/**
 * Tamamlanmış uzmanlık değişikliği sayısına göre
 * sıradaki değişikliğin ücretini döndürür.
 *
 * İlk uzmanlık seçimi bu fonksiyonun dışındadır ve ücretsizdir.
 */
export function getSpecializationChangeFee(
  completedChanges: number
): number | null {
  if (
    !Number.isSafeInteger(completedChanges) ||
    completedChanges < 0
  ) {
    return null;
  }

  const feeIndex = Math.min(
    completedChanges,
    SPECIALIZATION_CHANGE_FEES.length - 1
  );

  return SPECIALIZATION_CHANGE_FEES[feeIndex];
}