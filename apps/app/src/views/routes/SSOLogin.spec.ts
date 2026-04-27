import { isCurrentOriginAllowed } from './SSOLogin';

type TestCase = {
  origin: string;
  expectedAllowed: boolean;
};
const testCases = [
  {
    origin: 'app.boson.health',
    expectedAllowed: true
  },
  {
    origin: 'app.neutron.health',
    expectedAllowed: true
  },
  {
    origin: 'app.photon.health',
    expectedAllowed: true
  },
  {
    origin: 'app-test-branch-name.boson.health',
    expectedAllowed: true
  },
  {
    origin: 'app-1234.boson.health',
    expectedAllowed: true
  },
  // Bad ones
  {
    origin: 'app.boson.me',
    expectedAllowed: false
  },
  {
    origin: 'photon.health',
    expectedAllowed: false
  },
  {
    origin: 'app.failing.health',
    expectedAllowed: false
  }
] as TestCase[];

test.each(testCases)('isCurrentOriginAllowed', (testCase) => {
  expect(isCurrentOriginAllowed(testCase.origin)).toBe(testCase.expectedAllowed);
});
