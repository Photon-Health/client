import { useTranslation } from 'react-i18next';
import { Link, VStack, Text } from '@chakra-ui/react';
import React from 'react';
import { FulfillmentState } from 'packages/sdk/src/types';
import { ExtendedFulfillmentType } from '../utils/models';

export function useText() {
  const { t } = useTranslation();

  const pl = (isPlural: boolean, singular: string, plural: string) =>
    t(isPlural ? plural : singular);

  const text = {
    askForBestPrice: t('askForBestPrice'),
    bin: t('bin'),
    callPharmacy: t('callPharmacy'),
    closed: t('closed'),
    closingSoon: t('closingSoon'),
    contactSupport: t('contactSupport'),
    couponHelpsPayLess: t('couponHelpsPayLess'),
    couponWithInsurance: t('couponWithInsurance'),
    couponVsInsurance: t('couponVsInsurance'),
    changePharmacy: t('changePharmacy'),
    daysSupply: t('daysSupply'),
    delivered: t('delivered'),
    delivery: t('delivery'),
    directions: t('directions'),
    dismiss: t('dismiss'),
    enterLoc: t('enterLoc'),
    enterLocLong: t('enterLocLong'),
    errorMarkPickedUp: t('errorMarkPickedUp'),
    errorMarkDelivered: t('errorMarkDelivered'),
    expires: t('expires'),
    demoTitle: t('demoTitle'),
    fakeRx: t('fakeRx'),
    fakeRxs: t('fakeRxs'),
    findLoc: t('findLoc'),
    genericPriceDisclaimer: t('genericPriceDisclaimer'),
    getDelivered: t('getDelivered'),
    getNearby: t('getNearby'),
    gettingLoc: t('gettingLoc'),
    group: t('group'),
    help: t('help'),
    howDoIUseCouponCard: t('howDoIUseCouponCard'),
    howToCoupon: t('howToCoupon'),
    howToUseCouponCard: t('howToUseCouponCard'),
    inTransit: t('inTransit'),
    makePreferred: t('makePreferred'),
    memberId: t('memberId'),
    next: t('next'),
    noMatch: t('noMatch'),
    noMedicare: t('noMedicare'),
    open: t('open'),
    open24hrs: t('open24hrs'),
    orderCanceled: t('orderCanceled'),
    orderDelivered: t('orderDelivered'),
    orderInTransit: t('orderInTransit'),
    orderPickedUp: t('orderPickedUp'),
    orderPlaced: t('orderPlaced'),
    orderReady: t('orderReady'),
    orderWasPlaced: t('orderWasPlaced'),
    patient: t('patient'),
    pcn: t('pcn'),
    pickedUp: t('pickedUp'),
    pickUp: t('pickUp'),
    pickUpLabel: t('pickUpLabel'),
    pleaseRefresh: t('pleaseRefresh'),
    preferred: t('preferred'),
    preparing: t('preparing'),
    preparingDelivery: t('preparingDelivery'),
    preparingOrder: t('preparingOrder'),
    priceDifference: t('priceDifference'),
    pricesCanChange: t('pricesCanChange'),
    quantity: t('quantity'),
    questionVerb: t('questionVerb'),
    questionsPhoneNumber: t('questionsPhoneNumber'),
    reachOut: t('reachOut'),
    readyBy: t('readyBy'),
    readyPickUp: t('readyPickUp'),
    readyWhen: t('readyWhen'),
    receivedPreparing: t('receivedPreparing'),
    refills: t('refills'),
    searchPharmacy: t('searchPharmacy'),
    selectAPharmacy: t('selectAPharmacy'),
    selectPaymentMethod: t('selectPaymentMethod'),
    selectPharmacy: t('selectPharmacy'),
    placeOrder: t('placeOrder'),
    setLoc: t('setLoc'),
    setSearchLoc: t('setSearchLoc'),
    showThisCoupon: t('showThisCoupon'),
    showingLabel: t('showingLabel'),
    showMore: t('showMore'),
    thankYou: t('thankYou'),
    track: t('track'),
    tracking: t('tracking'),
    learnMore: t('learnMore'),
    useLoc: t('useLoc'),
    whatIsCouponPrice: t('whatIsCouponPrice'),
    whatPaymentMethod: t('whatPaymentMethod'),

    // Pharmacy / Status
    pharmacy: t('pharmacy'),
    needHelp: t('needHelp'),
    pharmacyIssue: t('pharmacyIssue'),
    holidayAlert: t('holidayAlert'),
    couponPrice: t('couponPrice'),
    retail: t('retail'),
    readyIn30: t('readyIn30'),
    availableInArea: t('availableInArea'),
    freeDelivery: t('freeDelivery'),
    inStock: t('inStock'),
    avgCopayPrice: t('avgCopayPrice'),
    asLowAs: t('asLowAs'),
    freeExpressDelivery: t('freeExpressDelivery'),
    currentPharmacy: t('currentPharmacy'),

    // Info page
    orderSent: t('orderSent'),
    yourOrderSentToPharmacy: t('yourOrderSentToPharmacy'),

    // Order Summary
    orderSummaryTitle: t('orderSummaryTitle'),
    viewDetails: t('viewDetails'),
    noReadyTime: t('noReadyTime'),
    shouldBeReady: t('shouldBeReady'),
    readyPrefix: t('readyPrefix'),
    readyToday: t('readyToday'),
    readyTomorrow: t('readyTomorrow'),
    stateDelayed: t('stateDelayed'),
    statePreparing: t('statePreparing'),
    stateReady: t('stateReady'),
    letUsKnow: t('letUsKnow'),
    saving: t('saving'),

    // Exception titles
    exTitle: {
      BACKORDERED: t('exTitle_BACKORDERED'),
      OOS: t('exTitle_OOS'),
      PA_REQUIRED: t('exTitle_PA_REQUIRED'),
      REFILL_TOO_SOON: t('exTitle_REFILL_TOO_SOON'),
      HIGH_COPAY: t('exTitle_HIGH_COPAY'),
      NOT_COVERED: t('exTitle_NOT_COVERED'),
      RX_CLARIFICATION: t('exTitle_RX_CLARIFICATION'),
      OTC: t('exTitle_OTC'),
      MEDICAL_DEVICE: t('exTitle_MEDICAL_DEVICE')
    } as Record<string, string>,

    // Exception messages
    exMsg: {
      OOS: (isReroutable: boolean) =>
        t(isReroutable ? 'exMsg_OOS_reroutable' : 'exMsg_OOS_notReroutable'),
      BACKORDERED: () => t('exMsg_BACKORDERED'),
      PA_REQUIRED: (customMsg?: string | null) => customMsg?.trim() || t('exMsg_PA_REQUIRED'),
      REFILL_TOO_SOON: () => t('exMsg_REFILL_TOO_SOON'),
      NOT_COVERED: () => t('exMsg_NOT_COVERED'),
      HIGH_COPAY: () => t('exMsg_HIGH_COPAY'),
      RX_CLARIFICATION: () => t('exMsg_RX_CLARIFICATION'),
      OTC: () => t('exMsg_OTC'),
      MEDICAL_DEVICE: () => t('exMsg_MEDICAL_DEVICE')
    },

    // FAQ
    faqTitle: t('faqTitle'),
    faqStillNeedHelp: t('faqStillNeedHelp'),
    faqSupportText: t('faqSupportText'),
    faqMessageSupport: t('faqMessageSupport'),
    faqFeatureUnavailable: t('faqFeatureUnavailable'),
    faqSupportDisabled: t('faqSupportDisabled'),

    // Toast messages
    toastUnableChange: t('toastUnableChange'),
    toastAlreadyProcessing: t('toastAlreadyProcessing'),
    toastUnableSubmit: t('toastUnableSubmit'),
    toastInvalidLocation: t('toastInvalidLocation'),
    toastUpdateLocation: t('toastUpdateLocation'),
    toastSetPreferred: t('toastSetPreferred'),
    toastUnableSetPreferred: t('toastUnableSetPreferred'),
    toastNoPharmaciesNear: t('toastNoPharmaciesNear'),
    toastUnableGetPharmacies: t('toastUnableGetPharmacies'),

    // Pharmacy page inline
    couponGeneratedAfterSelect: t('couponGeneratedAfterSelect'),
    moreInfo: t('moreInfo'),
    dontSeePharmacy: t('dontSeePharmacy'),
    seeAllMailOrders: t('seeAllMailOrders'),

    // ReadyBy display labels
    readyByUrgentLabel: t('readyByUrgentLabel'),
    readyByAfterHoursLabel: t('readyByAfterHoursLabel'),

    // ReadyText
    readyAt: t('readyAt'),
    tomorrowAt: t('tomorrowAt'),
    needOrderPre: t('needOrderPre'),
    asap: t('asap'),
    thisEvening: t('thisEvening'),
    tomorrowEvening: t('tomorrowEvening'),
    needOrderByPre: t('needOrderByPre'),

    // Header status headings
    headerCantProcess: t('headerCantProcess'),
    headerOrderPlaced: t('headerOrderPlaced'),
    headerOrderError: t('headerOrderError'),
    headerOrderIssue: t('headerOrderIssue'),
    headerOrderTransferred: t('headerOrderTransferred'),
    headerOrderDelayed: t('headerOrderDelayed'),
    headerPreparingOrder: t('headerPreparingOrder'),
    headerOrderComplete: t('headerOrderComplete'),
    headerOrderLikelyReady: t('headerOrderLikelyReady'),
    headerOrderDelivered: t('headerOrderDelivered'),
    headerOrderInTransit: t('headerOrderInTransit'),

    // Header subheadings
    subPleaseReview: t('subPleaseReview'),
    subPharmacyUnreachable: t('subPharmacyUnreachable'),
    subPharmacyClosed: t('subPharmacyClosed'),
    subOrderError: t('subOrderError'),
    subDemographicMismatch: t('subDemographicMismatch'),
    subExternalTransfer: t('subExternalTransfer'),
    subDoctorNotLicensed: t('subDoctorNotLicensed'),
    subMailOrderSent: t('subMailOrderSent'),
    subConfirmingOrder: t('subConfirmingOrder'),
    subEstimateReady: t('subEstimateReady'),
    subOutForDelivery: t('subOutForDelivery'),
    subPharmacyReceived: t('subPharmacyReceived'),
    subPrescriptionsReady: t('subPrescriptionsReady'),
    requestedPickup: t('requestedPickup'),
    urgentReadyBy: t('urgentReadyBy'),
    tomorrowAtPrefix: t('tomorrowAtPrefix'),

    // PrescriptionsList
    orderDetails: t('orderDetails'),
    showLess: t('showLess'),
    showMoreDetails: t('showMoreDetails'),

    // EmbeddedCouponCard
    retailPriceLabel: t('retailPriceLabel'),

    // MailOrderSelectModal
    mailOrderPharmacies: t('mailOrderPharmacies'),
    cantFindPharmacy: t('cantFindPharmacy'),

    // OfferInfo
    sponsored: t('sponsored'),
    sponsoredTooltip: t('sponsoredTooltip'),

    // Plural functions
    notifyPickUp: (isPlural: boolean) =>
      pl(isPlural, 'notifyPickUp_singular', 'notifyPickUp_plural'),
    outForDelivery: (isPlural: boolean) =>
      pl(isPlural, 'outForDelivery_singular', 'outForDelivery_plural'),
    pickedUpRx: (isPlural: boolean) => pl(isPlural, 'pickedUpRx_singular', 'pickedUpRx_plural'),
    pleaseReview: (isPlural: boolean) =>
      pl(isPlural, 'pleaseReview_singular', 'pleaseReview_plural'),
    preparingPickUp: (isPlural: boolean) =>
      pl(isPlural, 'preparingPickUp_singular', 'preparingPickUp_plural'),
    preparingRxDelivery: (isPlural: boolean) =>
      pl(isPlural, 'preparingRxDelivery_singular', 'preparingRxDelivery_plural'),
    preparingTextUs: (isPlural: boolean) =>
      pl(isPlural, 'preparingTextUs_singular', 'preparingTextUs_plural'),
    readyBySelected: (isPlural: boolean) =>
      pl(isPlural, 'readyBySelected_singular', 'readyBySelected_plural'),
    receivedRx: (isPlural: boolean) => pl(isPlural, 'receivedRx_singular', 'receivedRx_plural'),
    reviewRx: (isPlural: boolean) => pl(isPlural, 'reviewRx_singular', 'reviewRx_plural'),
    reviewYourRx: (isPlural: boolean) =>
      pl(isPlural, 'reviewYourRx_singular', 'reviewYourRx_plural'),
    rxDelivered: (isPlural: boolean) => pl(isPlural, 'rxDelivered_singular', 'rxDelivered_plural'),
    rxInTransit: (isPlural: boolean) => pl(isPlural, 'rxInTransit_singular', 'rxInTransit_plural'),
    rxPickedUpTextUs: (isPlural: boolean) =>
      pl(isPlural, 'rxPickedUpTextUs_singular', 'rxPickedUpTextUs_plural'),
    rxPickUp: (isPlural: boolean) => pl(isPlural, 'rxPickUp_singular', 'rxPickUp_plural'),
    rxReadyNotify: (isPlural: boolean) =>
      pl(isPlural, 'rxReadyNotify_singular', 'rxReadyNotify_plural'),
    sendToNew: (isPlural: boolean, pharmacyName: string) =>
      t(isPlural ? 'sendToNew_plural' : 'sendToNew_singular', { pharmacyName }),
    sendToSelected: (isPlural: boolean) =>
      pl(isPlural, 'sendToSelected_singular', 'sendToSelected_plural'),
    sent: (isPlural: boolean) => pl(isPlural, 'sent_singular', 'sent_plural'),
    sentWithOrderSms: (isPlural: boolean) =>
      pl(isPlural, 'sentWithOrderSms_singular', 'sentWithOrderSms_plural'),
    sentWithSms: (isPlural: boolean) => pl(isPlural, 'sentWithSms_singular', 'sentWithSms_plural'),
    showCouponToPharmacy: (isPlural: boolean) =>
      pl(isPlural, 'showCouponToPharmacy_singular', 'showCouponToPharmacy_plural'),
    weSent: (isPlural: boolean) => pl(isPlural, 'weSent_singular', 'weSent_plural'),
    shipTo: (address: string) => t('shipTo', { address }),

    // JSX elements
    selectCashPrice: (
      <>
        {t('selectCashPrice_pre')} <b>{t('cashPrice')}</b> {t('selectCashPrice_mid')}{' '}
        <b>{t('insuranceCopay')}</b> {t('selectCashPrice_post')}
      </>
    ),
    usingWithInsurance: (
      <>
        {t('usingWithInsurance_pre')} <b>{t('instead')}</b> {t('usingWithInsurance_post')}
      </>
    ),
    showDiscountCardPrices: () => (
      <VStack align="flex-start" spacing={0}>
        <Text fontWeight="semibold">{t('showDiscountCardPrices_main')}</Text>
        <Text fontSize="sm">{t('showDiscountCardPrices_sub')}</Text>
      </VStack>
    ),

    // Payment method options
    paymentMethodOptions: [
      {
        label: t('paymentInsuranceLabel'),
        description: t('paymentInsuranceDesc')
      },
      {
        label: t('payCashLabel'),
        description: t('payCashDesc')
      }
    ],

    // ReadyBy options — time labels are intentionally kept in English as they serve as identifiers
    readyByOptions: {
      Today: [
        {
          label: '10:00 am',
          description: t('readyByBusy'),
          icon: false,
          badge: true,
          badgeColor: 'gray'
        },
        {
          label: '12:00 pm',
          description: t('readyByLunch'),
          icon: false,
          badge: true,
          badgeColor: 'red'
        },
        { label: '2:00 pm', description: null, icon: false, badge: false, badgeColor: null },
        { label: '4:00 pm', description: null, icon: false, badge: false, badgeColor: null },
        { label: '6:00 pm', description: null, icon: false, badge: false, badgeColor: null },
        {
          label: 'After hours',
          displayLabel: t('readyByAfterHoursLabel'),
          description: null,
          icon: false,
          badge: false,
          badgeColor: null
        },
        {
          label: 'Urgent',
          displayLabel: t('readyByUrgentLabel'),
          description: t('readyByUrgentDesc'),
          icon: true
        }
      ],
      Tomorrow: [
        {
          label: '10:00 am',
          description: t('readyByBusy'),
          icon: false,
          badge: true,
          badgeColor: 'gray'
        },
        {
          label: '12:00 pm',
          description: t('readyByLunch'),
          icon: false,
          badge: true,
          badgeColor: 'red'
        },
        { label: '2:00 pm', description: null, icon: false, badge: false, badgeColor: null },
        { label: '4:00 pm', description: null, icon: false, badge: false, badgeColor: null },
        { label: '6:00 pm', description: null, icon: false, badge: false, badgeColor: null },
        {
          label: 'After hours',
          displayLabel: t('readyByAfterHoursLabel'),
          description: null,
          icon: false,
          badge: false,
          badgeColor: null
        }
      ]
    },

    // Day labels for UI display (separate from the keys used for readyByOptions lookup)
    readyByDayLabel: (day: 'Today' | 'Tomorrow') =>
      t(day === 'Today' ? 'readyByToday' : 'readyByTomorrow')
  };

  return text;
}

export function useOrderStateMapping() {
  const t = useText();

  const PhoneLink = () => {
    const cleanedPhoneNumber = t.questionsPhoneNumber.replace(/[\s()-]/g, '');
    return (
      <Link
        color="link"
        fontWeight="medium"
        textDecoration="underline"
        href={`sms:${cleanedPhoneNumber}`}
      >
        {t.questionsPhoneNumber}
      </Link>
    );
  };

  const errorDesc = (
    <>
      {t.questionVerb}
      <PhoneLink />
    </>
  );

  return {
    PICK_UP: {
      SENT: {
        heading: t.orderWasPlaced,
        subheading: (isPlural: boolean) => t.sentWithSms(isPlural),
        status: t.orderPlaced,
        description: (isPlural: boolean) => t.sent(isPlural),
        cta: (isPlural: boolean) => t.pickedUpRx(isPlural)
      },
      RECEIVED: {
        heading: t.preparingOrder,
        subheading: (isPlural: boolean) => t.preparingTextUs(isPlural),
        status: t.preparing,
        description: (isPlural: boolean) => t.preparingPickUp(isPlural),
        cta: (isPlural: boolean) => t.pickedUpRx(isPlural)
      },
      READY: {
        heading: t.orderReady,
        subheading: (isPlural: boolean) => t.rxReadyNotify(isPlural),
        status: t.readyPickUp,
        description: (isPlural: boolean) => t.rxPickUp(isPlural),
        cta: (isPlural: boolean) => t.pickedUpRx(isPlural)
      },
      PICKED_UP: {
        heading: t.orderPickedUp,
        subheading: (isPlural: boolean) => t.rxPickedUpTextUs(isPlural),
        status: t.pickedUp,
        description: (isPlural: boolean) => t.notifyPickUp(isPlural),
        cta: (isPlural: boolean) => t.pickedUpRx(isPlural)
      },
      error: { title: t.errorMarkPickedUp, description: errorDesc }
    },
    COURIER: {
      SENT: {
        heading: t.orderWasPlaced,
        subheading: (isPlural: boolean) => t.weSent(isPlural),
        status: t.orderPlaced,
        description: (isPlural: boolean) => t.sent(isPlural),
        cta: (isPlural: boolean) => t.receivedRx(isPlural)
      },
      RECEIVED: {
        heading: t.preparingOrder,
        subheading: (isPlural: boolean) => t.sentWithOrderSms(isPlural),
        status: t.preparing,
        description: (isPlural: boolean) => t.preparingRxDelivery(isPlural),
        cta: (isPlural: boolean) => t.receivedRx(isPlural)
      },
      READY: {
        heading: t.orderInTransit,
        subheading: (isPlural: boolean) => t.sentWithOrderSms(isPlural),
        status: t.inTransit,
        description: (isPlural: boolean) => t.rxInTransit(isPlural),
        cta: (isPlural: boolean) => t.receivedRx(isPlural)
      },
      PICKED_UP: {
        heading: t.orderDelivered,
        subheading: (isPlural: boolean) => t.sentWithOrderSms(isPlural),
        status: t.delivered,
        description: (isPlural: boolean) => t.rxDelivered(isPlural),
        cta: (isPlural: boolean) => t.receivedRx(isPlural)
      },
      error: { title: t.errorMarkDelivered, description: errorDesc }
    },
    MAIL_ORDER: {
      SENT: {
        heading: t.orderWasPlaced,
        subheading: (isPlural: boolean) => t.weSent(isPlural),
        status: t.orderPlaced,
        description: (isPlural: boolean) => t.sent(isPlural),
        cta: (isPlural: boolean) => t.receivedRx(isPlural)
      },
      FILLING: {
        heading: t.preparingOrder,
        subheading: t.preparingDelivery,
        status: t.preparing,
        description: (isPlural: boolean) => t.preparingRxDelivery(isPlural),
        cta: (isPlural: boolean) => t.receivedRx(isPlural)
      },
      SHIPPED: {
        heading: t.orderInTransit,
        subheading: (isPlural: boolean) => t.outForDelivery(isPlural),
        status: t.inTransit,
        description: (isPlural: boolean) => t.rxInTransit(isPlural),
        cta: (isPlural: boolean) => t.receivedRx(isPlural)
      },
      DELIVERED: {
        heading: t.orderDelivered,
        subheading: () => '',
        status: t.delivered,
        description: (isPlural: boolean) => t.rxDelivered(isPlural),
        cta: (isPlural: boolean) => t.receivedRx(isPlural)
      },
      error: { title: t.errorMarkDelivered, description: errorDesc }
    }
  } as {
    [FT in ExtendedFulfillmentType]: Partial<{
      [State in FulfillmentState]: {
        heading: string;
        subheading: string | ((isPlural: boolean) => string);
        status: string;
        description: (pl: boolean) => string;
        cta: (pl: boolean) => string;
      };
    }> & { error: { title: string; description: React.ReactNode } };
  };
}

export function useFaqQuestions() {
  const { t } = useTranslation();

  return [
    {
      question: t('faqQ1'),
      answer: (
        <>
          {t('faqA1_pre')}{' '}
          <Link href="sms:513-866-3212" color="link">
            513-866-3212
          </Link>{' '}
          {t('faqA1_post')}
        </>
      )
    },
    { question: t('faqQ2'), answer: <>{t('faqA2')}</> },
    { question: t('faqQ3'), answer: <>{t('faqA3')}</> },
    { question: t('faqQ4'), answer: <>{t('faqA4')}</> },
    { question: t('faqQ5'), answer: <>{t('faqA5')}</> }
  ];
}
