import './index.css';
import AddressForm from './systems/AddressForm';
import { Alert } from './particles/Alert';
import Checkbox from './particles/Checkbox';
import DispenseUnitSelect from './particles/DispenseUnitSelect';
import Input from './particles/Input';
import type { ParsedAddress } from './particles/AddressAutocompleteInput';
import AddressAutocompleteInput from './particles/AddressAutocompleteInput';
import { InputGroup } from './particles/InputGroup';
import DateInput from './particles/DateInput';
import Select from './particles/Select';
import StateSelect from './particles/StateSelect';
import PhoneInput from './particles/PhoneInput';
import SexSelect, { SEX_OPTIONS } from './particles/SexSelect';
import GenderSelect, { GENDER_OPTIONS } from './particles/GenderSelect';
import Banner from './particles/Banner';
import DoseCalculator from './systems/DoseCalculator';
import Card from './particles/Card';
import Collapsible from './particles/Collapsible';
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
import type { PharmacyOption } from './systems/PharmacySearch/PharmacySearch';
import {
  PharmacySelect,
  PharmacySelectionProvider,
  usePharmacySelectionContext
} from './systems/PharmacySelect';
import Spinner from './particles/Spinner';
import RadioGroupCards from './particles/RadioGroupCards';
import { RecentOrders, useRecentOrders } from './systems/RecentOrders';
import Dialog from './particles/Dialog';
import Button from './particles/Button';
import SDKProvider, { usePhotonClient } from './systems/SDKProvider';
import SmartTooltip from './particles/SmartTooltip';
import Table from './particles/Table';
import Text from './particles/Text';
import Textarea from './particles/Textarea';
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
import { dispatchAnalyticsTrackEvent } from './analytics/dispatchAnalyticsTrackEvent';
import {
  buildFieldSnapshot,
  DRAFT_PRESCRIPTION_FORM_FIELDS,
  PATIENT_FORM_FIELDS
} from './analytics/buildFieldSnapshot';
import { PatientSelect } from './systems/PatientSelect';

export { usePhoton, PhotonClientStore, PhotonContext };

export {
  AddressForm,
  AddressAutocompleteInput,
  Alert,
  Banner,
  Checkbox,
  DispenseUnitSelect,
  Input,
  Select,
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
  Collapsible,
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
  SmartTooltip,
  Spinner,
  Table,
  Text,
  Textarea,
  Toaster,
  createQuery,
  formatDate,
  generateString,
  triggerToast,
  usePhotonClient,
  useRecentOrders,
  formatPrescriptionDetails,
  PrescribeProvider,
  PharmacySelectionProvider,
  GoogleServiceProvider,
  usePrescribe,
  usePharmacySelectionContext,
  useGoogleService,
  CALENDAR_DATE_FORMAT,
  PrescribeEventDispatchProvider,
  usePrescribeEventDispatch,
  dispatchAnalyticsTrackEvent,
  buildFieldSnapshot,
  PATIENT_FORM_FIELDS,
  DRAFT_PRESCRIPTION_FORM_FIELDS,
  PatientSelect
};

// Export types
export type {
  ParsedAddress,
  PharmacyOption,
  ScreeningAlertType,
  RoutingConstraint,
  TemplateOverrides,
  PrescriptionFormData,
  CoverageOption,
  TryCreatePrescriptionTemplateOptions
};
