import mongoose from 'mongoose';

/**
 * Strips MongoDB operator keys (starting with `$`) and dotted-path keys from
 * any plain object or array, recursively. This prevents NoSQL injection attacks
 * where an attacker sends `{ "password": { "$gt": "" } }` to bypass comparisons.
 *
 * Usage: const safe = sanitizeMongoOperators(req.body);
 */
export function sanitizeMongoOperators<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(sanitizeMongoOperators) as unknown as T;
  }
  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(value as object)) {
      // Drop any key that starts with `$` (MongoDB operator) or contains `.` (path traversal)
      if (key.startsWith('$') || key.includes('.')) continue;
      sanitized[key] = sanitizeMongoOperators((value as Record<string, unknown>)[key]);
    }
    return sanitized as unknown as T;
  }
  return value;
}

/**
 * Returns true if the given string is a valid 24-character MongoDB ObjectId.
 * Always validate IDs from user input before passing them to Mongoose queries
 * to prevent CastError crashes that leak internal details.
 */
export function isValidObjectId(id: unknown): id is string {
  return typeof id === 'string' && mongoose.Types.ObjectId.isValid(id);
}

/**
 * Validates that a callbackUrl is same-origin (relative path starting with `/`)
 * and does not contain protocol-relative (`//`) or absolute URLs that could be
 * used for open-redirect attacks.
 */
export function isSafeRedirectUrl(url: string): boolean {
  if (!url) return false;
  // Must start with `/` but NOT `//` (protocol-relative)
  if (!url.startsWith('/') || url.startsWith('//')) return false;
  // Must not contain a newline or carriage return (header-injection guard)
  if (/[\r\n]/.test(url)) return false;
  return true;
}

/**
 * Whitelisted sort fields for the product catalog query.
 * Never pass a raw user-supplied sort string to Mongoose — it can be used
 * for query timing attacks or to surface unindexed fields.
 */
export const ALLOWED_PRODUCT_SORT_FIELDS = new Set([
  '-createdAt',
  'createdAt',
  'price',
  '-price',
  'name',
  '-name',
]);

export function sanitizeProductSort(sort: string | null): string {
  if (!sort) return '-createdAt';
  return ALLOWED_PRODUCT_SORT_FIELDS.has(sort) ? sort : '-createdAt';
}
