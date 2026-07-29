/**
 * Persisted-across-redirect state used to break authentication redirect loops.
 *
 * A login loop looks *healthy* from Auth0's side — every `/authorize` logs
 * "Success Silent Auth" and every code exchange logs "Success Exchange" —
 * because the session really is fine. What fails is the app's ability to use
 * it: an org claim that never materializes, a blocked silent-auth iframe, a
 * user id that can never match. Each iteration is a full page navigation, so
 * in-memory counters are wiped every time round; the only way to notice the
 * loop is to persist a counter across those navigations.
 *
 * sessionStorage is per-tab and survives navigation, which is exactly the
 * lifetime we want. It is unavailable in some of the contexts elements get
 * embedded in (sandboxed iframes, Safari private mode) and in Node, where
 * customers use the SDK server-side, so every access falls back to an
 * in-memory map. That fallback cannot survive a redirect, so the breaker
 * simply never trips there — degrading to the previous behaviour rather than
 * throwing.
 */

const ATTEMPTS_KEY_PREFIX = '@@photon-login-attempts@@';
const ORG_LOGIN_KEY_PREFIX = '@@photon-org-login@@';

/**
 * Login redirects allowed inside {@link LOGIN_LOOP_WINDOW_MS} before the
 * breaker trips. A legitimate cold start costs one redirect, and the
 * claim-assisted org re-login costs a second, so this leaves one spare.
 */
export const LOGIN_LOOP_MAX_ATTEMPTS = 3;

/** Sliding window over which login redirects are counted. */
export const LOGIN_LOOP_WINDOW_MS = 30_000;

export const LOGIN_LOOP_ERROR_NAME = 'LoginLoopError';

/**
 * User-facing copy for a tripped breaker. Deliberately vague about the cause —
 * the actionable detail goes to the console via {@link LoginLoopError.message}.
 */
export const LOGIN_LOOP_USER_MESSAGE =
  'Unable to complete sign in. Please refresh the page, or contact support if this keeps happening.';

export class LoginLoopError extends Error {
  public readonly attempts: number;

  public constructor(attempts: number) {
    super(
      `Aborted login: ${attempts} login redirects in the last ${Math.round(
        LOGIN_LOOP_WINDOW_MS / 1000
      )}s. The Auth0 session is being established successfully but the app cannot use it. ` +
        'Check that the org, audience, connection and callback URL passed to <photon-client> ' +
        'are correct, and that silent authentication is not being blocked.'
    );
    this.name = LOGIN_LOOP_ERROR_NAME;
    this.attempts = attempts;
    // Preserved explicitly so `instanceof` survives transpilation and the
    // package boundary between sdk / components / elements.
    Object.setPrototypeOf(this, LoginLoopError.prototype);
  }
}

export function isLoginLoopError(error: unknown): error is LoginLoopError {
  if (error instanceof LoginLoopError) return true;
  // Name check so a LoginLoopError thrown from a differently-bundled copy of
  // the SDK is still recognised by consumers.
  return (error as Error | undefined)?.name === LOGIN_LOOP_ERROR_NAME;
}

type Store = {
  read: (key: string) => string | null;
  write: (key: string, value: string) => void;
  remove: (key: string) => void;
};

const memory = new Map<string, string>();

const memoryStore: Store = {
  read: (key) => memory.get(key) ?? null,
  write: (key, value) => {
    memory.set(key, value);
  },
  remove: (key) => {
    memory.delete(key);
  }
};

/**
 * Resolves sessionStorage, falling back to memory. The probe write is what
 * actually distinguishes "present" from "usable" — sandboxed iframes expose
 * the object but throw SecurityError on access.
 */
function getStore(): Store {
  try {
    const storage = globalThis.sessionStorage;
    if (!storage) return memoryStore;
    const probeKey = `${ATTEMPTS_KEY_PREFIX}probe`;
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return {
      read: (key) => storage.getItem(key),
      write: (key, value) => storage.setItem(key, value),
      remove: (key) => storage.removeItem(key)
    };
  } catch {
    return memoryStore;
  }
}

function attemptsKey(clientId?: string): string {
  return `${ATTEMPTS_KEY_PREFIX}${clientId ?? 'default'}`;
}

function orgLoginKey(clientId: string | undefined, orgId: string): string {
  return `${ORG_LOGIN_KEY_PREFIX}${clientId ?? 'default'}::${orgId}`;
}

function readAttempts(store: Store, key: string, now: number): number[] {
  const raw = store.read(key);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (at): at is number => typeof at === 'number' && now - at < LOGIN_LOOP_WINDOW_MS
    );
  } catch {
    return [];
  }
}

/**
 * Records a login redirect and returns how many have happened inside the
 * window, this one included.
 */
export function recordLoginAttempt(clientId?: string, now: number = Date.now()): number {
  const store = getStore();
  const key = attemptsKey(clientId);
  const attempts = [...readAttempts(store, key, now), now];
  store.write(key, JSON.stringify(attempts));
  return attempts.length;
}

export function countLoginAttempts(clientId?: string, now: number = Date.now()): number {
  return readAttempts(getStore(), attemptsKey(clientId), now).length;
}

/**
 * Called once a session has been successfully established *and used*, which is
 * the only evidence that we are not looping. Note that logging out must not
 * clear the counter — logout-then-login is itself one of the loops this guards
 * against.
 */
export function clearLoginAttempts(clientId?: string): void {
  getStore().remove(attemptsKey(clientId));
  // A confirmed session means we are settled on a live page, not mid-redirect,
  // so a later deliberate login (a user switch, say) should count again.
  redirectInFlight = false;
}

/**
 * Whether a login redirect has already been initiated in this page instance.
 * Reset naturally by the ensuing navigation, since that discards the module.
 */
let redirectInFlight = false;

/**
 * Clears the in-flight latch. Only needed in tests, where no navigation happens
 * to discard it between simulated page loads.
 */
export function resetLoginRedirectLatch(): void {
  redirectInFlight = false;
}

/**
 * Records an attempt and throws once the window is exceeded. Call immediately
 * before any full-page login redirect.
 *
 * One page load counts once, however many callers ask. The Apollo link fetches
 * a token per GraphQL request, so an expiring session has every in-flight query
 * arrive here at the same moment; counting each would trip the breaker on an
 * ordinary re-login. What a loop actually looks like is one login *per page
 * load*, repeated — and the navigation this precedes is what resets the latch.
 */
export function guardLoginAttempt(clientId?: string, now: number = Date.now()): void {
  if (redirectInFlight) return;

  const attempts = recordLoginAttempt(clientId, now);
  if (attempts > LOGIN_LOOP_MAX_ATTEMPTS) {
    throw new LoginLoopError(attempts);
  }
  redirectInFlight = true;
}

/**
 * One-shot marker for the claim-assisted, org-scoped re-login. That redirect
 * only terminates if the resulting ID token carries an `org_id` claim; if it
 * never does, the marker is what stops us asking a second time.
 */
export function hasOrgLoginBeenAttempted(clientId: string | undefined, orgId: string): boolean {
  return getStore().read(orgLoginKey(clientId, orgId)) !== null;
}

export function markOrgLoginAttempted(clientId: string | undefined, orgId: string): void {
  getStore().write(orgLoginKey(clientId, orgId), '1');
}

export function clearOrgLoginAttempt(clientId: string | undefined, orgId: string): void {
  getStore().remove(orgLoginKey(clientId, orgId));
}
