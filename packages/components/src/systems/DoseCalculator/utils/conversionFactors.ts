const conversionFactors = {
  'mcg/kg': {
    lbs: 0.453592,
    kg: 1,
    mcg: 1,
    mg: 1000,
    g: 1000000
  },
  'mg/kg': {
    lbs: 0.453592,
    kg: 1,
    mcg: 0.001,
    mg: 1,
    g: 1000
  },
  'g/kg': {
    lbs: 0.453592,
    kg: 1,
    mcg: 0.000001,
    mg: 0.001,
    g: 1
  }
};

export default conversionFactors;
