import { createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { routeElements } from './Routes';
import './i18n';

const router = createBrowserRouter(createRoutesFromElements(routeElements));

export const App = () => {
  return <RouterProvider router={router} />;
};
