import { prescriptions } from '../utils/demoPrescriptions'

export const settings = {
  demo: false, // TODO: if true, walks through flow without creating stuff
  demoPrescriptions: [prescriptions[1], prescriptions[2]],
  themes: {
    default: {
      logo: undefined,
      accentColor: '#3182ce'
    },
    // Test Telehealth (us)
    [process.env.REACT_APP_TEST_TELEHEALTH_ORG_ID as string]: {
      logo: 'photon',
      accentColor: '#b35724'
    },
    // NewCo (us)
    [process.env.REACT_APP_NEWCO_ORG_ID as string]: {
      logo: 'newco_logo.png',
      accentColor: '#69348F'
    },
    // Modern Pediatrics
    [process.env.REACT_APP_MODERN_PEDIATRICS_ORG_ID as string]: {
      logo: 'modern_pediatrics_logo.png',
      accentColor: '#3f7a9c'
    },
    // Summer Health
    [process.env.REACT_APP_SUMMER_HEALTH_ORG_ID as string]: {
      logo: 'summer_health_logo.svg',
      accentColor: '#ffc21f'
    },
    // Modern Ritual
    [process.env.REACT_APP_MODERN_RITUAL_ORG_ID as string]: {
      logo: 'modern_ritual_logo.webp',
      accentColor: '#202a36'
    },
    // Reside Health
    [process.env.REACT_APP_RESIDE_HEALTH_ORG_ID as string]: {
      logo: 'reside_health_logo.webp',
      accentColor: '#0c3276'
    },
    // Radish Health
    [process.env.REACT_APP_RADISH_HEALTH_ORG_ID as string]: {
      logo: 'red_radish_logo.svg',
      accentColor: '#ba4a71'
    },
    // River Health
    [process.env.REACT_APP_RIVER_HEALTH_ORG_ID as string]: {
      logo: 'river_health_logo.svg',
      accentColor: '#2faef3'
    }
  }
}
