import { Box, Center, CircularProgress, Container } from '@chakra-ui/react';
import { useState } from 'react';
import GraphiQL from 'graphiql';
import { usePhoton } from '@photonhealth/react';
import { Page } from '../components/Page';
import 'graphiql/graphiql.min.css';
import './Playground.css';

interface EditorProps {
  token: string;
}
const Editor = (props: EditorProps) => {
  const { token } = props;
  if (token) {
    const fetcher = async (graphQLParams: any) => {
      const resp = await fetch(process.env.REACT_APP_GRAPHQL_URI as string, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: token
        },
        body: JSON.stringify(graphQLParams),
        credentials: 'same-origin'
      });
      return resp.json().catch(() => resp.text());
    };
    return (
      <GraphiQL
        fetcher={fetcher}
        headers={`{"authorization":"${token}"}`}
        defaultQuery={`
query MyQuery {
  patients {
    id
  }
}
            `}
        isHeadersEditorEnabled={false}
      />
    );
  }
  return (
    <Center padding="100px">
      <CircularProgress isIndeterminate color="green.300" />
    </Center>
  );
};

export const Main = () => {
  const { getToken } = usePhoton();
  const [token, setToken] = useState('');
  getToken().then(setToken);
  return (
    <Box
      py={{ base: '4', md: '8' }}
      px={{ base: '4', md: '8' }}
      borderRadius="lg"
      bg="bg-surface"
      boxShadow="base"
      style={{ padding: 0 }}
    >
      <Container padding={{ base: '0', md: '0' }}>
        <Editor token={token} />
      </Container>
    </Box>
  );
};

export const Playground = () => (
  <Page header="Playground">
    <Main />
  </Page>
);
