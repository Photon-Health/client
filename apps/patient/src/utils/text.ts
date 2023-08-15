export const text = {
  contactSupport: 'Contact Support',
  review: {
    title: 'Review prescriptions',
    heading: 'Review your prescriptions',
    subheading:
      'Please review the prescriptions before you select a pharmacy. Reach out to your provider for any issues.',
    patient: 'Patient',
    prescriber: 'Prescriber',
    quantity: 'Quantity',
    daysSupply: 'Days supply',
    refills: 'Refills',
    substitutions: 'Substitutions',
    expires: 'Expires',
    instructions: 'Instructions',
    cta: 'Search for a pharmacy'
  },
  readyBy: {
    title: 'Ready by',
    heading: 'When do you want this ready by?',
    subheading: "We'll do our best ensure your prescription(s) are ready by your selected time.",
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
      original: "We'll send your prescriptions to your selected pharmacy to be filled.",
      reroute: (originalPharmacyName: string) =>
        `We'll cancel your prescriptions at ${originalPharmacyName} and send them to your new pharmacy to be filled.`
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
      subheading: 'Courier delivery to'
    },
    MAIL_ORDER: {
      heading: 'Delivery',
      subheading: 'Ship to'
    },
    PICK_UP: {
      heading: 'Local Pickup',
      subheading: 'Get your prescriptions at a nearby pharmacy.',
      sorted: 'Sorted by distance',
      showMore: 'Show more pharmacies',
      showingAll: 'Showing all pharmacies'
    },
    cta: 'Select pharmacy',
    thankYou: 'Thank you!'
  },
  status: {
    title: 'Filling your prescriptions',
    heading: 'Filling your prescriptions',
    subheading:
      "After your prescriptions are sent to the pharmacy, we'll send you updates on their status.",
    PICK_UP: {
      pickup: 'Pick Up:',
      chat: {
        prompt: "At the pharmacy? Let us know if you're having any issues.",
        cta: 'Text us now'
      },
      states: {
        SENT: {
          title: 'Sent',
          description: 'Your prescription fills have been sent to the pharmacy.'
        },
        RECEIVED: {
          title: 'Received',
          description: 'The pharmacy has received your order and is preparing to fill it.'
        },
        READY: {
          title: 'Ready',
          description: 'Your prescriptions are ready to be picked up.'
        },
        PICKED_UP: {
          title: 'Picked Up',
          description: "Please notify us below when you've picked up your prescriptions."
        }
      },
      cta: 'I picked up my prescriptions',
      errorToast: {
        title: 'Unable to mark order as picked up',
        description: 'Please refresh and try again'
      }
    },
    COURIER: {
      states: {
        SENT: {
          title: 'Sent',
          description: 'Your prescription fills have been sent to the pharmacy.'
        },
        FILLING: {
          title: 'Filling',
          description: 'The pharmacy has received your order and is filling it.'
        },
        IN_TRANSIT: {
          title: 'In transit',
          description: 'Your prescriptions are on their way to '
        },
        DELIVERED: {
          title: 'Delivered',
          description: 'Your prescriptions have arrived at their destination.'
        }
      },
      cta: 'I received my prescriptions',
      errorToast: {
        title: 'Unable to mark order as delivered',
        description: 'Please refresh and try again'
      }
    },
    MAIL_ORDER: {
      trackingNumber: 'Tracking #:',
      states: {
        SENT: {
          title: 'Sent',
          description: 'Your prescription fills have been sent to the pharmacy.'
        },
        FILLING: {
          title: 'Processing',
          description: 'The pharmacy has received your order and is filling it.'
        },
        SHIPPED: {
          title: 'Shipped',
          description: 'Your prescriptions are being delivered to '
        },
        DELIVERED: {
          title: 'Delivered',
          description: 'Your prescriptions have arrived at their destination.'
        }
      },
      cta: 'I received my prescriptions',
      errorToast: {
        title: 'Unable to mark order as shipped',
        description: 'Please refresh and try again'
      }
    },
    thankYou: 'Thank you!'
  },
  canceled: {
    heading: 'This order has been canceled.',
    subheading: 'If you have any questions, please text us at +1 (513) 866-3212.'
  },
  noMatch: {
    heading: "We couldn't find what you're looking for.",
    subheading: 'If you have any questions, please text us at +1 (513) 866-3212.'
  }
};
