/**
 * The prescribe flow element has several "prefill" attributes
 * that accept complex JSON strings.
 * At runtime, `solid-element`'s customElement attempts to parse these values.
 * Valid JSON → object; invalid JSON → the raw string.
 * Engineers should ensure that types defined with this helper
 * are properly validated and handled.
 */
export type Prefill<T> = Unverified<T> | string;

// Parsing the JSON string successfully says nothing about the shape of what was parsed,
// so every object — including array elements — is widened to `Partial`.
type Unverified<T> = T extends (infer Element)[]
  ? Unverified<Element>[]
  : T extends object
  ? Partial<T>
  : T;
