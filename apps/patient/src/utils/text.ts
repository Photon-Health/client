export const text = {
  contactSupport: 'Contact Support',
  changePharmacy: 'Change pharmacy',
  daysSupply: 'Days supply',
  delivered: 'Delivered',
  delivery: 'Delivery',
  enterLoc: 'Enter a zipcode or address',
  enterLocLong: "Enter the zipcode or address where you'd like to search for a pharmacy.",
  errorMarkPickedUp: 'Unable to mark order as picked up',
  errorMarkDelivered: 'Unable to mark order as delivered',
  expires: 'Expires',
  findLoc: 'Find a location',
  gettingLoc: 'Getting current location',
  goLocal: 'Select a local pharmacy for pick up.',
  inTransit: 'In transit',
  noMatch: "We couldn't find what you're looking for.",
  notifyPickUp: (isPlural: boolean) =>
    `Please notify us below when you’ve picked up your ${
      isPlural ? 'prescriptions' : 'prescription'
    }.`,
  outForDelivery: (isPlural: boolean) =>
    `Your order is out for delivery. Please notify us below when you’ve received your ${
      isPlural ? 'prescriptions' : 'prescription'
    }.`,
  orderCanceled: 'This order was canceled.',
  orderDelivered: 'Your order was delivered',
  orderInTransit: 'Your order is in transit',
  orderPickedUp: 'Your order was picked up',
  orderPlaced: 'Order placed',
  orderReady: 'Your order is ready',
  orderWasPlaced: 'Your order has been placed',
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
  preparing: 'Preparing order',
  preparingDelivery: 'The pharmacy is preparing your order for delivery.',
  preparingOrder: 'Preparing your order',
  preparingPickUp: (isPlural: boolean) =>
    `The pharmacy is preparing your ${isPlural ? 'prescriptions' : 'prescription'} for pick up.`,
  preparingRxDelivery: (isPlural: boolean) =>
    `The pharmacy is preparing your ${isPlural ? 'prescriptions' : 'prescription'} for delivery.`,
  preparingTextUs: (isPlural: boolean, phoneNumber: string) =>
    `The pharmacy is preparing your ${
      isPlural ? 'prescriptions' : 'prescription'
    } for pick up. Please <a href="sms:${phoneNumber}">text us</a> if you have any issues.`,
  quantity: 'Quantity',
  questions: 'If you have any questions, please text us at +1 (513) 866-3212.',
  readyBy: 'Ready by',
  readyByOptions: [
    '10:00 am',
    '12:00 pm',
    '2:00 pm',
    '4:00 pm',
    '6:00 pm',
    'After hours',
    'Tomorrow'
  ],
  readyBySelected: (isPlural: boolean) =>
    `We'll do our best to ensure your ${
      isPlural ? 'prescriptions' : 'prescription'
    } are ready by your selected time.`,
  readyPickUp: 'Ready for pick up',
  readyWhen: 'When do you want your order ready by?',
  receivedPreparing: 'The pharmacy has received your order and is preparing it.',
  receivedRx: (isPlural: boolean) => `I received my ${isPlural ? 'prescriptions' : 'prescription'}`,
  refills: 'Refills',
  reviewRx: (isPlural: boolean) => `Review ${isPlural ? 'prescriptions' : 'prescription'}`,
  reviewYourRx: (isPlural: boolean) => `Review your ${isPlural ? 'prescriptions' : 'prescription'}`,
  rxDelivered: (isPlural: boolean) =>
    `Your ${isPlural ? 'prescriptions have' : 'prescription has'} arrived at ${
      isPlural ? 'their' : 'its'
    } destination.`,
  rxInTransit: (isPlural: boolean, deliveryAddress: string) =>
    `Your ${
      isPlural ? 'prescriptions are on their' : 'prescription is on its'
    } way to ${deliveryAddress}.`,
  rxPickedUpTextUs: (isPlural: boolean, phoneNumber: string) =>
    `Your ${
      isPlural ? 'prescriptions were' : 'prescription was'
    } picked up. Please <a href="sms:${phoneNumber}">text us</a> if you have any issues.`,
  rxPickUp: (isPlural: boolean) =>
    `Your ${isPlural ? 'prescriptions are' : 'prescription is'} ready to be picked up.`,
  rxReadyNotify: (isPlural: boolean) =>
    `Your ${
      isPlural ? 'prescriptions are' : 'prescription is'
    } ready to be picked up. Please notify us below when you’ve picked up your ${
      isPlural ? 'prescriptions' : 'prescription'
    }.`,
  searchPharmacy: 'Search for a pharmacy',
  select: 'Select pharmacy',
  selectPharmacy: 'Select a pharmacy',
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
  textUs: (phoneNumber: string) =>
    `Please <a href="sms:${phoneNumber}">text us</a> if you have any issues.`,
  thankYou: 'Thank you!',
  track: 'Track your order',
  tracking: 'Tracking #:',
  useLoc: 'Use my current location',
  weSent: (isPlural: boolean) =>
    `We sent your ${isPlural ? 'prescriptions' : 'prescription'} to the pharmacy.`
};

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
      subheading: (isPlural: boolean, phoneNumber: string) =>
        text.preparingTextUs(isPlural, phoneNumber),
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
      subheading: (isPlural: boolean, phoneNumber: string) =>
        text.rxPickedUpTextUs(isPlural, phoneNumber),
      status: text.pickedUp,
      description: (isPlural: boolean) => text.notifyPickUp(isPlural),
      cta: (isPlural: boolean) => text.pickedUpRx(isPlural)
    },
    error: {
      title: text.errorMarkPickedUp,
      description: text.questions
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
    PREPARING: {
      heading: text.preparingOrder,
      subheading: (isPlural: boolean) => text.sentWithOrderSms(isPlural),
      status: text.preparing,
      description: (isPlural: boolean) => text.preparingRxDelivery(isPlural),
      cta: (isPlural: boolean) => text.receivedRx(isPlural)
    },
    IN_TRANSIT: {
      heading: text.orderInTransit,
      subheading: (isPlural: boolean) => text.sentWithOrderSms(isPlural),
      status: text.inTransit,
      description: (isPlural: boolean, deliveryAddress: string) =>
        text.rxInTransit(isPlural, deliveryAddress),
      cta: (isPlural: boolean) => text.receivedRx(isPlural)
    },
    DELIVERED: {
      heading: text.orderDelivered,
      subheading: (isPlural: boolean) => text.sentWithOrderSms(isPlural),
      status: text.delivered,
      description: (isPlural: boolean) => text.rxDelivered(isPlural),
      cta: (isPlural: boolean) => text.receivedRx(isPlural)
    },
    error: {
      title: text.errorMarkDelivered,
      description: text.questions
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
    PREPARING: {
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
      description: (isPlural: boolean, deliveryAddress: string) =>
        text.rxInTransit(isPlural, deliveryAddress),
      cta: (isPlural: boolean) => text.receivedRx(isPlural)
    },
    DELIVERED: {
      heading: text.orderDelivered,
      subheading: (phoneNumber: string) => text.textUs(phoneNumber),
      status: text.delivered,
      description: (isPlural: boolean) => text.rxDelivered(isPlural),
      cta: (isPlural: boolean) => text.receivedRx(isPlural)
    },
    error: {
      title: text.errorMarkDelivered,
      description: text.questions
    }
  }
};
