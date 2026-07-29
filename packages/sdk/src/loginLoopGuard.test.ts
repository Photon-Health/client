import { describe, expect, test, beforeEach, vi, afterEach } from 'vitest';
import {
  clearLoginAttempts,
  clearOrgLoginAttempt,
  countLoginAttempts,
  guardLoginAttempt,
  hasOrgLoginBeenAttempted,
  isLoginLoopError,
  LoginLoopError,
  LOGIN_LOOP_MAX_ATTEMPTS,
  LOGIN_LOOP_WINDOW_MS,
  markOrgLoginAttempted,
  recordLoginAttempt,
  resetLoginRedirectLatch
} from './loginLoopGuard';

const CLIENT_ID = 'test-client';

/**
 * A real login redirect navigates, discarding the in-flight latch. Nothing
 * navigates under test, so simulate the page load between attempts explicitly.
 */
function simulatePageLoad() {
  resetLoginRedirectLatch();
}

beforeEach(() => {
  window.sessionStorage.clear();
  resetLoginRedirectLatch();
});

describe('login attempt counting', () => {
  test('counts attempts inside the window', () => {
    recordLoginAttempt(CLIENT_ID, 1000);
    recordLoginAttempt(CLIENT_ID, 2000);

    expect(countLoginAttempts(CLIENT_ID, 2000)).toBe(2);
  });

  test('drops attempts older than the window', () => {
    recordLoginAttempt(CLIENT_ID, 1000);

    expect(countLoginAttempts(CLIENT_ID, 1000 + LOGIN_LOOP_WINDOW_MS + 1)).toBe(0);
  });

  test('scopes attempts per client id', () => {
    recordLoginAttempt('client-a', 1000);

    expect(countLoginAttempts('client-b', 1000)).toBe(0);
  });

  test('clearing resets the count', () => {
    recordLoginAttempt(CLIENT_ID, 1000);
    clearLoginAttempts(CLIENT_ID);

    expect(countLoginAttempts(CLIENT_ID, 1000)).toBe(0);
  });

  test('survives a corrupt stored value', () => {
    window.sessionStorage.setItem('@@photon-login-attempts@@test-client', 'not json');

    expect(() => recordLoginAttempt(CLIENT_ID, 1000)).not.toThrow();
    expect(countLoginAttempts(CLIENT_ID, 1000)).toBe(1);
  });
});

describe('guardLoginAttempt', () => {
  test('allows attempts up to the limit', () => {
    for (let i = 0; i < LOGIN_LOOP_MAX_ATTEMPTS; i++) {
      simulatePageLoad();
      expect(() => guardLoginAttempt(CLIENT_ID, 1000 + i)).not.toThrow();
    }
  });

  test('throws once the limit is exceeded', () => {
    for (let i = 0; i < LOGIN_LOOP_MAX_ATTEMPTS; i++) {
      simulatePageLoad();
      guardLoginAttempt(CLIENT_ID, 1000 + i);
    }

    simulatePageLoad();
    expect(() => guardLoginAttempt(CLIENT_ID, 1000 + LOGIN_LOOP_MAX_ATTEMPTS)).toThrow(
      LoginLoopError
    );
  });

  test('a slow trickle of logins never trips it', () => {
    // Each attempt sits a full window apart, as a user logging in and out over
    // a long session would.
    for (let i = 0; i < LOGIN_LOOP_MAX_ATTEMPTS * 3; i++) {
      simulatePageLoad();
      expect(() =>
        guardLoginAttempt(CLIENT_ID, 1000 + i * (LOGIN_LOOP_WINDOW_MS + 1))
      ).not.toThrow();
    }
  });

  test('clearing after a good session lets logins resume', () => {
    for (let i = 0; i < LOGIN_LOOP_MAX_ATTEMPTS; i++) {
      simulatePageLoad();
      guardLoginAttempt(CLIENT_ID, 1000 + i);
    }
    clearLoginAttempts(CLIENT_ID);

    expect(() => guardLoginAttempt(CLIENT_ID, 1005)).not.toThrow();
  });

  test('counts one page load once, however many callers ask', () => {
    // No simulatePageLoad between these: they are concurrent callers within a
    // single page, like several in-flight GraphQL requests after expiry.
    for (let i = 0; i < LOGIN_LOOP_MAX_ATTEMPTS * 3; i++) {
      expect(() => guardLoginAttempt(CLIENT_ID, 1000 + i)).not.toThrow();
    }

    expect(countLoginAttempts(CLIENT_ID, 1000)).toBe(1);
  });
});

describe('isLoginLoopError', () => {
  test('recognises its own error', () => {
    expect(isLoginLoopError(new LoginLoopError(4))).toBe(true);
  });

  test('recognises a structurally equivalent error from another bundle', () => {
    const fromElsewhere = new Error('nope');
    fromElsewhere.name = 'LoginLoopError';

    expect(isLoginLoopError(fromElsewhere)).toBe(true);
  });

  test('rejects unrelated errors', () => {
    expect(isLoginLoopError(new Error('login_required'))).toBe(false);
    expect(isLoginLoopError(undefined)).toBe(false);
  });
});

describe('org login one-shot markers', () => {
  test('reports unmarked orgs as not attempted', () => {
    expect(hasOrgLoginBeenAttempted(CLIENT_ID, 'org_abc')).toBe(false);
  });

  test('marking makes the attempt visible to the next page load', () => {
    markOrgLoginAttempted(CLIENT_ID, 'org_abc');

    expect(hasOrgLoginBeenAttempted(CLIENT_ID, 'org_abc')).toBe(true);
  });

  test('marks are scoped per org', () => {
    markOrgLoginAttempted(CLIENT_ID, 'org_abc');

    expect(hasOrgLoginBeenAttempted(CLIENT_ID, 'org_xyz')).toBe(false);
  });

  test('clearing allows a later legitimate org switch', () => {
    markOrgLoginAttempted(CLIENT_ID, 'org_abc');
    clearOrgLoginAttempt(CLIENT_ID, 'org_abc');

    expect(hasOrgLoginBeenAttempted(CLIENT_ID, 'org_abc')).toBe(false);
  });
});

describe('when sessionStorage is unavailable', () => {
  // Sandboxed iframes and private browsing expose sessionStorage but throw on
  // access. The guard must degrade rather than break the whole login path.
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('does not throw', () => {
    vi.spyOn(window.sessionStorage, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(() => recordLoginAttempt(CLIENT_ID, 1000)).not.toThrow();
    expect(() => countLoginAttempts(CLIENT_ID, 1000)).not.toThrow();
    expect(() => markOrgLoginAttempted(CLIENT_ID, 'org_abc')).not.toThrow();
  });
});
