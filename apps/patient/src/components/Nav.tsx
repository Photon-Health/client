import {
  Alert,
  Box,
  Button,
  Container,
  HStack,
  IconButton,
  Image,
  Link,
  Spacer,
  Text
} from '@chakra-ui/react';
import { FiRefreshCw } from 'react-icons/fi';
import { useSearchParams } from 'react-router-dom';
import { text as t } from '../utils/text';
import { useOrderContext } from '../views/Main';
import { Logo as PhotonLogo } from './Logo';

interface NavProps {
  showRefresh?: boolean;
}

export const Nav = ({ showRefresh = false }: NavProps) => {
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo');
  const isProd = process.env.REACT_APP_ENV_NAME === 'photon';

  const { flattenedFills, logo, setFaqModalIsOpen } = useOrderContext();

  const isMultiRx = flattenedFills.length > 1;

  return (
    // If you're going to modify z-index here, just double-check that the readyBy buttons
    // and options don't overlap the nav.
    <Box as="nav" bg="white" shadow="sm" style={{ position: 'sticky', top: 0, zIndex: 2 }}>
      {isDemo || !isProd ? (
        <Alert status="info" variant="subtle" w="full" py={2}>
          <HStack spacing={1} mx="auto">
            <Text fontSize="sm">{isMultiRx ? t.fakeRxs : t.fakeRx}</Text>
            <Link
              fontSize="sm"
              isExternal
              href="https://www.photon.health/sign-up"
              color="link"
              fontWeight="medium"
              textDecoration="underline"
            >
              {t.tryPhoton}
            </Link>
          </HStack>
        </Alert>
      ) : null}
      <Container>
        <HStack direction="row" w="full" py={2}>
          {logo ? (
            <Image src={logo} width="auto" height="auto" maxW="60%" maxH="35px" />
          ) : (
            <PhotonLogo />
          )}
          <Spacer />
          {showRefresh ? (
            <IconButton
              variant="ghost"
              aria-label="Refresh"
              icon={<FiRefreshCw size="1.5em" />}
              onClick={() => window.location.reload()}
            />
          ) : null}

          <Button colorScheme="gray" size="sm" onClick={() => setFaqModalIsOpen(true)}>
            Help
          </Button>
        </HStack>
      </Container>
    </Box>
  );
};
