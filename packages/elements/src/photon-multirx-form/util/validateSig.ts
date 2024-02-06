import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

// object list of language codes and full name
// const languageCodes = {
//   en: 'English',
//   es: 'Spanish',
//   fr: 'French',
//   de: 'German',
//   it: 'Italian',
//   pt: 'Portuguese',
//   ma: 'Mandarin'
// };

export default async function (sig: string) {
  // const sig = sig || '';

  console.log('here');

  try {
    console.log('--- ', generatePrompt(sig));
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: generatePrompt(sig)
        }
      ]
      // temperature: 0.6,
      // max_tokens: 100,
    });

    console.log(completion.choices[0].message);
    // res.status(200).json({ result: completion.choices[0].message });
  } catch (error) {
    // Consider adjusting the error handling logic for your use case

    console.log(error);

    // if (error.response) {
    //   console.error(error.response.status, error.response.data);
    //   res.status(error.response.status).json(error.response.data);
    // } else {
    //   console.error(`Error with OpenAI API request: ${error.message}`);
    //   res.status(500).json({
    //     error: {
    //       message: 'An error occurred during your request.'
    //     }
    //   });
    // }
  }
}

function generatePrompt(sig: string) {
  return `
    Validate that the provided SIG below matches the following format and respond with YES/NO and reason.

    SIG:
    
    ${sig}

    Required Format:
    
    [Action] [Quantity] [Form/Measurement] [Route] [Frequency] [Time]

    Examples:

    Take 10ML by mouth once daily.
    Inject 1ML subcutaneously once monthly.
    Take 1 tablet by mouth once daily.
    `;
}

// function generatePrompt(sig, language) {
//   const capitalizedSig = sig[0].toUpperCase() + sig.slice(1).toLowerCase();
//   return `
//   Pretend you are a Doctor who needs to translate the following SIG into both plain ${language} for your patient. Your patient only speaks ${language} and needs to know how to take their medication.

//   Here are some SIG codes in a cheat sheet:
//   AAA : Affected area application
//   ac : before meals
//   ad : right ear
//   am : in the morning
//   amp : ampule
//   amp : ampicillin
//   APAP : acetaminophen
//   aq or H2O : water
//   as : left ear
//   au : each or both ears
//   AUD : apply as directed
//   bid or b.i.d. : twice a day
//   BOT : bottle
//   BP : blood pressure
//   c : with
//   C or c : 100
//   cap : capsule
//   cc : cubic centimeter
//   cf : with food
//   CF : cough/cold formula
//   cm : centimeter
//   CPM : chlorpheniramine
//   cr or cre : cream
//   CR : controlled release
//   D or d : 500
//   D/C or d/c : discontinue
//   DA : delayed action
//   DAW : dispense as written
//   dc or d/c : discontinue
//   DC : diagnosis code
//   dil : dilute
//   disp : dispense
//   dL : deciliter
//   DM : dextromethorphan
//   DR : delayed release
//   DS : double strength
//   DV : a daily value
//   EC or e.c. : enteric-coated
//   ECT : enteric-coated tablet
//   ER : extended release
//   fl : fluid
//   fl oz : fluid ounce
//   ft : feet
//   g, gm : gram
//   gal : gallon
//   GG -guaifenesin
//   GGPE : guaifenesin/phenylephrine
//   gr : grain
//   gtt : drop
//   h or hr : hour
//   HA : headache
//   HBP : high blood pressure
//   HC : hydrocodone or hydrocortisone
//   HCT or HCTZ : hydrochlorothiazide
//   hs : at bedtime
//   ht : height
//   HT or HTN : hypertension
//   I or i : 1
//   IM : intramuscular
//   in : inch
//   inh : inhalation
//   INH : isoniazid
//   inj : injection
//   IR : immediate release
//   IT or ITCH : itching
//   IU or I.U. : international unit
//   IV : intravenous
//   K : Potassium
//   KCl or KCL : Potassium Chloride
//   kg : kilogram
//   L or l : liter
//   L or l : 50
//   LA : long-acting
//   lb : pound
//   liq : liquid
//   lot : lotion
//   m : meter
//   M or m : 1,000
//   m² : square meters
//   mcg : microgram
//   mcL : microliter
//   MDI : metered dose inhaler
//   MDP Medrol Dose Pack
//   mEq : milliequivalent
//   Mg or Mag : Magnesium
//   mg : milligram
//   mg/dL : milligrams per deciliter of blood
//   mL- milliliter
//   mm Hg : millimeters of mercury
//   MTX : methotrexate
//   MVI : multiple or Multi-Vitamins
//   N/A or n/a : not available
//   N&V or N/V : nausea and vomiting
//   NA : nausea
//   Na : Sodium
//   NaCl : salt
//   NaHCO3 : sodium bicarbonate
//   NDC : national drug code
//   NEB or neb : nebulizer
//   No., no., Nos. or nos. : number/numbers
//   noct : at night
//   NPH : N (intermediate) insulin
//   NPI : National Provider Identifier
//   npo : nil per mouth
//   NR, N.R. or NRF : no refill
//   NS : nasal spray
//   NS : normal saline (0.9% sodium chloride)
//   NTG : nitroglycerin
//   NV : nausea and vomiting
//   od : right eye
//   ODT : orally disintegrating tablet
//   oint : ointment
//   OP, OPH, OPHT or OPHTH : ophthalmic
//   os : left eye
//   OTC : over the counter
//   ou : each or both eyes
//   oz : ounce
//   PA : prior authorization
//   PB or Pb : phenobarbital
//   pc : after meals
//   PCN : penicillin
//   pct : percent or percentage
//   PD : pediatric drop
//   PED : pediatric
//   PEG : polyethylene glycol
//   per : by or through
//   pH : acidity level
//   pkd : packaged
//   pkg : package
//   pkt : packet
//   pm : afternoon or in the evening
//   PMS : premenstrual syndrome
//   PNV : prenatal vitamins
//   po : by mouth
//   pp : postprandial (after eating)
//   PR : per rectum
//   prn : as needed
//   PSE : pseudoephedrine
//   pt : pint
//   pt or pt. : patient
//   PTU : propylthiouracil
//   q : every, each
//   qam : every morning
//   qd : daily
//   qdam : daily in the morning
//   qd pm : daily in the evening
//   qh : every hour
//   q12h : every 12 hours
//   q2-3h : every two to three hours
//   q24h : every 24 hours
//   q2-4h : every two to four hours
//   q4h : every four hours
//   q4-6h : every four to six hours
//   q4° : every four hours
//   q6° : every six hours
//   qhs : every night
//   qid or q.i.d. : four times a day
//   qod : every other day
//   qpm : every evening
//   q 8pm : every day at 8 p.m.
//   qs, QS or Q.S. : sufficient quantity
//   qt : quart
//   QTY or qty : quantity
//   qw : once a week
//   R : rectum, rectally
//   RA : rheumatoid arthritis
//   RF : refill
//   Rx : prescription
//   s : without
//   SA : sustained action
//   sc, sq or subq : subcutaneous (under the skin)
//   sig : signa (prescription directions)
//   SL or S.L. : sublingual (under the tongue)
//   SMZ-TMP : sulfamethoxazole/trimethoprim
//   SOB : shortness of breath
//   SOD or sod : sodium
//   sol or soln : solution
//   SR : sustained release
//   ss : one half
//   stat : immediately
//   sup or supp : suppository
//   susp : suspension
//   syr : syrup
//   SYR : syringe
//   tab : tablet
//   tac or TAC : triamcinolone
//   tud or TUD : take as directed
//   tat or TAT : until all taken
//   tbsp : tablespoonful
//   TCN : tetracycline
//   tiw or t.i.w. : three times a week
//   TMP : trimethoprim
//   top : topical
//   tr : timed-release
//   tsp : teaspoonful
//   tud or TUD : take as directed
//   U : units
//   uad or UAD : use as directed
//   uat or UAT : until all taken
//   ud : as directed
//   ut dict : as directed
//   ung : ointment
//   UTI : urinary tract infection
//   V or v : 5
//   vag : vaginally
//   w/ : with
//   w/o : without
//   WA : while awake
//   WH : wheezing
//   wk : week
//   wt : weight
//   WZ : wheezing
//   X or x : 10
//   X or x : times
//   x 1 RF : times one refill
//   X 3 RF : times three refills
//   XL : extra long
//   XR : extended release

//   Here's what I want you to respond to
//   SIG: ${capitalizedSig}
//   Plain Text:`;
// }

// Here are some examples:
// SIG: 2gtt OU BID
// Plain Text: Two drops in both eyes two times daily

// SIG: 15ml PO Q4° PRN
// Plain Text: 15ml cough syrup, One tablespoon taken orally every 4 hours as needed

// SIG: AAA QHS
// Plain Text: Apply to affected area each night at bedtime

// SIG: 1 tab PO QOD AC
// PLain Text: Take 1 tablet by mouth every other day before meals

// SIG: 10 gtt as bid x 10 days
// Plain Text: 10 gtt as bid x 10 days

// SIG: ss po tid prn
// Plain Text: take a half tablet by mouth 3 times a day as needed
