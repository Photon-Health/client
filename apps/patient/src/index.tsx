import { createRoot } from 'react-dom/client';

import { App } from './App';

import ReactGA from 'react-ga4';

ReactGA.initialize('G-WQ9PD39S25');

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
