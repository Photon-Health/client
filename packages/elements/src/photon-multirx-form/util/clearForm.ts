const clearForm = (actions: Record<string, (...args: any) => any>) => {
  actions.updateFormValue({
    key: 'treatment',
    value: ''
  });
  actions.updateFormValue({
    key: 'dispenseAsWritten',
    value: ''
  });

  actions.updateFormValue({
    key: 'dispenseQuantity',
    value: null
  });

  actions.updateFormValue({
    key: 'dispenseUnit',
    value: 'Each'
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
    value: ''
  });
};

export default clearForm;
