import { createEffect, createSignal, Show } from 'solid-js';
import Button from '../../particles/Button';
import Icon from '../../particles/Icon';
import OpenAI from 'openai';
import Spinner from '../../particles/Spinner';
import { formatRxPrompt } from './formatRxPrompt';
import { DraftPrescription } from '../DraftPrescriptions';
import { gql } from '@apollo/client';
import { usePhotonClient } from '../SDKProvider';
import { createQuery } from '../../utils/createQuery';

const SpeechGetCatalogsQuery = gql`
  query SpeechGetCatalogs {
    catalogs {
      id
      treatments {
        id
        name
      }
    }
  }
`;

const openai = new OpenAI({
  apiKey: '', // DO NOT COMMIT
  dangerouslyAllowBrowser: true // VERY DANGEROUS
});

async function getUserMedia(constraints: { audio: boolean }) {
  if (window.navigator.mediaDevices) {
    return window.navigator.mediaDevices.getUserMedia(constraints);
  }
  throw new Error('getUserMedia is not supported');
}

export const SpeechPrescribeButton = (props: {
  setDraftPrescription: (draft: DraftPrescription) => void;
}) => {
  const client = usePhotonClient();
  const [isRecording, setIsRecording] = createSignal(false);
  const [recording, setRecording] = createSignal<MediaRecorder | undefined>(undefined);
  const [isGeneratingRx, setIsGeneratingRx] = createSignal(false);
  const data = createQuery(SpeechGetCatalogsQuery, {
    client: client!.apollo
  });

  const startRecording = async () => {
    const stream = await getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    setRecording(rec);

    const chunks: Blob[] = [];
    rec.start();

    rec.ondataavailable = (e) => {
      chunks.push(e.data);
      if (rec.state === 'inactive') {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        generateRx(blob);
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  };

  const generateRx = async function (audioBlob: Blob) {
    setIsGeneratingRx(true);
    let transcript = '';
    const file = new File([audioBlob], 'audio.webm', {
      type: audioBlob.type,
      lastModified: new Date().getTime()
    });

    try {
      const transcription = await openai.audio.transcriptions.create({
        model: 'whisper-1',
        file
      });
      transcript = transcription.text;
      console.log('transcript', transcript);
    } catch (error) {
      console.error('Error uploading audio for transcription:', error);
      throw error;
    }

    if (transcript) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'user',
              content: formatRxPrompt(transcript)
            }
          ]
        });

        console.log('completion', completion);
        const message = completion.choices[0]?.message?.content || '';
        const openDraft: DraftPrescription = JSON.parse(message.replace(/`/g, '').trim());
        console.log('Parsed JSON response:', openDraft.name, data()?.catalogs?.[0]?.treatments);
        const treatment = data()?.catalogs?.[0]?.treatments.find((treatment) => {
          return treatment.name.toLowerCase().includes(openDraft.name.toLowerCase());
        });

        console.log('treatment', {
          ...openDraft,
          treatment: treatment
        });
        props.setDraftPrescription({
          ...openDraft,
          treatment: treatment
        });
      } catch (error) {
        console.error('Error generating prescription:', error);
        throw error;
      }
    }
    setIsGeneratingRx(false);
  };

  createEffect(() => {
    if (isRecording()) {
      startRecording();
    } else {
      recording()?.stop();
    }
  });

  return (
    <>
      <Show
        when={!isGeneratingRx()}
        fallback={
          <Button disabled variant="naked">
            <Spinner size="sm" />
            Generating...
          </Button>
        }
      >
        <Button onClick={() => setIsRecording(!isRecording())} variant={'naked'}>
          <Show when={!isRecording()} fallback={<Icon name="stop" size="sm" />}>
            <Icon name="microphone" size="sm" />
          </Show>
          {!isRecording() ? 'Record Prescription' : 'Stop recording'}
        </Button>
      </Show>
    </>
  );
};
