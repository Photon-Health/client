import { ChakraProvider } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { ScrollRestoration, useNavigate, useSearchParams } from 'react-router-dom';
import { setAuthHeader } from '../configs/graphqlClient';
import { TokenPayload } from './Main';

export function InfoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tokenPayload, setTokenPayload] = useState<TokenPayload>();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setAuthHeader(tokenParam);
      try {
        const base64TokenData = tokenParam?.split('.')?.[1];
        const tokenData = base64TokenData ? JSON.parse(atob(base64TokenData)) : undefined;
        setTokenPayload(tokenData);
        navigate('/info', { replace: true });
      } catch (err) {
        console.error('failed to parse token data', { err });
        navigate('/no-match', { replace: true });
      }
    }
  }, [navigate, searchParams]);

  return (
    <ChakraProvider>
      <ScrollRestoration />
      <h1>Info</h1>
      <p>{JSON.stringify(tokenPayload)}</p>
    </ChakraProvider>
  );
}
