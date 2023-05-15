import { createContext, useContext } from 'solid-js';
import { PhotonClientStore } from './store';
export const PhotonContext = createContext<PhotonClientStore>();
export const usePhoton = () => useContext(PhotonContext);
