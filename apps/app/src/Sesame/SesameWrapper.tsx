/* eslint-disable @typescript-eslint/no-unused-vars */
import { CloseIcon, HamburgerIcon } from '@chakra-ui/icons';
import { Button, Container, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { Configuration, FrontendApi, Session } from '@ory/client';
import { usePhoton } from '@photonhealth/react';
import { FC, ReactNode, useEffect, useState } from 'react';

const SesameHeader = ({
  onClick,
  onClickLogout,
  initials,
  logoutUrl,
  loading
}: {
  onClick?: () => void;
  onClickLogout?: () => Promise<void>;
  initials?: string;
  logoutUrl?: string;
  loading: boolean;
}) => (
  <Container
    py="4"
    px="20"
    // flex="1"
    // height=
    bg="white"
    width="100vw"
    maxW="unset"
  >
    <Flex align="center" justifyContent={'space-between'}>
      <HStack spacing={7}>
        <HamburgerIcon />
        <svg
          role="img"
          // title="Sesame Logo Back to homepage"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1556 502"
          height="40"
          width="86.78884462151393"
        >
          <g fill="#5921CF">
            <path d="M115.27,501C44.82,501,6.79,469.1,2.88,414.5c-1.68-22.7-1.12-28.84-1.12-58.29H79.48c0,22.71.56,39.88,1.12,43.56,2.23,16,12.3,27,32.43,27,21.8,0,33.55-13.5,33.55-38,0-41.11-11.19-62.58-44.17-95.09-5.6-5.52-28.52-28.22-40.26-39.26C21.89,215.73.65,184.44.65,118.18.65,47,43.14,1,113.59,1c71,0,101.76,44.17,107.91,100,1.68,10.43,3.35,36.2,3.35,50.31H146.58a360,360,0,0,0-2.24-39.88C142.1,91.8,134.28,79.53,113,79.53c-21.81,0-32.43,11-32.43,36.81,0,33.74,19,57.67,44.17,82.82,11.18,11,32.43,31.9,40.82,40.49,40.25,41.72,61.5,75.46,61.5,141.11,0,76.07-44.73,120.24-111.82,120.24"></path>
            <polygon points="257.84 495.48 257.84 5.91 454.65 5.91 454.65 89.96 339.47 89.96 339.47 208.97 446.82 208.97 446.82 288.73 339.47 288.73 339.47 412.65 455.77 412.65 455.77 495.48 257.84 495.48"></polygon>
            <path d="M594.05,501c-70.46,0-108.48-31.9-112.39-86.5-1.68-22.7-1.12-28.84-1.12-58.29h77.73c0,22.71.55,39.88,1.11,43.56,2.23,16,12.3,27,32.43,27,21.81,0,33.55-13.5,33.55-38,0-41.11-11.18-62.58-44.17-95.09-5.59-5.52-28.52-28.22-40.26-39.26-40.26-38.65-61.51-69.94-61.51-136.2C479.42,47,521.92,1,592.37,1c71,0,101.76,44.17,107.91,100,1.68,10.43,3.35,36.2,3.35,50.31H625.36a360,360,0,0,0-2.24-39.88c-2.24-19.63-10.07-31.9-31.31-31.9-21.81,0-32.43,11-32.43,36.81,0,33.74,19,57.67,44.17,82.82,11.18,11,32.43,31.9,40.82,40.49,40.25,41.72,61.5,75.46,61.5,141.11,0,76.07-44.73,120.24-111.82,120.24"></path>
            <path d="M851.24,159.89c-2.24-25.76-3.92-74.23-3.92-74.23s-2.79,47.86-5,74.23c0,2.46-20.13,144.79-20.13,144.79H868s-16.78-142.33-16.78-144.79M798.68,495.48H717.05L791.41,5.91H906l66.54,489.57H889.82L875.28,377.07H814.33Z"></path>
            <polygon points="1243.36 495.48 1243.92 193.64 1194.72 495.48 1122.59 495.48 1073.39 194.25 1073.95 495.48 999.02 495.48 999.02 5.91 1108.05 5.91 1158.93 314.5 1212.61 5.91 1317.72 5.91 1317.72 495.48 1243.36 495.48"></polygon>
            <polygon points="1357.42 5.91 1357.42 495.48 1555.35 495.48 1555.35 412.66 1439.06 412.66 1439.06 89.96 1554.23 89.96 1554.23 5.91 1357.42 5.91"></polygon>
            <path d="M1492.87,213.15c-14,0-43.37,7-43.37,37.78s29.38,37.77,43.37,37.77c13.52,0,39.63-5.13,62.48-37.77C1532.5,218.28,1506.39,213.15,1492.87,213.15Z"></path>
          </g>
        </svg>
      </HStack>
      {!loading && (
        <HStack align={'center'}>
          {initials && (
            <Flex
              borderRadius={'100'}
              background={'blue'}
              w={'10'}
              h={'10'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <Text align="center" fontWeight={'bold'} color={'white'}>
                {initials}
              </Text>
            </Flex>
          )}
          {!initials && onClick && (
            <Button onClick={onClick} bgColor="#5921cf" color={'white'}>
              Login
            </Button>
          )}
          {initials && logoutUrl && (
            <Button onClick={onClickLogout} variant="ghost">
              <Icon cursor="pointer">
                <CloseIcon />
              </Icon>
            </Button>
          )}
        </HStack>
      )}
    </Flex>
  </Container>
);

const basePath = process.env.REACT_APP_ORY_URL || 'http://clinical-api.tau.health:4000';
const secureBasePath =
  process.env.REACT_APP_ORY_URL_SECURE ||
  process.env.REACT_APP_ORY_URL ||
  'https://clinical-api.tau.health:40444';

const ory = new FrontendApi(
  new Configuration({
    basePath: secureBasePath,
    baseOptions: {
      withCredentials: true
    }
  })
);

export const SesamePage: FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setIsLoading] = useState<boolean>(true);
  const [session, setSession] = useState<Session | undefined>();
  const [logoutUrl, setLogoutUrl] = useState<string | undefined>();

  const { logout } = usePhoton();

  const login = () => window.location.assign(`${basePath}/ui/login`);
  const onClickLogout = logoutUrl
    ? async () => {
        await logout({});
        window.location.assign(logoutUrl);
      }
    : undefined;

  // Second, gather session data, if the user is not logged in, redirect to login
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const data = await ory.toSession();
        const logoutData = await ory.createBrowserLogoutFlow();
        setSession(data.data);
        setLogoutUrl(logoutData.data.logout_url.replace('http://', 'https://'));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        minWidth: '100vw'
      }}
    >
      <SesameHeader
        loading={loading}
        onClick={login}
        initials={
          session &&
          [
            session.identity?.traits?.name?.first?.[0],
            session.identity?.traits?.name?.last?.[0]
          ].join('')
        }
        onClickLogout={onClickLogout}
        logoutUrl={logoutUrl}
      />
      {loading ? null : session ? (
        <>
          {children}
          <photon-auth-button />
        </>
      ) : (
        <>
          <div style={{ textAlign: 'center' }}>Login to get started</div>
          <photon-auth-button />
        </>
      )}
    </div>
  );
};
