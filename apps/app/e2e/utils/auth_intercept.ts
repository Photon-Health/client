import { Page } from '@playwright/test';

/**
 * Captures full-page trips to Auth0's `/authorize` endpoint.
 *
 * `prompt=none` requests are excluded deliberately: those are the hidden-iframe
 * silent-auth calls, which are expected and harmless. What a login loop looks
 * like is repeated *navigations* to `/authorize` — each one succeeds at Auth0,
 * so the only client-side symptom is that the page keeps bouncing.
 */
export function captureAuthorizeNavigations(page: Page): string[] {
  const urls: string[] = [];
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/authorize') && !url.includes('prompt=none') && req.isNavigationRequest()) {
      urls.push(url);
    }
  });
  return urls;
}

/** Captures every navigation request, including Auth0 logout round trips. */
export function captureNavigations(page: Page): string[] {
  const urls: string[] = [];
  page.on('request', (req) => {
    if (req.isNavigationRequest()) urls.push(req.url());
  });
  return urls;
}
