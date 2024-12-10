import { Link } from '@chakra-ui/react';
import { FulfillmentState } from 'packages/sdk/src/types';
import React, { ReactNode } from 'react';
import { ExtendedFulfillmentType } from './models';

export const text = {
  askForBestPrice: 'Ask your pharmacist to help you find the best possible price.',
  bin: 'BIN',
  callPharmacy: 'Call pharmacy',
  closed: 'Closed',
  closingSoon: 'Closing soon',
  contactSupport: 'Contact Support',
  couponHelpsPayLess:
    'The coupon price helps you pay less than the retail price for your prescription. It’s free to use. Just show it to the pharmacist when you pick up your prescription.',
  couponWithInsurance: 'Can I use this coupon if I have health insurance?',
  couponVsInsurance:
    'The price on the coupon may be lower than your health insurance co-pay. It can be used instead of your co-pay and does not apply to your deductible.',
  changePharmacy: 'Change pharmacy',
  daysSupply: 'Days supply',
  delivered: 'Delivered',
  delivery: 'Local Delivery',
  directions: 'Get directions',
  dismiss: 'Dismiss',
  enterLoc: 'Enter a zipcode or address',
  enterLocLong: "Enter the zipcode or address where you'd like to search for a pharmacy.",
  errorMarkPickedUp: 'Unable to mark order as picked up',
  errorMarkDelivered: 'Unable to mark order as delivered',
  expires: 'Expires',
  fakeRx: 'This is not a real prescription.',
  fakeRxs: 'These are not real prescriptions.',
  findLoc: 'Find a location',
  genericPriceDisclaimer: 'This price is for generic medication only',
  getDelivered: 'Get your medication delivered to your door',
  getNearby: 'Get your medication at a nearby pharmacy',
  gettingLoc: 'Getting current location',
  group: 'Group',
  howToCoupon: 'How to use this coupon',
  inTransit: 'In transit',
  makePreferred: 'Make this my preferred pharmacy',
  memberId: 'Member ID',
  next: 'Next',
  noMatch: "We couldn't find what you're looking for.",
  notifyPickUp: (isPlural: boolean) =>
    `Please notify us below when you’ve picked up your ${
      isPlural ? 'prescriptions' : 'prescription'
    }.`,
  open: 'Open',
  open24hrs: 'Open 24 hours',
  orderCanceled: 'This order was canceled.',
  orderDelivered: 'Your order was delivered',
  orderInTransit: 'Your order is in transit',
  orderPickedUp: 'Your order was picked up',
  orderPlaced: 'Placed',
  orderReady: 'Your order is ready',
  orderWasPlaced: 'Your order has been placed',
  outForDelivery: (isPlural: boolean) =>
    `Your order is out for delivery. Please notify us below when you’ve received your ${
      isPlural ? 'prescriptions' : 'prescription'
    }.`,
  patient: 'Patient',
  selectPaymentMethod: 'Select a payment method',
  paymentMethodOptions: [
    {
      label: 'Insurance Copay',
      description: 'Use your insurance card to pay your regular prescription copay'
    },
    {
      label: 'Cash Price',
      description: 'Pay without insurance using a discount card – my be cheaper than your copay'
    }
  ],
  pcn: 'PCN',
  pickedUp: 'Picked up',
  pickedUpRx: (isPlural: boolean) =>
    `I picked up my ${isPlural ? 'prescriptions' : 'prescription'}`,
  pickUp: 'Pick Up',
  pickUpLabel: 'Pick Up:',
  pleaseReview: (isPlural: boolean) =>
    `Please review the ${
      isPlural ? 'prescriptions' : 'prescription'
    } before you select a pharmacy. Reach out to your provider for any issues.`,
  pleaseRefresh: 'Please refresh and try again',
  preferred: 'Preferred',
  preparing: 'Preparing',
  preparingDelivery: 'The pharmacy is preparing your order for delivery.',
  preparingOrder: 'Preparing your order',
  preparingPickUp: (isPlural: boolean) =>
    `The pharmacy is preparing your ${isPlural ? 'prescriptions' : 'prescription'} for pick up.`,
  preparingRxDelivery: (isPlural: boolean) =>
    `The pharmacy is preparing your ${isPlural ? 'prescriptions' : 'prescription'} for delivery.`,
  preparingTextUs: (isPlural: boolean) =>
    `The pharmacy is preparing your ${isPlural ? 'prescriptions' : 'prescription'} for pick up.`,
  quantity: 'Quantity',
  questionVerb: 'If you have any questions, please text us at ',
  questionsPhoneNumber: '+1 (513) 866 3212',
  reachOut: (
    <>
      If you have any questions, please <PhoneLink>text us</PhoneLink> or reach out to your provider
    </>
  ),
  readyBy: 'Ready by',
  readyByOptions: {
    Today: [
      {
        label: '10:00 am',
        description: 'Pharmacies may be busy',
        icon: false,
        badge: true,
        badgeColor: 'gray'
      },
      {
        label: '12:00 pm',
        description: 'May be affected by lunch hours',
        icon: false,
        badge: true,
        badgeColor: 'red'
      },
      { label: '2:00 pm', description: null, icon: false, badge: false, badgeColor: null },
      { label: '4:00 pm', description: null, icon: false, badge: false, badgeColor: null },
      { label: '6:00 pm', description: null, icon: false, badge: false, badgeColor: null },
      { label: 'After hours', description: null, icon: false, badge: false, badgeColor: null },
      {
        label: 'Urgent',
        description: 'Need to pickup ASAP',
        icon: true
      }
    ],
    Tomorrow: [
      {
        label: '10:00 am',
        description: 'Pharmacies may be busy',
        icon: false,
        badge: true,
        badgeColor: 'gray'
      },
      {
        label: '12:00 pm',
        description: 'May be affected by lunch hours',
        icon: false,
        badge: true,
        badgeColor: 'red'
      },
      { label: '2:00 pm', description: null, icon: false, badge: false, badgeColor: null },
      { label: '4:00 pm', description: null, icon: false, badge: false, badgeColor: null },
      { label: '6:00 pm', description: null, icon: false, badge: false, badgeColor: null },
      { label: 'After hours', description: null, icon: false, badge: false, badgeColor: null }
    ]
  },
  readyBySelected: (isPlural: boolean) =>
    `Please select a time below. We'll do our best to ensure your ${
      isPlural ? 'prescriptions are' : 'prescription is'
    } ready by your selected time.`,
  readyPickUp: 'Ready',
  readyWhen: 'When do you need your order ready by?',
  receivedPreparing: 'The pharmacy has received your order and is preparing it.',
  receivedRx: (isPlural: boolean) => `I received my ${isPlural ? 'prescriptions' : 'prescription'}`,
  refills: 'Refills',
  reviewRx: (isPlural: boolean) => `Review ${isPlural ? 'prescriptions' : 'prescription'}`,
  reviewYourRx: (isPlural: boolean) => `Review your ${isPlural ? 'prescriptions' : 'prescription'}`,
  rxDelivered: (isPlural: boolean) =>
    `Your ${isPlural ? 'prescriptions have' : 'prescription has'} arrived at ${
      isPlural ? 'their' : 'its'
    } destination.`,
  rxInTransit: (isPlural: boolean) =>
    `Your ${isPlural ? 'prescriptions are on their' : 'prescription is on its'} way to `,
  rxPickedUpTextUs: (isPlural: boolean) =>
    `Your ${isPlural ? 'prescriptions were' : 'prescription was'} picked up.`,
  rxPickUp: (isPlural: boolean) =>
    `Your ${isPlural ? 'prescriptions are' : 'prescription is'} ready to be picked up.`,
  rxReadyNotify: (isPlural: boolean) =>
    `Your ${
      isPlural ? 'prescriptions are' : 'prescription is'
    } ready to be picked up. Please notify us below when you’ve picked up your ${
      isPlural ? 'prescriptions' : 'prescription'
    }.`,
  searchPharmacy: 'Search for a pharmacy',
  selectAPharmacy: 'Select a pharmacy',
  selectCashPrice:
    'Select "Cash Price" to view potential savings with a discount card, or use insurance to get your copay price at the pharmacy. You can toggle this at any time.',
  selectPharmacy: 'Select pharmacy',
  sendToNew: (isPlural: boolean, originalPharmacyName: string) =>
    `We'll cancel your ${
      isPlural ? 'prescriptions' : 'prescription'
    } at ${originalPharmacyName} and send ${
      isPlural ? 'them' : 'it'
    } to your new pharmacy to be filled.`,
  sendToSelected: (isPlural: boolean) =>
    `We'll send your ${
      isPlural ? 'prescriptions' : 'prescription'
    } to your selected pharmacy to be filled.`,
  sent: (isPlural: boolean) =>
    `Your ${isPlural ? 'prescriptions were' : 'prescription was'} sent to the pharmacy.`,
  sentWithOrderSms: (isPlural: boolean) =>
    `We sent your ${
      isPlural ? 'prescriptions' : 'prescription'
    } to your selected pharmacy. We’ll text you updates on your order status.`,
  sentWithSms: (isPlural: boolean) =>
    `Your ${
      isPlural ? 'prescriptions were' : 'prescription was'
    } sent to the pharmacy. We’ll text you to let you know when ${
      isPlural ? "they're" : "it's"
    } ready.`,
  setLoc: 'Set location',
  setSearchLoc: 'Set search location',
  shipTo: (deliveryAddress: string) => `Ship to ${deliveryAddress}`,
  showThisCoupon: 'You must show this coupon at the pharmacy to get this discounted price',
  showCouponToPharmacy: (isPlural: boolean) =>
    `Just show it to the pharmacist when you pick up your ${
      isPlural ? 'prescriptions' : 'prescription'
    } so you won’t have to pay more than the coupon price.`,
  showingLabel: 'Showing pharmacies near',
  showMore: 'Show more pharmacies',
  thankYou: 'Thank you!',
  track: 'Track your order',
  tracking: 'Tracking #:',
  tryPhoton: 'Try Photon',
  useLoc: 'Use my current location',
  weSent: (isPlural: boolean) =>
    `We sent your ${isPlural ? 'prescriptions' : 'prescription'} to the pharmacy.`,
  whatIsCouponPrice: 'What is the coupon price?',
  whatPaymentMethod: 'How would you like to pay at the pharmacy?'
};

export function PhoneLink({ children }: { children?: React.ReactNode }): React.ReactElement {
  const cleanedPhoneNumber = text.questionsPhoneNumber.replace(/[\s()-]/g, '');
  return (
    <Link
      color="link"
      fontWeight="medium"
      textDecoration="underline"
      href={`sms:${cleanedPhoneNumber}`}
    >
      {children || text.questionsPhoneNumber}
    </Link>
  );
}

export const orderStateMapping: {
  [FT in ExtendedFulfillmentType]: Partial<{
    [State in FulfillmentState]: {
      heading: string;
      subheading: string | ((isPlural: boolean) => string);
      status: string;
      description: (pl: boolean) => string;
      cta: (pl: boolean) => string;
    };
  }> & { error: { title: string; description: ReactNode } };
} = {
  PICK_UP: {
    SENT: {
      heading: text.orderWasPlaced,
      subheading: (isPlural: boolean) => text.sentWithSms(isPlural),
      status: text.orderPlaced,
      description: (isPlural: boolean) => text.sent(isPlural),
      cta: (isPlural: boolean) => text.pickedUpRx(isPlural)
    },
    RECEIVED: {
      heading: text.preparingOrder,
      subheading: (isPlural: boolean) => text.preparingTextUs(isPlural),
      status: text.preparing,
      description: (isPlural: boolean) => text.preparingPickUp(isPlural),
      cta: (isPlural: boolean) => text.pickedUpRx(isPlural)
    },
    READY: {
      heading: text.orderReady,
      subheading: (isPlural: boolean) => text.rxReadyNotify(isPlural),
      status: text.readyPickUp,
      description: (isPlural: boolean) => text.rxPickUp(isPlural),
      cta: (isPlural: boolean) => text.pickedUpRx(isPlural)
    },
    PICKED_UP: {
      heading: text.orderPickedUp,
      subheading: (isPlural: boolean) => text.rxPickedUpTextUs(isPlural),
      status: text.pickedUp,
      description: (isPlural: boolean) => text.notifyPickUp(isPlural),
      cta: (isPlural: boolean) => text.pickedUpRx(isPlural)
    },
    error: {
      title: text.errorMarkPickedUp,
      description: (
        <>
          {text.questionVerb}
          <PhoneLink />
        </>
      )
    }
  },
  COURIER: {
    SENT: {
      heading: text.orderWasPlaced,
      subheading: (isPlural: boolean) => text.weSent(isPlural),
      status: text.orderPlaced,
      description: (isPlural: boolean) => text.sent(isPlural),
      cta: (isPlural: boolean) => text.receivedRx(isPlural)
    },
    RECEIVED: {
      heading: text.preparingOrder,
      subheading: (isPlural: boolean) => text.sentWithOrderSms(isPlural),
      status: text.preparing,
      description: (isPlural: boolean) => text.preparingRxDelivery(isPlural),
      cta: (isPlural: boolean) => text.receivedRx(isPlural)
    },
    READY: {
      heading: text.orderInTransit,
      subheading: (isPlural: boolean) => text.sentWithOrderSms(isPlural),
      status: text.inTransit,
      description: (isPlural: boolean) => text.rxInTransit(isPlural),
      cta: (isPlural: boolean) => text.receivedRx(isPlural)
    },
    PICKED_UP: {
      heading: text.orderDelivered,
      subheading: (isPlural: boolean) => text.sentWithOrderSms(isPlural),
      status: text.delivered,
      description: (isPlural: boolean) => text.rxDelivered(isPlural),
      cta: (isPlural: boolean) => text.receivedRx(isPlural)
    },
    error: {
      title: text.errorMarkDelivered,
      description: (
        <>
          {text.questionVerb}
          <PhoneLink />
        </>
      )
    }
  },
  MAIL_ORDER: {
    SENT: {
      heading: text.orderWasPlaced,
      subheading: (isPlural: boolean) => text.weSent(isPlural),
      status: text.orderPlaced,
      description: (isPlural: boolean) => text.sent(isPlural),
      cta: (isPlural: boolean) => text.receivedRx(isPlural)
    },
    FILLING: {
      heading: text.preparingOrder,
      subheading: text.preparingDelivery,
      status: text.preparing,
      description: (isPlural: boolean) => text.preparingRxDelivery(isPlural),
      cta: (isPlural: boolean) => text.receivedRx(isPlural)
    },
    SHIPPED: {
      heading: text.orderInTransit,
      subheading: (isPlural: boolean) => text.outForDelivery(isPlural),
      status: text.inTransit,
      description: (isPlural: boolean) => text.rxInTransit(isPlural),
      cta: (isPlural: boolean) => text.receivedRx(isPlural)
    },
    DELIVERED: {
      heading: text.orderDelivered,
      subheading: () => '', // it'll still show text us prompt
      status: text.delivered,
      description: (isPlural: boolean) => text.rxDelivered(isPlural),
      cta: (isPlural: boolean) => text.receivedRx(isPlural)
    },
    error: {
      title: text.errorMarkDelivered,
      description: (
        <>
          {text.questionVerb}
          <PhoneLink />
        </>
      )
    }
  }
};
