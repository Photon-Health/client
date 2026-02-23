import AddressForm from './systems/AddressForm';
import { Alert } from './particles/Alert';
import Input from './particles/Input';
import { InputGroup } from './particles/InputGroup';
import DateInput from './particles/DateInput';
import StateSelect from './particles/StateSelect';
import PhoneInput from './particles/PhoneInput';
import SexSelect, { SEX_OPTIONS } from './particles/SexSelect';
import GenderSelect, { GENDER_OPTIONS } from './particles/GenderSelect';
import Banner from './particles/Banner';
import DoseCalculator from './systems/DoseCalculator';
import Card from './particles/Card';
import ComboBox from './particles/ComboBox';
import {
  DraftPrescriptionList,
  DraftPrescriptionsProvider,
  type PrescriptionFormData,
  type TemplateOverrides,
  type TryCreatePrescriptionTemplateOptions,
  useDraftPrescriptions
} from './systems/DraftPrescriptions';
import Icon from './particles/Icon';
import PatientInfo from './systems/PatientInfo';
import PatientMedHistory from './systems/PatientMedHistory';
import PickupPharmacySearch from './systems/PharmacySearch';
import { PharmacySelect } from './systems/PharmacySelect';
import Spinner from './particles/Spinner';
import RadioGroupCards from './particles/RadioGroupCards';
import { RecentOrders, useRecentOrders } from './systems/RecentOrders';
import Dialog from './particles/Dialog';
import Button from './particles/Button';
import SDKProvider, { usePhotonClient } from './systems/SDKProvider';
import Table from './particles/Table';
import Text from './particles/Text';
import Toaster from './particles/Toaster';
import {
  ScreeningAlertAcknowledgementDialog,
  ScreeningAlerts,
  ScreeningAlertType
} from './systems/ScreeningAlerts';
import { RoutingConstraint } from './systems/RoutingConstraints';

import triggerToast from './utils/toastTriggers';
import generateString from './utils/generateString';
import { createQuery } from './utils/createQuery';
import formatDate, { CALENDAR_DATE_FORMAT } from './utils/formatDate';
import { formatPrescriptionDetails } from './utils/formatPrescriptionDetail';

import { SignatureAttestationModal } from './systems/SignatureAttestation';

import { PhotonContext, usePhoton } from './context';
import { PhotonClientStore } from './store';
import { CoverageOption, PrescribeProvider, usePrescribe } from './systems/PrescribeProvider';

import { GoogleServiceProvider, useGoogleService } from './systems/GoogleServiceProvider';

import {
  PrescribeEventDispatchProvider,
  usePrescribeEventDispatch
} from './systems/PrescribeEventDispatchProvider';
import {
  dispatchAnalyticsEvent,
  type FormAnalyticsEventDetail,
  type MilestoneType,
  type FieldCompletionSnapshot
} from './analytics/dispatchAnalyticsEvent';
import { buildFieldSnapshot, PATIENT_FORM_FIELDS } from './analytics/buildFieldSnapshot';

export { usePhoton, PhotonClientStore, PhotonContext };

export {
  AddressForm,
  Alert,
  Banner,
  Input,
  InputGroup,
  DateInput,
  StateSelect,
  PhoneInput,
  SexSelect,
  GenderSelect,
  SEX_OPTIONS,
  GENDER_OPTIONS,
  Button,
  Card,
  ComboBox,
  Dialog,
  DoseCalculator,
  DraftPrescriptionList,
  DraftPrescriptionsProvider,
  useDraftPrescriptions,
  Icon,
  PatientInfo,
  PatientMedHistory,
  PickupPharmacySearch as PharmacySearch,
  PharmacySelect,
  RadioGroupCards,
  RecentOrders,
  SDKProvider,
  ScreeningAlerts,
  ScreeningAlertAcknowledgementDialog,
  SignatureAttestationModal,
  Spinner,
  Table,
  Text,
  Toaster,
  createQuery,
  formatDate,
  generateString,
  triggerToast,
  usePhotonClient,
  useRecentOrders,
  formatPrescriptionDetails,
  PrescribeProvider,
  GoogleServiceProvider,
  usePrescribe,
  useGoogleService,
  CALENDAR_DATE_FORMAT,
  PrescribeEventDispatchProvider,
  usePrescribeEventDispatch,
  dispatchAnalyticsEvent,
  buildFieldSnapshot,
  PATIENT_FORM_FIELDS
};

// Export types
export type {
  ScreeningAlertType,
  RoutingConstraint,
  TemplateOverrides,
  PrescriptionFormData,
  CoverageOption,
  TryCreatePrescriptionTemplateOptions,
  FormAnalyticsEventDetail,
  MilestoneType,
  FieldCompletionSnapshot
};
