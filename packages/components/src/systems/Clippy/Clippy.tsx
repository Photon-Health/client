// import gif from same folder
import { createSignal, Match, Show, Switch } from 'solid-js';
import Button from '../../particles/Button';
import chillin from './clippyChillin.gif';
import searchin from './clippySearchin.gif';
import eggman from './eggman.png';

import OpenAI from 'openai';
import { formatCalculations, formatDosage } from './formatDosage';

const openai = new OpenAI({
  apiKey: '', // DO NOT COMMIT
  dangerouslyAllowBrowser: true // VERY DANGEROUS
});

export const Clippy = (props: { setDosage: (dose: any) => void }) => {
  const [step, setStep] = createSignal(0);
  const [isEggman, setIsEggman] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal<boolean>(false);
  const [isTalking, setIsTalking] = createSignal<boolean>(false);
  const [text, setText] = createSignal('');
  const [calculations, setCalculations] = createSignal<string>('');

  const generateDosage = async (text: string) => {
    setIsLoading(true);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'user',
          content: formatCalculations(text)
        }
      ]
    });
    const message = completion.choices[0]?.message?.content || '';
    console.log('message', message);
    setCalculations(message);
    setIsLoading(false);
    setStep(2);
  };

  const generateData = async (text: string) => {
    setIsLoading(true);
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'user',
          content: formatDosage(text)
        }
      ]
    });
    const message = completion.choices[0]?.message?.content || '';
    const openDraft = JSON.parse(message.replace(/`/g, '').trim());
    console.log('message', openDraft);
    props.setDosage(openDraft);
    setIsLoading(false);
    setIsTalking(false);
    setStep(0);
  };

  return (
    <div class="fixed bottom-10 right-10 flex flex-col items-end">
      <div
        class={`${
          isTalking() ? 'animate-enter' : 'animate-leave'
        } bg-white max-w-[300px] mr-14 mb-5 py-4 px-6 border-solid border-2 border-gray-200 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl`}
      >
        <Switch>
          <Match when={step() === 0}>
            <div>What up Doc? Can I help you with anything?</div>
            <div class="flex flex-col gap-2 mt-4">
              <Button variant="secondary" size="sm" onClick={() => setStep(1)}>
                Calculate a Dosage
              </Button>
              <Button variant="secondary" size="sm">
                Add a New Medication
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setIsEggman(true)}>
                Feed Eggs
              </Button>
            </div>
          </Match>
          <Match when={step() === 1}>
            <div>
              <div>Bad at math?? Lol, I won't tell your manager!</div>

              <div class="mt-2">
                Give me some info about the medication and patient so I can assist you:
              </div>
            </div>
            <div class="mt-4">
              <textarea
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6 mb-4"
                title="title"
                placeholder="..."
                value={text()}
                onInput={(e) => setText(e.currentTarget.value)}
              />

              <Button
                onClick={() => {
                  generateDosage(text());
                }}
                loading={isLoading()}
              >
                Submit
              </Button>
            </div>
          </Match>
          <Match when={step() === 2}>
            <div>
              <div class="mt-4">{calculations()}</div>
            </div>
            <div class="mt-4">
              <Button
                onClick={() => {
                  generateData(text());
                }}
                loading={isLoading()}
              >
                Add to Prescription
              </Button>
            </div>
          </Match>
        </Switch>
      </div>
      <div onClick={() => setIsTalking(!isTalking())}>
        <Show
          when={!isEggman()}
          fallback={() => (
            <div style={{ height: '88px', width: '90px' }}>
              <img src={eggman} alt="clippy" class="cursor-pointer" />
            </div>
          )}
        >
          <Show
            when={!isLoading()}
            fallback={<img src={searchin} alt="clippy" class="cursor-pointer" />}
          >
            <img src={chillin} alt="clippy" class="cursor-pointer" />
          </Show>
        </Show>
      </div>
    </div>
  );
};
