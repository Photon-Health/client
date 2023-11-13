import { useColorMode } from '@chakra-ui/react';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { useEffect } from 'react';
import { SesameApp } from './Sesame/OrySesameApp';
import { NotFound } from './views/routes/NotFound';

export const App = () => {
  const { colorMode, toggleColorMode } = useColorMode();

  useEffect(() => {
    // TODO: Remove this once we have a better solution for dark mode.
    // This will set anyones dark mode to light mode
    if (colorMode === 'dark') {
      toggleColorMode();
    }
  }, [colorMode]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SesameApp />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};
