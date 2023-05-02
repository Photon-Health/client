const createTransition =
  (keyframes: Keyframe[] | PropertyIndexedKeyframes, options: KeyframeAnimationOptions) =>
  (el: Element, done: () => void) => {
    const a = el.animate(keyframes, options);
    a.finished.then(done);
  };

export default createTransition;
