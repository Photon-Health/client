import { act } from '@testing-library/react';
import { vi } from 'vitest';

// react-intersection-observer's test-utils swaps in a vi.fn whose arrow implementation can't be
// constructed, so we drive a real observer stub instead
const observers = new Set<{ cb: IntersectionObserverCallback; elements: Set<Element> }>();

class MockIntersectionObserver {
  private entry = {
    cb: (() => undefined) as IntersectionObserverCallback,
    elements: new Set<Element>()
  };

  constructor(cb: IntersectionObserverCallback) {
    this.entry.cb = cb;
    observers.add(this.entry);
  }
  observe(element: Element) {
    this.entry.elements.add(element);
  }
  unobserve(element: Element) {
    this.entry.elements.delete(element);
  }
  disconnect() {
    observers.delete(this.entry);
  }
  takeRecords() {
    return [];
  }
}

export const mockIntersectionObserver = () =>
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

// reports every observed element as in view, e.g. to fire offer impressions
export const scrollCardsIntoView = () =>
  act(() => {
    observers.forEach(({ cb, elements }) =>
      elements.forEach((target) =>
        cb(
          [{ target, isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
          null as never
        )
      )
    );
  });
