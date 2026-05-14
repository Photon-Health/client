// Walk up the DOM finding every overflow ancestor of `el`, traversing across
// shadow-DOM boundaries when we hit a shadow root.
export const getScrollAncestors = (el: Element): EventTarget[] => {
  const result: EventTarget[] = [];
  let node: Node | null = el.parentNode;
  while (node) {
    if (node instanceof Element) {
      const { overflowX, overflowY } = getComputedStyle(node);
      if (/(auto|scroll|overlay)/.test(`${overflowX}${overflowY}`)) {
        result.push(node);
      }
      node = node.parentNode;
    } else if (node instanceof ShadowRoot) {
      node = node.host;
    } else {
      break; // Document — stop; window catches viewport scroll
    }
  }
  result.push(window);
  return result;
};
