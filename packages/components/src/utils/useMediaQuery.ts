import { createSignal, onCleanup, onMount } from 'solid-js';

/**
 * Reactive matchMedia hook. Returns a signal that tracks whether the query matches.
 * Unlike a static window.innerWidth check, this updates when the viewport changes.
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * // isMobile() reactively returns true/false
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = createSignal(false);

  onMount(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);

    onCleanup(() => mql.removeEventListener('change', handler));
  });

  return matches;
}
