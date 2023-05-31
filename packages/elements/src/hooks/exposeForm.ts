import { ICustomElement } from 'component-register';
import { Accessor, createEffect, createSignal, Setter } from 'solid-js';

export function exposeForm(
  el: ICustomElement
): [Accessor<Map<string, any> | undefined>, Accessor<number>, Setter<any>] {
  const [form, setForm] = createSignal<Map<string, any>>();
  const [updated, setUpdated] = createSignal<number>(0);
  const [ref, setRef] = createSignal<any>();

  createEffect(() => {
    if (ref()) {
      el['reportValidity'] = () => ref().reportValidity();
    }
  });

  el['addForm'] = (formData: Map<string, any>) => {
    setForm(formData);
    setUpdated((c) => c + 1);
  };

  el['resetFormEl'] = () => {
    setUpdated(0);
  };

  return [form, updated, setRef];
}
