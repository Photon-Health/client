import { createContext, createSignal, JSXElement, useContext, onMount, Accessor } from 'solid-js';
import loadGoogleScript from '../../utils/loadGoogleScript';

export type GoogleServiceContextType = {
  googleMapsServices: Accessor<{
    geocoder: google.maps.Geocoder | null;
    autocompleteService: google.maps.places.AutocompleteService | null;
  }>;
};

const GoogleServiceContext = createContext<GoogleServiceContextType>();

interface GoogleServiceProviderProps {
  children: JSXElement;
}

export const GoogleServiceProvider = (props: GoogleServiceProviderProps) => {
  const [googleMapsServices, setGoogleMapsServices] = createSignal<{
    geocoder: google.maps.Geocoder | null;
    autocompleteService: google.maps.places.AutocompleteService | null;
  }>({
    geocoder: null,
    autocompleteService: null
  });

  onMount(() => {
    loadGoogleScript({
      onLoad: () => {
        setGoogleMapsServices({
          geocoder: new google.maps.Geocoder(),
          autocompleteService: new google.maps.places.AutocompleteService()
        });
      },
      onError: (error) => {
        console.error('Error loading Google Maps script:', error);
      }
    });
  });

  return (
    <GoogleServiceContext.Provider
      value={{
        googleMapsServices
      }}
    >
      {props.children}
    </GoogleServiceContext.Provider>
  );
};

export const useGoogleService = () => {
  const context = useContext(GoogleServiceContext);
  if (!context) {
    throw new Error('useGoogleService must be used within the GoogleServiceProvider');
  }
  return context;
};

export const useGoogleServiceOptional = () => {
  return useContext(GoogleServiceContext);
};
