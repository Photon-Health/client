import {
  Alert,
  Box,
  Container,
  HStack,
  IconButton,
  Image,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spacer,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { useSearchParams } from 'react-router-dom';
import { FiHelpCircle, FiRefreshCw } from 'react-icons/fi';
import { text as t } from '../utils/text';
import { Logo as PhotonLogo } from './Logo';
import { useOrderContext } from '../views/Main';

const PHOTON_PHONE_NUMBER = '+15138663212';

interface NavProps {
  header: string;
  showRefresh: boolean;
}

export const Nav = ({ header, showRefresh = false }: NavProps) => {
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo');

  const { logo } = useOrderContext();

  return (
    <Box as="nav" bg="white" boxShadow={useColorModeValue('sm', 'sm-dark')}>
      {isDemo ? (
        <Alert status="info" variant="subtle" w="full" py={2}>
          <HStack spacing={1} mx="auto">
            <Text fontSize="sm">This is not a real prescription.</Text>
            <Link
              fontSize="sm"
              isExternal
              href="https://www.photon.health/sign-up"
              color="link"
              fontWeight="medium"
              textDecoration="underline"
            >
              Try Photon
            </Link>
          </HStack>
        </Alert>
      ) : null}
      <Container>
        <HStack direction="row" w="full" py={2}>
          {logo ? (
            logo === 'photon' ? (
              <PhotonLogo />
            ) : (
              <Image src={logo} width="auto" height="auto" maxW="60%" maxH="35px" />
            )
          ) : (
            <Text
              mb={0}
              fontSize="xl"
              fontWeight="medium"
              whiteSpace="nowrap"
              textOverflow="ellipsis"
              overflow="hidden"
            >
              {header}
            </Text>
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
          <Menu>
            <MenuButton
              as={IconButton}
              variant="ghost"
              colorScheme="gray"
              aria-label="Contact support"
              icon={<FiHelpCircle size="1.5em" />}
            />
            <MenuList>
              <MenuItem>
                <Link href={`sms:${PHOTON_PHONE_NUMBER}`} style={{ textDecoration: 'none' }}>
                  {t.contactSupport}
                </Link>
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Container>
    </Box>
  );
};

Nav.defaultProps = {
  showRefresh: false,
  orgId: undefined
};
