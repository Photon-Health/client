import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Alert, Button, EmptyState, PharmacyCard } from '@photon-health/ui';
import { Body, Heading, Muted, Page, Progress, StepLabel, TopBar } from '../components/Layout';
import { cardDeliveryPromise, cardPrices, cardTags } from '../components/pharmacyCardProps';
import { cardAddress, cardHours } from '../components/pharmacyDetails';
import { createDraftOrder, setOrderPharmacy } from '../api/order';
import { useIntake } from '../state/IntakeContext';

const PAGE_SIZE = 10;

export const PharmacySelect = () => {
  const {
    flow,
    patient,
    prescriptionId,
    postalCode,
    orderId,
    pharmacies,
    setDraft,
    setPharmacyName
  } = useIntake();

  // The address on file wins; the zip screen fills the gap when there is none.
  const origin = patient?.address?.postalCode ?? postalCode;
  const navigate = useNavigate();

  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // A fresh candidate list starts closed again rather than mid-page.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [pharmacies]);

  useEffect(() => {
    if (!patient || !prescriptionId || !origin || orderId) return;
    let cancelled = false;

    setLoading(true);
    createDraftOrder({
      patientId: patient.id,
      prescriptionId,
      origin: { postalCode: origin }
    })
      .then((draft) => {
        if (!cancelled) setDraft(draft);
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : 'Could not load pharmacies.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // setDraft is recreated on every state change; depending on it would re-run the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, prescriptionId, origin, orderId]);

  if (!patient || !prescriptionId) {
    return <Navigate to={`/start/${flow.slug}/verify`} replace />;
  }

  // Landing here without an origin means the zip screen was skipped.
  if (!origin) {
    return <Navigate to={`/start/${flow.slug}/location`} replace />;
  }

  const submit = async (pharmacyId: string) => {
    if (!orderId || submitting) return;
    setSubmitting(true);
    setError(undefined);
    try {
      const result = await setOrderPharmacy({ orderId, pharmacyId });
      setPharmacyName(result.pharmacyName);
      navigate(`/start/${flow.slug}/submitted`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <TopBar onBack={() => navigate(-1)} />
      <Progress step="pharmacy" />
      <StepLabel step="pharmacy" label="Pharmacy" />
      <Heading>Where should we send it if approved?</Heading>

      {loading ? <Body>Finding pharmacies near you…</Body> : null}
      {error ? <Alert tone="critical" title={error} /> : null}

      {!loading && !error && pharmacies.length === 0 ? (
        <EmptyState
          title="No pharmacies nearby"
          description="No pharmacies came back for that area."
        />
      ) : null}

      {/* The card's own model: collapsed compares, expanded decides and is the
          only state with a send button. It takes no onClick or className, so a
          collapsed card is wrapped in a button to become the tap target —
          which also gives focus and Enter/Space without hand-rolling them.
          Safe only because a collapsed card holds nothing interactive: these
          prices are all `kind: 'price'`, never an action row. */}
      {pharmacies.slice(0, visibleCount).map((pharmacy) => {
        // deliveryPromise only renders on the delivery variant, so the two
        // props move together or the promise is silently dropped. address and
        // hours are the pickup variant's equivalent — the card drops them when
        // a delivery promise is present.
        const promise = cardDeliveryPromise(pharmacy);
        const shared = {
          name: pharmacy.name,
          eyebrow: pharmacy.reason ?? undefined,
          address: cardAddress(pharmacy),
          hours: cardHours(pharmacy),
          tags: cardTags(pharmacy),
          prices: cardPrices(pharmacy),
          deliveryPromise: promise,
          fulfilment: promise ? ('delivery' as const) : ('pickup' as const)
        };

        return openId === pharmacy.id ? (
          <PharmacyCard
            key={pharmacy.id}
            {...shared}
            expanded
            onSend={() => submit(pharmacy.id)}
            sendLabel={submitting ? 'Sending…' : `Send to ${pharmacy.name}`}
          />
        ) : (
          <button
            type="button"
            key={pharmacy.id}
            className="intake__card-button"
            aria-expanded={false}
            onClick={() => setOpenId(pharmacy.id)}
          >
            <PharmacyCard {...shared} />
          </button>
        );
      })}

      {visibleCount < pharmacies.length ? (
        <Button variant="ghost" onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}>
          Show more pharmacies
        </Button>
      ) : null}

      <Muted center>You won’t be charged unless a provider approves.</Muted>
    </Page>
  );
};
