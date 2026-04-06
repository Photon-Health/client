import { vi } from 'vitest';

// solid-element's customElement() registers web components as a side effect when
// source files are imported. Mock it to a no-op so jsdom doesn't choke on those
// registrations during tests.
vi.mock('solid-element', () => ({
  customElement: vi.fn()
}));
