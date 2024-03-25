import { Link } from '@chakra-ui/react';
import React from 'react';

export const text = {
  closed: 'Closed',
  closingSoon: 'Closing soon',
  contactSupport: 'Contact Support',
  changePharmacy: 'Change pharmacy',
  daysSupply: 'Days supply',
  delivered: 'Delivered',
  delivery: 'Delivery',
  directions: 'Get directions',
  enterLoc: 'Enter a zipcode or address',
  enterLocLong: "Enter the zipcode or address where you'd like to search for a pharmacy.",
  errorMarkPickedUp: 'Unable to mark order as picked up',
  errorMarkDelivered: 'Unable to mark order as delivered',
  expires: 'Expires',
  fakeRx: 'This is not a real prescription.',
  fakeRxs: 'These are not real prescriptions.',
  findLoc: 'Find a location',
  gettingLoc: 'Getting current location',
  goLocal: 'Select a local pharmacy for pick up.',
  goodService: 'Good Service',
  inTransit: 'In transit',
  makePreferred: 'Make this my preferred pharmacy',
  next: 'Next',
  noMatch: "We couldn't find what you're looking for.",
  notifyPickUp: (isPlural: boolean) =>
    `Please notify us below when you’ve picked up your ${
      isPlural ? 'prescriptions' : 'prescription'
    }.`,
  open: 'Open',
  open24hrs: 'Open 24 Hours',
  orderCanceled: 'This order was canceled.',
  orderDelivered: 'Your order was delivered',
  orderInTransit: 'Your order is in transit',
  orderPickedUp: 'Your order was picked up',
  orderPlaced: 'Order placed',
  orderReady: 'Your order is ready',
  orderWasPlaced: 'Your order has been placed',
  outForDelivery: (isPlural: boolean) =>
    `Your order is out for delivery. Please notify us below when you’ve received your ${
      isPlural ? 'prescriptions' : 'prescription'
    }.`,
  patient: 'Patient',
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
  preparing: 'Preparing order',
  preparingDelivery: 'The pharmacy is preparing your order for delivery.',
  preparingOrder: 'Preparing your order',
  preparingPickUp: (isPlural: boolean) =>
    `The pharmacy is preparing your ${isPlural ? 'prescriptions' : 'prescription'} for pick up.`,
  preparingRxDelivery: (isPlural: boolean) =>
    `The pharmacy is preparing your ${isPlural ? 'prescriptions' : 'prescription'} for delivery.`,
  preparingTextUs: (isPlural: boolean) =>
    `The pharmacy is preparing your ${isPlural ? 'prescriptions' : 'prescription'} for pick up.`,
  previous: 'Previous',
  quantity: 'Quantity',
  questionVerb: 'If you have any questions, please text us at ',
  questionsPhoneNumber: '+1 (513) 866 3212',
  readyBy: 'Ready by',
  readyByOptions: {
    today: [
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
    tomorrow: [
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
  readyPickUp: 'Ready for pick up',
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
      isPlural ? 'their' : "it's"
    } ready.`,
  setLoc: 'Set location',
  setSearchLoc: 'Set search location',
  shipTo: (deliveryAddress: string) => `Ship to ${deliveryAddress}`,
  showingLabel: 'Showing pharmacies near:',
  showingAll: 'Showing all pharmacies',
  showMore: 'Show more pharmacies',
  thankYou: 'Thank you!',
  track: 'Track your order',
  tracking: 'Tracking #:',
  tryPhoton: 'Try Photon',
  useLoc: 'Use my current location',
  weSent: (isPlural: boolean) =>
    `We sent your ${isPlural ? 'prescriptions' : 'prescription'} to the pharmacy.`
};

export function generatePhoneNumberLink(): React.ReactElement {
  const cleanedPhoneNumber = text.questionsPhoneNumber.replace(/[\s()-]/g, '');
  return (
    <>
      {text.questionVerb}
      <Link
        color="link"
        fontWeight="medium"
        textDecoration="underline"
        href={`sms:${cleanedPhoneNumber}`}
      >
        {text.questionsPhoneNumber}
      </Link>
    </>
  );
}

export const orderStateMapping = {
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
      description: generatePhoneNumberLink()
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
      description: generatePhoneNumberLink()
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
      description: generatePhoneNumberLink()
    }
  }
};
