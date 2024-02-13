const clearForm = (
  actions: Record<string, (...args: any) => any>,
  overrides?: { notes?: string }
) => {
  actions.updateFormValue({
    key: 'treatment',
    value: undefined
  });
  actions.updateFormValue({
    key: 'dispenseAsWritten',
    value: false
  });
  actions.updateFormValue({
    key: 'dispenseQuantity',
    value: null
  });
  actions.updateFormValue({
    key: 'dispenseUnit',
    value: undefined
  });
  actions.updateFormValue({
    key: 'daysSupply',
    value: null
  });
  actions.updateFormValue({
    key: 'refillsInput',
    value: 0
  });
  actions.updateFormValue({
    key: 'instructions',
    value: ''
  });
  actions.updateFormValue({
    key: 'notes',
    value: overrides?.notes ?? ''
  });
  actions.updateFormValue({
    key: 'addToTemplates',
    value: false
  });
};

export default clearForm;
