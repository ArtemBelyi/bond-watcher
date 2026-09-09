/**
 * Returns the first `limit` items. Returns empty array when limit <= 0.
 */
export function take<T>(items: readonly T[], limit: number): T[] {
  if (limit <= 0) {
    return [];
  }
  return items.slice(0, limit);
}