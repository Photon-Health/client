import { PhotonClientStore } from '@photonhealth/components';
import { createContext, useContext } from 'solid-js';

const PhotonContext = createContext<PhotonClientStore>();
const usePhoton = () => useContext(PhotonContext);

export { usePhoton, PhotonContext, PhotonClientStore };
