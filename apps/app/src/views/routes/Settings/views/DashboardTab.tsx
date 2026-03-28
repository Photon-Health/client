import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertIcon, Box, Center, Spinner, Text } from '@chakra-ui/react';
import { usePhoton } from '@photonhealth/react';

const EMBED_URL = import.meta.env.VITE_METABASE_EMBED_URL;

export const DashboardTab = () => {
  const { getToken } = usePhoton();
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEmbedUrl = useCallback(async () => {
    if (!EMBED_URL) {
      setError('Dashboard embedding is not configured.');
      setLoading(false);
      return;
    }

    try {
      const token = await getToken();
      const res = await fetch(EMBED_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ dashboard_id: 179 })
      });

      if (!res.ok) {
        throw new Error(`Failed to load dashboard (${res.status})`);
      }

      const data = await res.json();
      setIframeUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchEmbedUrl();
  }, [fetchEmbedUrl]);

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <Text>{error}</Text>
      </Alert>
    );
  }

  if (!iframeUrl) {
    return null;
  }

  return (
    <Box borderRadius="lg" bg="bg-surface" boxShadow="base" overflow="hidden" w="full">
      <iframe
        src={iframeUrl}
        title="Partner Value Dashboard"
        width="100%"
        height="800"
        style={{ border: 'none', background: 'transparent' }}
      />
    </Box>
  );
};
