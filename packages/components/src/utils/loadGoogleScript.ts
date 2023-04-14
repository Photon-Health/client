interface LoadGoogleScriptOptions {
  onLoad: () => void;
  onError: (err: any) => void;
}

export default function loadGoogleScript({ onLoad, onError }: LoadGoogleScriptOptions) {
  const script = document.createElement('script');
  script.src =
    'https://maps.googleapis.com/maps/api/js?key=AIzaSyAvuwwE6g2Bsmih66nu4dB7-H7U1_7KQ6g';
  document.head.appendChild(script);
  script.onload = onLoad;
  script.onerror = onError;
}
