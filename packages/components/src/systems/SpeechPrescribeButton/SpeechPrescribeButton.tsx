import { createEffect, createSignal, Show } from 'solid-js';
import Button from '../../particles/Button';
import Icon from '../../particles/Icon';

async function getUserMedia(constraints: { audio: boolean }) {
  if (window.navigator.mediaDevices) {
    return window.navigator.mediaDevices.getUserMedia(constraints);
  }
  throw new Error('getUserMedia is not supported');
}

export const SpeechPrescribeButton = () => {
  const [isRecording, setIsRecording] = createSignal(false);
  const [recording, setRecording] = createSignal<MediaRecorder | undefined>(undefined);
  const [audioUrl, setAudioUrl] = createSignal<string | undefined>(undefined);

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
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      }
    };
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
      <Button
        onClick={() => setIsRecording(!isRecording())}
        variant={isRecording() ? 'danger' : 'primary'}
      >
        <Show when={!isRecording()} fallback={<Icon name="stop" size="sm" />}>
          <Icon name="microphone" size="sm" />
        </Show>
        {!isRecording() ? 'Record Prescription' : 'Stop recording'}
      </Button>
      <Show when={audioUrl()}>
        <audio controls src={audioUrl()} />
      </Show>
    </>
  );
};
