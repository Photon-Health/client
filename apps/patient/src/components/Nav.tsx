import { useState, useEffect } from 'react';
import {
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
import { FiHelpCircle, FiRefreshCw } from 'react-icons/fi';
import t from '../utils/text.json';
import { Logo as PhotonLogo } from './Logo';
import { getSettings } from '@client/settings';

const settings = getSettings(process.env.REACT_APP_ENV_NAME);

interface NavProps {
  header: string;
  showRefresh: boolean;
  orgId?: string;
}

export const Nav = ({ header, showRefresh, orgId }: NavProps) => {
  const [logo, setLogo] = useState(undefined);

  const fetchLogo = async (fileName: string) => {
    if (fileName === 'photon') {
      setLogo('photon');
    } else {
      try {
        const response = await import(`../assets/${fileName}`);
        setLogo(response.default);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    if (orgId) {
      const theme = orgId in settings ? settings[orgId] : settings.default;
      fetchLogo(theme.logo);
    }
  }, [orgId]);

  return (
    <Box as="nav" bg="white" boxShadow={useColorModeValue('sm', 'sm-dark')}>
      <Container>
        <HStack direction="row" w="full" py={2}>
          {logo ? (
            logo === 'photon' ? (
              <PhotonLogo />
            ) : (
              <Image src={logo} width="auto" height="auto" maxW="45%" maxH="35px" />
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
                <Link href="sms:+15138663212" style={{ textDecoration: 'none' }}>
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
