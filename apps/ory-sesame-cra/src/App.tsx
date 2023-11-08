/* eslint-disable @typescript-eslint/no-unused-vars */
// import logo from "./logo.svg"
// import "./App.css"

import { Box, Button, Flex, Input } from '@chakra-ui/react';
import { PhotonClient, PhotonProvider } from '@photonhealth/react';
import { ChangeEventHandler, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import trimCanvas from 'trim-canvas';
import { SesamePage } from './SesameWrapper';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'photon-client': unknown;
      'photon-prescribe-workflow': unknown;
      'photon-auth-wrapper': unknown;
    }
  }
}

const domain = 'auth.boson.health';
const clientId = 'WoOY2q0gtrFuffz5WUQWlYiJ2iPGwWlp';
const redirectURI = window.location.origin;
const audience = 'https://api.boson.health';
const uri = 'https://api.boson.health/graphql';

const client = new PhotonClient({
  domain,
  clientId,
  redirectURI,
  audience,
  uri
});

const DrawCanvas = ({ setData }: { setData: (data: string) => void }) => {
  const ref = useRef<SignatureCanvas | null>(null);

  const onEnd = () => {
    const data = ref.current?.getTrimmedCanvas().toDataURL();
    if (data) {
      setData(data);
    }
  };

  return <SignatureCanvas ref={ref} onEnd={onEnd} />;
};

// return a trimmed copy of the canvas
const getTrimmedCanvas = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  // copy the canvas
  const copy = document.createElement('canvas');
  copy.width = canvas.width;
  copy.height = canvas.height;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  copy.getContext('2d')!.drawImage(canvas, 0, 0);
  // then trim it
  return trimCanvas(copy);
};

const GenerateCanvas = ({ setData }: { setData: (data: string) => void }) => {
  const ref = useRef<HTMLCanvasElement>(null);

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!ref.current) return;
    const ctx = ref.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, ref.current.width, ref.current.height);
    ctx.font = '48px cursive';

    ctx.textBaseline = 'hanging';
    ctx.fillText(event.target.value, 0, 12);
    setData(getTrimmedCanvas(ref.current).toDataURL());
  };

  return (
    <div>
      <canvas ref={ref} width="500" height="100" />
      <Input onChange={onChange} />
    </div>
  );
};

const SignatureComponent = () => {
  const [isEditing, setIsEditing] = useState(true);
  const [useDraw, setUseDraw] = useState(false);
  const [data, setInnerData] = useState<string>('');
  const [date, setDate] = useState<string>('');

  const setData = (data: string) => {
    setInnerData(data);
    setDate(new Date().toLocaleString());
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        border: '1px solid black'
      }}
    >
      {isEditing && (
        <div style={{ display: 'flex', width: '100%' }}>
          <Button onClick={() => setUseDraw(false)}>Generate</Button>
          <Button onClick={() => setUseDraw(true)}>Draw</Button>
        </div>
      )}
      {isEditing ? (
        useDraw ? (
          <DrawCanvas setData={setData} />
        ) : (
          <GenerateCanvas setData={setData} />
        )
      ) : (
        <div>
          <img src={data} />
          <div>{date}</div>
        </div>
      )}
      <Button
        onClick={() => {
          if (!isEditing) {
            setData('');
          }
          setIsEditing(!isEditing);
        }}
      >
        {isEditing ? 'Save' : 'Edit'}
      </Button>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <Flex w="100vw" h="100vh" justifyContent={'center'} p="50">
        <SignatureComponent />
      </Flex>
      {/* <PhotonProvider client={client}>
        <SesamePage>
          <Flex pr="10" h="100%" flexGrow={'1'}>
            <Box width="20%" bg={'green'}></Box>
            <Box flex="1">
              <photon-client
                id={clientId}
                org="org_qzo8REINlFXB5v24"
                domain={domain}
                audience={audience}
                uri={uri}
                auto-login="true"
              >
                <photon-prescribe-workflow />
              </photon-client>
            </Box>
          </Flex>
        </SesamePage>
      </PhotonProvider> */}
    </div>
  );
}

export default App;
