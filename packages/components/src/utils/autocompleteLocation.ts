const autocomplete = async (
  inputValue: string,
  autocomeleteService: google.maps.places.AutocompleteService
) => {
  const request = {
    input: inputValue,
    types: ['geocode'],
    componentRestrictions: { country: 'us' }
  };
  const opts = await autocomeleteService.getPlacePredictions(request);
  return opts.predictions.map((org: any) => {
    return {
      value: org.place_id,
      label: org.description
    };
  });
};

export default autocomplete;
