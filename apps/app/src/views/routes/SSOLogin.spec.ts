import { isCurrentOriginAllowed } from './SSOLogin';

type TestCase = {
  origin: string;
  expectedAllowed: boolean;
};
const testCases = [
  {
    origin: 'https://app.boson.health',
    expectedAllowed: true
  },
  {
    origin: 'https://app.neutron.health',
    expectedAllowed: true
  },
  {
    origin: 'https://app.photon.health',
    expectedAllowed: true
  },
  {
    origin: 'https://app-test-branch-name.boson.health',
    expectedAllowed: true
  },
  {
    origin: 'https://app-1234.boson.health',
    expectedAllowed: true
  },
  // Bad ones
  {
    origin: 'https://app.boson.me',
    expectedAllowed: false
  },
  {
    origin: 'https://photon.health',
    expectedAllowed: false
  },
  {
    origin: 'https://app.failing.health',
    expectedAllowed: false
  },
  {
    origin: 'app.boson.health',
    expectedAllowed: false
  }
] as TestCase[];

describe.each(testCases)('isCurrentOriginAllowed', (testCase) => {
  test(`When origin is ${testCase.origin} allowed should be ${testCase.expectedAllowed}`, () => {
    expect(isCurrentOriginAllowed(testCase.origin)).toBe(testCase.expectedAllowed);
  });
});
