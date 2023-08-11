import { Center, CircularProgress } from '@chakra-ui/react';
import { useState } from 'react';
import GraphiQL from 'graphiql';
import { usePhoton } from '@photonhealth/react';

import 'graphiql/graphiql.min.css';
import './Playground.css';

const defaultQuery = `
query MyQuery {
  patients {
    id
  }
}
`;

export const Playground = () => {
  const { getToken } = usePhoton();
  const [token, setToken] = useState('');
  getToken().then(setToken);

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
      <div style={{ height: 'calc(100vh - 64px)' }}>
        <GraphiQL
          fetcher={fetcher}
          headers={`{"authorization":"${token}"}`}
          defaultQuery={defaultQuery}
          isHeadersEditorEnabled={false}
        />
      </div>
    );
  }

  return (
    <Center padding="100px">
      <CircularProgress isIndeterminate color="green.300" />
    </Center>
  );
};
