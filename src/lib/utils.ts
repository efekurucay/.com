/**
 * Shared server-side utility functions.
 * Safe to import in server components, API routes, and lib files.
 * Do NOT import "use client" components here.
 */

/**
 * Races a promise against a timeout.
 * Returns null if the timeout fires first — prevents Firestore calls from hanging.
 *
 * @example
 * const data = await withTimeout(getHome());  // resolves in max 5 s
 * const data = await withTimeout(getHome(), 3000);  // custom timeout
 */
export function withTimeout<T>(promise: Promise<T>, ms = 5000): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}
