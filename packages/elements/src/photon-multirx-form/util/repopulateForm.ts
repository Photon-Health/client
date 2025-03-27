const repopulateForm = (actions: Record<string, (...args: any) => any>, draft: any) => {
  actions.updateFormValue({
    key: 'treatment',
    value: draft.treatment
  });
  if (draft.dispenseAsWritten) {
    actions.updateFormValue({
      key: 'dispenseAsWritten',
      value: draft.dispenseAsWritten
    });
  }
  if (draft.dispenseQuantity) {
    actions.updateFormValue({
      key: 'dispenseQuantity',
      value: Number(draft.dispenseQuantity)
    });
  }
  if (draft.dispenseUnit) {
    actions.updateFormValue({
      key: 'dispenseUnit',
      value: draft.dispenseUnit
    });
  }
  if (draft.daysSupply) {
    actions.updateFormValue({
      key: 'daysSupply',
      value: Number(draft.daysSupply)
    });
  }
  // if a template is selected in the treatment dropdown, field needs to update to use the fillsAllowed value from the template.
  // this is why there is a -1 here.
  if (draft.fillsAllowed !== undefined && draft.fillsAllowed !== null) {
    const fillsAllowed = Number(draft.fillsAllowed);
    actions.updateFormValue({
      key: 'refillsInput',
      value: fillsAllowed > 0 ? fillsAllowed - 1 : 0
    });
  }
  if (draft.instructions) {
    actions.updateFormValue({
      key: 'instructions',
      value: draft.instructions
    });
  }
  if (draft.notes) {
    actions.updateFormValue({
      key: 'notes',
      value: draft.notes
    });
  }
};

export default repopulateForm;
