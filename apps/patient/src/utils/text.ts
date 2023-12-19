export const text = {
  contactSupport: 'Contact Support',
  review: {
    title: (isPlural: boolean) => `Review ${isPlural ? 'prescriptions' : 'prescription'}`,
    heading: (isPlural: boolean) => `Review your ${isPlural ? 'prescriptions' : 'prescription'}`,
    subheading: (isPlural: boolean) =>
      `Please review the ${
        isPlural ? 'prescriptions' : 'prescription'
      } before you select a pharmacy. Reach out to your provider for any issues.`,
    patient: 'Patient',
    quantity: 'Quantity',
    daysSupply: 'Days supply',
    refills: 'Refills',
    substitutions: 'Substitutions',
    expires: 'Expires',
    cta: 'Search for a pharmacy'
  },
  readyBy: {
    title: 'Ready by',
    heading: 'When do you want this ready by?',
    subheading: (isPlural: boolean) =>
      `We'll do our best to ensure your ${
        isPlural ? 'prescriptions' : 'prescription'
      } are ready by your selected time.`,
    options: ['10:00 am', '12:00 pm', '2:00 pm', '4:00 pm', '6:00 pm', 'After hours', 'Tomorrow'],
    cta: 'Select a pharmacy'
  },
  pharmacy: {
    title: 'Select a pharmacy',
    heading: {
      original: 'Select a pharmacy',
      reroute: 'Change pharmacy'
    },
    subheading: {
      original: (isPlural: boolean) =>
        `We'll send your ${
          isPlural ? 'prescriptions' : 'prescription'
        } to your selected pharmacy to be filled.`,
      reroute: (isPlural: boolean, originalPharmacyName: string) =>
        `We'll cancel your ${
          isPlural ? 'prescriptions' : 'prescription'
        } at ${originalPharmacyName} and send ${
          isPlural ? 'them' : 'it'
        } to your new pharmacy to be filled.`
    },
    showing: 'Showing pharmacies near:',
    setLocation: 'Set search location',
    modal: {
      heading: 'Set location',
      subheading: "Enter the zipcode or address where you'd like to search for a pharmacy.",
      currentLocation: 'Use my current location',
      getting: 'Getting current location',
      find: 'Find a location',
      enter: 'Enter a zipcode or address'
    },
    COURIER: {
      heading: 'Delivery',
      subheading: 'Ship to'
    },
    MAIL_ORDER: {
      heading: 'Delivery',
      subheading: 'Ship to'
    },
    PICK_UP: {
      heading: 'Pick Up',
      subheading: 'Select a local pharmacy for pick up.',
      showMore: 'Show more pharmacies',
      showingAll: 'Showing all pharmacies'
    },
    cta: 'Select pharmacy',
    thankYou: 'Thank you!'
  },
  status: {
    PICK_UP: {
      title: 'Track your order',
      pickup: 'Pick Up:',
      states: {
        SENT: {
          heading: 'Your order has been placed',
          subheading: (isPlural: boolean) =>
            `Your ${
              isPlural ? 'prescriptions were' : 'prescription was'
            } sent to the pharmacy. We’ll text you to let you know when it’s ready.`,
          state: 'Order placed',
          description: (isPlural: boolean) =>
            `Your ${isPlural ? 'prescriptions were' : 'prescription was'} sent to the pharmacy.`,
          cta: (isPlural: boolean) =>
            `I picked up my ${isPlural ? 'prescriptions' : 'prescription'}`
        },
        RECEIVED: {
          heading: 'Preparing your order',
          subheading: (isPlural: boolean, phoneNumber: string) =>
            `The pharmacy is preparing your ${
              isPlural ? 'prescriptions' : 'prescription'
            } for pick up. Please <a href="sms:${phoneNumber}">text us</a> if you have any issues.`,
          state: 'Preparing order',
          description: (isPlural: boolean) =>
            `The pharmacy is preparing your ${
              isPlural ? 'prescriptions' : 'prescription'
            } for pick up.`,
          cta: (isPlural: boolean) =>
            `I picked up my ${isPlural ? 'prescriptions' : 'prescription'}`
        },
        READY: {
          heading: 'Your order is ready',
          subheading: (isPlural: boolean) =>
            `Your ${
              isPlural ? 'prescriptions are' : 'prescription is'
            } ready to be picked up. Please notify us below when you’ve picked up your ${
              isPlural ? 'prescriptions' : 'prescription'
            }.`,
          state: 'Ready for pick up',
          description: (isPlural: boolean) =>
            `Your ${isPlural ? 'prescriptions are' : 'prescription is'} ready to be picked up.`,
          cta: (isPlural: boolean) =>
            `I picked up my ${isPlural ? 'prescriptions' : 'prescription'}`
        },
        PICKED_UP: {
          heading: 'Your order was picked up',
          subheading: (isPlural: boolean, phoneNumber: string) =>
            `Your ${
              isPlural ? 'prescriptions were' : 'prescription was'
            } picked up. Please <a href="sms:${phoneNumber}">text us</a> if you have any issues.`,
          state: 'Picked up',
          description: (isPlural: boolean) =>
            `Please notify us below when you’ve picked up your ${
              isPlural ? 'prescriptions' : 'prescription'
            }.`,
          cta: (isPlural: boolean) =>
            `I picked up my ${isPlural ? 'prescriptions' : 'prescription'}`
        }
      },
      errorToast: {
        title: 'Unable to mark order as picked up',
        description: 'Please refresh and try again'
      }
    },
    COURIER: {
      title: 'Track your order',
      states: {
        SENT: {
          heading: 'Your order has been placed',
          subheading: (isPlural: boolean) =>
            `We sent your ${isPlural ? 'prescriptions' : 'prescription'} to the pharmacy.`,
          state: 'Order placed',
          description: (isPlural: boolean) =>
            `Your ${isPlural ? 'prescriptions were' : 'prescription was'} sent to the pharmacy`,
          cta: (isPlural: boolean) => `I received my ${isPlural ? 'prescriptions' : 'prescription'}`
        },
        PREPARING: {
          heading: 'Preparing your order',
          subheading: (isPlural: boolean) =>
            `We sent your ${
              isPlural ? 'prescriptions' : 'prescription'
            } to your selected pharmacy. We’ll text you updates on your order status.`,
          state: 'Preparing order',
          description: (_) => 'The pharmacy has received your order and is preparing it.',
          cta: (isPlural: boolean) => `I received my ${isPlural ? 'prescriptions' : 'prescription'}`
        },
        IN_TRANSIT: {
          heading: 'Your order is in transit',
          subheading: (isPlural: boolean) =>
            `We sent your ${
              isPlural ? 'prescriptions' : 'prescription'
            } to your selected pharmacy. We’ll text you updates on your order status.`,
          state: 'In transit',
          description: (isPlural: boolean) =>
            `Your ${isPlural ? 'prescriptions are on their' : 'prescription is on its'} way to `,
          cta: (isPlural: boolean) => `I received my ${isPlural ? 'prescriptions' : 'prescription'}`
        },
        DELIVERED: {
          heading: 'Your order was delivered',
          subheading: (isPlural: boolean) =>
            `We sent your ${
              isPlural ? 'prescriptions' : 'prescription'
            } to your selected pharmacy. We’ll text you updates on your order status.`,
          state: 'Delivered',
          description: (isPlural: boolean) =>
            `Your ${isPlural ? 'prescriptions have' : 'prescription has'} arrived at ${
              isPlural ? 'their' : 'its'
            } destination.`,
          cta: (isPlural: boolean) => `I received my ${isPlural ? 'prescriptions' : 'prescription'}`
        }
      },
      errorToast: {
        title: 'Unable to mark order as delivered',
        description: 'Please refresh and try again'
      }
    },
    MAIL_ORDER: {
      title: 'Track your order',
      trackingNumber: 'Tracking #:',
      states: {
        SENT: {
          heading: 'Your order has been placed',
          subheading: (isPlural: boolean) =>
            `We sent your ${isPlural ? 'prescriptions' : 'prescription'} to the pharmacy.`,
          state: 'Order placed',
          description: (isPlural: boolean) =>
            `Your ${isPlural ? 'prescriptions were' : 'prescription was'} sent to the pharmacy.`,
          cta: (isPlural: boolean) => `I received my ${isPlural ? 'prescriptions' : 'prescription'}`
        },
        PREPARING: {
          heading: 'Preparing your order',
          subheading: 'The pharmacy is preparing your order for delivery.',
          state: 'Preparing order',
          description: (isPlural: boolean) =>
            `The pharmacy is preparing your ${
              isPlural ? 'prescriptions' : 'prescription'
            } for delivery.`,
          cta: (isPlural: boolean) => `I received my ${isPlural ? 'prescriptions' : 'prescription'}`
        },
        SHIPPED: {
          heading: 'Your order is in transit',
          subheading: (isPlural: boolean) =>
            `Your order is out for delivery. Please notify us below when you’ve received your ${
              isPlural ? 'prescriptions' : 'prescription'
            }.`,
          state: 'In transit',
          description: (isPlural: boolean, deliveryAddress: string) =>
            `Your ${
              isPlural ? 'prescriptions are on their' : 'prescription is on its'
            } way to ${deliveryAddress}.`,
          cta: (isPlural: boolean) => `I received my ${isPlural ? 'prescriptions' : 'prescription'}`
        },
        DELIVERED: {
          heading: 'Your order was delivered',
          subheading: (phoneNumber: string) =>
            `Please <a href="sms:${phoneNumber}">text us</a> if you have any issues.`,
          state: 'Delivered',
          description: (isPlural: boolean) =>
            `Your ${
              isPlural ? 'prescriptions' : 'prescription'
            } have arrived at their destination.`,
          cta: (isPlural: boolean) => `I received my ${isPlural ? 'prescriptions' : 'prescription'}`
        }
      },
      errorToast: {
        title: 'Unable to mark order as delivered',
        description: 'Please refresh and try again'
      }
    },
    thankYou: 'Thank you!'
  },
  canceled: {
    heading: 'This order was canceled.',
    subheading: 'If you have any questions, please text us at +1 (513) 866-3212.'
  },
  noMatch: {
    heading: "We couldn't find what you're looking for.",
    subheading: 'If you have any questions, please text us at +1 (513) 866-3212.'
  }
};
