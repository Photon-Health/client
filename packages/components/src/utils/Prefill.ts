/**
 * The prescribe flow element has several "prefill" attributes
that accept complex JSON strings.
 * At runtime, `solid-element`'s customElement attempts to JSON parse these values.
 * Parseable JSON → object; unparseable JSON such as '{"firstName' → the raw string.
 * Engineers should ensure that types defined with this helper
 * are properly validated and handled.
 */
export type Prefill<T> = Unvalidated<T> | string;

// Parsing the JSON string successfully doesn't guarantee anything about the shape
// of what was parsed. Object types are widened to Partial to remind engs
// to validate the actual contents of each object.
// For ex. '{"firstName": "John"}' is parseable JSON but does not contain
// all required fields in SupervisorInput
type Unvalidated<T> = T extends (infer Element)[]
  ? Unvalidated<Element>[]
  : T extends object
  ? Partial<T>
  : T;
