interface LoadGoogleScriptOptions {
  onLoad: () => void;
  onError?: (err: any) => void;
}

let scriptLoading = false;

export default function loadGoogleScript({ onLoad, onError }: LoadGoogleScriptOptions) {
  if (window?.google?.maps) {
    onLoad();
  } else if (!scriptLoading) {
    scriptLoading = true;
    const script = document.createElement('script');
    script.src =
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyAvuwwE6g2Bsmih66nu4dB7-H7U1_7KQ6g&libraries=places';
    document.head.appendChild(script);

    script.onload = () => {
      scriptLoading = false;
      onLoad();
    };

    script.onerror = (err) => {
      scriptLoading = false;
      if (onError) {
        onError(err);
      }
    };
  } else {
    // Poll for the script loading completion
    const checkScriptLoaded = setInterval(() => {
      if (window?.google?.maps) {
        clearInterval(checkScriptLoaded);
        onLoad();
      }
    }, 100);
  }
}
