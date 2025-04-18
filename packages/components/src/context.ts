import { createContext, useContext } from 'solid-js';
import { PhotonClientStore } from './store';

export const PhotonContext = createContext<PhotonClientStore>();

export const usePhoton = () => {
  const context = useContext(PhotonContext);
  if (!context) {
    throw new Error('usePhoton must be used within PhotonContext');
  }
  return context;
};
