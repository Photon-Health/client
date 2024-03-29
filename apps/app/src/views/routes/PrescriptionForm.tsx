import { MutableRefObject, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePhoton } from '@photonhealth/react';
import { getSettings } from '@client/settings';
import { datadogRum } from '@datadog/browser-rum';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-multirx-form-wrapper': unknown;
    }
  }
}

export const PrescriptionForm = () => {
  const ref: MutableRefObject<any> = useRef();
  const { user } = usePhoton();
  const [params] = useSearchParams();
  const patientId = params.get('patientId') || '';
  const templateIds = params.get('templateIds') || '';
  const prescriptionIds = params.get('prescriptionIds') || '';
  const weight = params.get('weight') || '';
  const weightUnit = params.get('weightUnit') || 'lbs';

  const navigate = useNavigate();
  const onClose = () => {
    navigate('/prescriptions');
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('photon-prescriptions-created', (e: any) => {
        if (!e.detail.createOrder) {
          onClose();
        }
        if (e.detail.createOrder) {
          const searchParams = new URLSearchParams();
          searchParams.append('patientId', e.detail.patientId);
          searchParams.append('prescriptionIds', e.detail.prescriptionIds.join(','));
          navigate({
            pathname: '/orders/new',
            search: searchParams.toString()
          });
        }
      });
      ref.current.addEventListener(
        'photon-order-created',
        (e: { detail: { order: { id: string } } }) => {
          const searchParams = new URLSearchParams();
          if (!e?.detail?.order) {
            return onClose();
          }

          navigate({
            pathname: `/orders/${e.detail.order.id}`,
            search: searchParams.toString()
          });
        }
      );
      ref.current.addEventListener('photon-prescriptions-closed', () => {
        onClose();
      });
      ref.current.addEventListener(
        'photon-order-combined',
        (e: { detail: { order: { id: string } } }) => {
          navigate(`/orders/${e.detail.order.id}`);
        }
      );
      ref.current.addEventListener(
        'photon-datadog-action',
        (e: {
          detail: {
            action: string;
            data: {
              [key: string]: unknown;
            };
          };
        }) => {
          datadogRum.addAction(e.detail.action, e.detail.data);
        }
      );
    }
  }, [ref.current]);

  useEffect(() => {
    if (patientId && ref.current) {
      ref.current.patientId = patientId;
    }
  }, [ref.current, patientId]);

  const orgSettings = getSettings(user?.org_id);
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'white',
        width: '100%',
        zIndex: 15
      }}
    >
      {user?.org_id ? (
        <photon-multirx-form-wrapper
          ref={ref}
          template-ids={templateIds}
          patient-id={patientId}
          prescription-ids={prescriptionIds}
          weight={weight}
          weight-unit={weightUnit}
          enable-order={orgSettings?.enableRxAndOrder ?? true}
          enable-med-history={orgSettings?.enableMedHistory ?? false}
          enable-local-pickup={orgSettings?.pickUp ?? false}
          enable-send-to-patient={orgSettings?.sendToPatient ?? false}
          enable-combine-and-duplicate={orgSettings?.enableCombineAndDuplicate ?? false}
          mail-order-ids={orgSettings?.mailOrderProviders?.join(',') ?? ''}
          toast-buffer={70}
          hide-templates={orgSettings?.hideTemplates ?? false}
        />
      ) : null}
    </div>
  );
};
