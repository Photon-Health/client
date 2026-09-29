import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { intakeRouteElements } from '../routes';
import { getConditionFlow, resolveTreatment } from '../conditions';

vi.mock('../api/patient', () => ({ lookupPatient: vi.fn(), createPatient: vi.fn() }));
vi.mock('../api/prescription', () => ({ draftPrescription: vi.fn() }));
vi.mock('../api/order', () => ({ createDraftOrder: vi.fn(), setOrderPharmacy: vi.fn() }));

import { createPatient, lookupPatient } from '../api/patient';
import { createDraftOrder, setOrderPharmacy } from '../api/order';
import { draftPrescription } from '../api/prescription';

const renderAt = (path: string) => {
  const router = createMemoryRouter(createRoutesFromElements(intakeRouteElements), {
    initialEntries: [path]
  });
  render(<RouterProvider router={router} />);
  return router;
};

/** Phone screen -> code screen -> details screen, stopping before the lookup. */
const walkToDetails = async (router = renderAt('/start/ella/verify')) => {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText('Mobile number'), '3035550142');
  await user.click(screen.getByRole('button', { name: 'Send code' }));

  await screen.findByRole('heading', { name: /enter the code we sent/i });
  await user.type(screen.getByLabelText('Digit 1'), '482913');
  await user.click(screen.getByRole('button', { name: 'Verify' }));

  await screen.findByRole('heading', { name: /couple of details/i });
  await user.type(screen.getByLabelText('Last name'), 'Ortiz');
  fireEvent.change(screen.getByLabelText('Date of birth'), { target: { value: '1990-04-12' } });
  return { router, user };
};

beforeEach(() => {
  vi.stubEnv('VITE_INTAKE_FAKE_OTP', 'true');
  vi.clearAllMocks();
});

describe('landing', () => {
  it('renders copy from the condition config', () => {
    renderAt('/start/ella');
    expect(screen.getByRole('heading')).toHaveTextContent(/ella prescribed online/i);
    expect(screen.getByText(/Up to 120 hours/)).toBeInTheDocument();
  });

  it('renders a not-found page for an unknown condition', () => {
    renderAt('/start/nope');
    expect(screen.getByRole('heading')).toHaveTextContent(/not found/i);
  });
});

describe('phone screen', () => {
  it('refuses to run when the fake OTP flag is off', () => {
    vi.stubEnv('VITE_INTAKE_FAKE_OTP', '');
    renderAt('/start/ella/verify');
    expect(screen.getByRole('heading')).toHaveTextContent(/not available/i);
    expect(screen.queryByLabelText('Mobile number')).not.toBeInTheDocument();
  });

  it('keeps Send code disabled until the number parses', async () => {
    const user = userEvent.setup();
    renderAt('/start/ella/verify');
    const send = screen.getByRole('button', { name: 'Send code' });

    expect(send).toBeDisabled();
    await user.type(screen.getByLabelText('Mobile number'), '303555');
    expect(send).toBeDisabled();
    await user.type(screen.getByLabelText('Mobile number'), '0142');
    expect(send).toBeEnabled();
  });
});

describe('code screen', () => {
  it('sends you back to the phone screen if you land on it cold', async () => {
    const router = renderAt('/start/ella/verify/code');
    await waitFor(() => expect(router.state.location.pathname).toBe('/start/ella/verify'));
  });

  it('accepts any six digits and shows the number it was sent to', async () => {
    const user = userEvent.setup();
    renderAt('/start/ella/verify');
    await user.type(screen.getByLabelText('Mobile number'), '3035550142');
    await user.click(screen.getByRole('button', { name: 'Send code' }));

    expect(await screen.findByText(/\(303\) 555-0142/)).toBeInTheDocument();
    const verify = screen.getByRole('button', { name: 'Verify' });
    expect(verify).toBeDisabled();

    await user.type(screen.getByLabelText('Digit 1'), '000000');
    expect(verify).toBeEnabled();
  });

  it('spreads a typed code across the boxes', async () => {
    const user = userEvent.setup();
    renderAt('/start/ella/verify');
    await user.type(screen.getByLabelText('Mobile number'), '3035550142');
    await user.click(screen.getByRole('button', { name: 'Send code' }));
    await screen.findByLabelText('Digit 1');

    await user.type(screen.getByLabelText('Digit 1'), '482913');
    expect(screen.getByLabelText('Digit 1')).toHaveValue('4');
    expect(screen.getByLabelText('Digit 6')).toHaveValue('3');
  });
});

describe('details screen', () => {
  it('looks up on E.164 phone plus last name and DOB', async () => {
    vi.mocked(lookupPatient).mockResolvedValue({ kind: 'notFound', missingFields: [] });

    const { user } = await walkToDetails();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() =>
      expect(lookupPatient).toHaveBeenCalledWith({
        phone: '+13035550142',
        lastName: 'Ortiz',
        dateOfBirth: '1990-04-12'
      })
    );
  });

  it('sends a matched patient to their history', async () => {
    vi.mocked(lookupPatient).mockResolvedValue({
      kind: 'matched',
      patient: {
        id: 'pat_1',
        firstName: 'Achilles',
        lastName: 'Ortiz',
        medications: [{ id: 'med_1', name: 'Sertraline 50 mg', status: 'ACTIVE' }]
      }
    });

    const { router, user } = await walkToDetails();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/start/ella/history'));
    expect(screen.getByRole('heading')).toHaveTextContent(/Welcome back, Achilles/);
    expect(screen.getByText('Sertraline 50 mg')).toBeInTheDocument();
  });

  it('sends an unrecognized number to the new-profile screen', async () => {
    vi.mocked(lookupPatient).mockResolvedValue({ kind: 'notFound', missingFields: [] });

    const { router, user } = await walkToDetails();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/start/ella/verify/profile'));
    expect(screen.getByRole('heading')).toHaveTextContent(/set up your profile/i);
  });

  it('dead-ends on an ambiguous match', async () => {
    vi.mocked(lookupPatient).mockResolvedValue({
      kind: 'ambiguous',
      reason: 'weak match, verify carefully',
      candidates: []
    });

    const { router, user } = await walkToDetails();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/start/ella/unresolved'));
    expect(screen.getByRole('heading')).toHaveTextContent(/more to identify you/i);
    expect(screen.getByText(/weak match/)).toBeInTheDocument();
  });
});

describe('new profile', () => {
  const reachProfile = async () => {
    vi.mocked(lookupPatient).mockResolvedValue({ kind: 'notFound', missingFields: [] });
    const { router, user } = await walkToDetails();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await screen.findByRole('heading', { name: /set up your profile/i });
    return { router, user };
  };

  it('prefills the last name and DOB already collected', async () => {
    await reachProfile();
    expect(screen.getByLabelText('Last name')).toHaveValue('Ortiz');
    expect(screen.getByLabelText('Date of birth')).toHaveValue('1990-04-12');
  });

  it('requires first name and sex on top of what was carried over', async () => {
    const { user } = await reachProfile();
    const create = screen.getByRole('button', { name: /create profile/i });

    expect(create).toBeDisabled();
    await user.type(screen.getByLabelText('First name'), 'Achilles');
    expect(create).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: 'Female' }));
    expect(create).toBeEnabled();
  });

  it('creates the patient and skips welcome-back for the questions', async () => {
    vi.mocked(createPatient).mockResolvedValue({
      id: 'pat_new',
      firstName: 'Achilles',
      lastName: 'Ortiz',
      medications: []
    });

    const { router, user } = await reachProfile();
    await user.type(screen.getByLabelText('First name'), 'Achilles');
    await user.click(screen.getByRole('radio', { name: 'Female' }));
    await user.click(screen.getByRole('button', { name: /create profile/i }));

    await waitFor(() =>
      expect(createPatient).toHaveBeenCalledWith({
        phone: '+13035550142',
        firstName: 'Achilles',
        lastName: 'Ortiz',
        dateOfBirth: '1990-04-12',
        sex: 'FEMALE'
      })
    );
    await waitFor(() => expect(router.state.location.pathname).toBe('/start/ella/questions'));
  });

  it('offers only the two sexes the API can tell apart from "not answered"', async () => {
    await reachProfile();

    expect(screen.getByRole('radio', { name: 'Female' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Male' })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Intersex' })).not.toBeInTheDocument();
  });

  it('surfaces a create failure without leaving the screen', async () => {
    vi.mocked(createPatient).mockRejectedValue(
      new Error('Sex is required to create a new patient')
    );

    const { router, user } = await reachProfile();
    await user.type(screen.getByLabelText('First name'), 'Achilles');
    await user.click(screen.getByRole('radio', { name: 'Male' }));
    await user.click(screen.getByRole('button', { name: /create profile/i }));

    expect(await screen.findByText(/Sex is required/)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/start/ella/verify/profile');
  });

  it('sends you back to the phone screen if you land on it cold', async () => {
    const router = renderAt('/start/ella/verify/profile');
    await waitFor(() => expect(router.state.location.pathname).toBe('/start/ella/verify'));
  });
});

/** Verify -> questions -> review, with a matched patient you control. */
const walkToReview = async (address: { postalCode?: string } | null) => {
  vi.mocked(lookupPatient).mockResolvedValue({
    kind: 'matched',
    patient: { id: 'pat_1', firstName: 'Achilles', lastName: 'Ortiz', address, medications: [] }
  });
  vi.mocked(draftPrescription).mockResolvedValue('rx_1');

  const { router, user } = await walkToDetails();
  await user.click(screen.getByRole('button', { name: 'Continue' }));

  await screen.findByRole('button', { name: 'Continue my request' });
  await user.click(screen.getByRole('button', { name: 'Continue my request' }));

  await screen.findByRole('button', { name: 'Next' });
  for (const question of ['In the last 24 hours', 'No']) {
    await user.click(screen.getByRole('radio', { name: question }));
  }
  await user.click(screen.getByRole('button', { name: 'Next' }));

  await screen.findByRole('button', { name: /choose a pharmacy/i });
  await user.click(screen.getByRole('button', { name: /choose a pharmacy/i }));
  return { router, user };
};

describe('pharmacy search origin', () => {
  it('asks for a zip when the patient has no address on file', async () => {
    const { router } = await walkToReview(null);

    await waitFor(() => expect(router.state.location.pathname).toBe('/start/ella/location'));
    expect(createDraftOrder).not.toHaveBeenCalled();
  });

  it('skips the zip screen when the patient has a postal code', async () => {
    vi.mocked(createDraftOrder).mockResolvedValue({ orderId: 'ord_1', pharmacies: [] });

    const { router } = await walkToReview({ postalCode: '11238' });

    await waitFor(() => expect(router.state.location.pathname).toBe('/start/ella/pharmacy'));
    await waitFor(() =>
      expect(createDraftOrder).toHaveBeenCalledWith(
        expect.objectContaining({ origin: { postalCode: '11238' } })
      )
    );
  });

  it('searches on the zip that was typed in', async () => {
    vi.mocked(createDraftOrder).mockResolvedValue({ orderId: 'ord_1', pharmacies: [] });

    const { user } = await walkToReview(null);

    const zip = await screen.findByLabelText('ZIP code');
    const submit = screen.getByRole('button', { name: 'Continue' });
    expect(submit).toBeDisabled();

    await user.type(zip, '802');
    expect(submit).toBeDisabled();

    await user.type(zip, '02');
    expect(submit).toBeEnabled();
    await user.click(submit);

    await waitFor(() =>
      expect(createDraftOrder).toHaveBeenCalledWith(
        expect.objectContaining({ origin: { postalCode: '80202' } })
      )
    );
  });
});

describe('pharmacy cards', () => {
  const candidates = [
    { id: 'phm_cvs', name: 'CVS Pharmacy', reason: null, offers: [] },
    { id: 'phm_costco', name: 'Costco Pharmacy', reason: null, offers: [] }
  ];

  it('shows a card per candidate and sends to the one opened', async () => {
    vi.mocked(createDraftOrder).mockResolvedValue({ orderId: 'ord_1', pharmacies: candidates });
    vi.mocked(setOrderPharmacy).mockResolvedValue({
      orderId: 'ord_1',
      pharmacyName: 'Costco Pharmacy'
    });

    const { router, user } = await walkToReview({ postalCode: '11238' });

    await screen.findByText('CVS Pharmacy');
    expect(screen.getByText('Costco Pharmacy')).toBeInTheDocument();

    // Collapsed carries no send button — you open a card, then send.
    expect(screen.queryByRole('button', { name: /send to/i })).not.toBeInTheDocument();

    await user.click(screen.getByText('Costco Pharmacy'));
    await user.click(await screen.findByRole('button', { name: /send to costco/i }));

    await waitFor(() =>
      expect(setOrderPharmacy).toHaveBeenCalledWith({ orderId: 'ord_1', pharmacyId: 'phm_costco' })
    );
    await waitFor(() => expect(router.state.location.pathname).toBe('/start/ella/submitted'));
  });
});

describe('guards', () => {
  it('sends someone who lands mid-flow back to the phone screen', async () => {
    const router = renderAt('/start/ella/review');
    await waitFor(() => expect(router.state.location.pathname).toBe('/start/ella/verify'));
  });

  it('does not create a draft order without a prescription', async () => {
    renderAt('/start/ella/pharmacy');
    await waitFor(() => expect(createDraftOrder).not.toHaveBeenCalled());
  });

  it('sends someone who reaches the zip screen cold back to the phone screen', async () => {
    const router = renderAt('/start/ella/location');
    await waitFor(() => expect(router.state.location.pathname).toBe('/start/ella/verify'));
  });
});

describe('glp1 flow', () => {
  /** Landing -> eligibility -> health history, stopping before verification. */
  const walkToGlp1Questions = async () => {
    const router = renderAt('/start/glp1');
    const user = userEvent.setup();

    await user.click(screen.getAllByRole('button', { name: 'Check if I’m eligible' })[0]);

    await screen.findByRole('heading', { name: /could fit/i });
    await user.type(screen.getByLabelText('Height in feet'), '5');
    await user.type(screen.getByLabelText('Height in inches'), '9');
    await user.type(screen.getByLabelText('Weight'), '224');
    return { router, user };
  };

  it('meters its own six steps, not ella’s four', async () => {
    renderAt('/start/glp1/eligibility');
    expect(await screen.findByText(/step 1 of 6 · eligibility/i)).toBeInTheDocument();
  });

  it('screens on BMI and says the comorbidity threshold was met', async () => {
    const { user } = await walkToGlp1Questions();

    expect(screen.getByText('BMI 33.1')).toBeInTheDocument();
    expect(screen.getByText('Meets criteria')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText(/step 2 of 6 · health history/i)).toBeInTheDocument();
  });

  it('flags a BMI that clears only the with-condition threshold', async () => {
    renderAt('/start/glp1/eligibility');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Height in feet'), '5');
    await user.type(screen.getByLabelText('Height in inches'), '9');
    await user.type(screen.getByLabelText('Weight'), '190');

    expect(screen.getByText('May not meet criteria')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Sleep apnea' }));
    expect(screen.getByText('Meets criteria')).toBeInTheDocument();
  });

  it('asks the safety questions under one heading, then verifies identity', async () => {
    const { router, user } = await walkToGlp1Questions();
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await screen.findByRole('heading', { name: 'A few safety questions' });
    // A page heading frees each group to be named by its own prompt.
    for (const question of getConditionFlow('glp1')!.questions) {
      const group = screen.getByRole('radiogroup', { name: question.prompt });
      await user.click(within(group).getByRole('radio', { name: 'No' }));
    }
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/start/glp1/verify'));
  });

  it('gates the medication step on a preference', async () => {
    renderAt('/start/glp1/medication');
    const user = userEvent.setup();

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    await user.click(screen.getByRole('radio', { name: /Zepbound \(tirzepatide\)/ }));
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  });

  it('drafts the drug behind the preference, falling back to the default', () => {
    const flow = getConditionFlow('glp1')!;
    expect(resolveTreatment(flow, { medicationPreference: 'zepbound' }).name).toBe('tirzepatide');
    expect(resolveTreatment(flow, { medicationPreference: 'provider' }).name).toBe('semaglutide');
  });
});
