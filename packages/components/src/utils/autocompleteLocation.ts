export type AutocompleteResults = { value: string | undefined; label: string }[];

const autocomplete = async (
  inputValue: string,
  autocompleteService: google.maps.places.AutocompleteService
): Promise<AutocompleteResults> => {
  const request: google.maps.places.AutocompletionRequest = {
    input: inputValue,
    types: ['geocode'],
    componentRestrictions: { country: 'us' }
  };
  const opts = await autocompleteService.getPlacePredictions(request);
  return opts.predictions.map((prediction: google.maps.places.AutocompletePrediction) => {
    return {
      value: prediction.place_id,
      label: prediction.description
    };
  });
};

export default autocomplete;
