import { PhotonContext, PhotonClientStore } from '@photonhealth/components';
import { useContext } from 'solid-js';

const usePhoton = () => useContext(PhotonContext);

export { usePhoton, PhotonContext, PhotonClientStore };
