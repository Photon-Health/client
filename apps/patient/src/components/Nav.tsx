import { Alert, Box, Button, Container, HStack, Image, Link, Spacer, Text } from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { text as t } from '../utils/text';
import { useOrderContext } from '../views/Main';
import { Logo as PhotonLogo } from './Logo';
import { patientAnalytics } from '../configs/analytics';

export const Nav = () => {
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo');
  const isProd = import.meta.env.VITE_ENV_NAME === 'photon';

  const { order, flattenedFills, logo, setFaqModalIsOpen } = useOrderContext();

  function getNavigationBannerTitle() {
    if (isDemo) return t.demoTitle;

    const isMultiRx = flattenedFills.length > 1;
    return isMultiRx ? t.fakeRxs : t.fakeRx;
  }

  const showNavigationBanner = isDemo || !isProd;

  return (
    // If you're going to modify z-index here, just double-check that the readyBy buttons
    // and options don't overlap the nav.
    <Box
      as="nav"
      bg="white"
      borderBottom="1px solid"
      borderColor="gray.100"
      borderWidth="2px"
      style={{ position: 'sticky', top: 0, zIndex: 2 }}
    >
      {showNavigationBanner ? (
        <Alert status="info" variant="subtle" w="full" py={2}>
          <HStack spacing={1} mx="auto">
            <Text fontSize="sm">{getNavigationBannerTitle()}</Text>
            <Link
              fontSize="sm"
              isExternal
              href="https://www.photon.health/"
              color="link"
              fontWeight="medium"
              textDecoration="underline"
            >
              {t.learnMore}
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
          <Button
            colorScheme="gray"
            size="sm"
            onClick={() => {
              setFaqModalIsOpen(true);
              patientAnalytics.track('Clicked Help Button', order);
            }}
          >
            Help
          </Button>
        </HStack>
      </Container>
    </Box>
  );
};
