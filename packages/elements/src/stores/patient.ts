import { createPatientStore } from '@photonhealth/components';
import { createStore } from 'solid-js/store';

export const PatientStore = createPatientStore(createStore);
