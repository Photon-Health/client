import {
  Avatar,
  Box,
  ButtonGroup,
  Container,
  Divider,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  Flex,
  HStack,
  Icon,
  IconButton,
  LinkBox,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Stack,
  Text,
  Tooltip,
  VStack,
  useBreakpointValue,
  useColorModeValue,
  useDisclosure,
  useTheme
} from '@chakra-ui/react';

import {
  FiHelpCircle,
  FiLogOut,
  FiMenu,
  FiSettings,
  FiShoppingCart,
  FiUsers,
  FiRepeat
} from 'react-icons/fi';
import { TbPrescription } from 'react-icons/tb';

import { usePhoton } from '@photonhealth/react';
import { useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Logo } from './Logo';
import { NavButton } from './NavButton';
import { UserProfile } from './UserProfile';

import { graphql } from 'apps/app/src/gql';
import { useQuery } from '@apollo/client';

const orgSettingsQuery = graphql(/* GraphQL */ `
  query NavOrgSettingsQuery {
    organization {
      settings {
        providerUx {
          federatedAuth
        }
      }
    }
  }
`);

export const Nav = () => {
  const theme = useTheme();
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const { isOpen, onClose, onToggle } = useDisclosure();
  const { user, logout, getOrganization, getOrganizations, clearOrganization, clinicalClient } =
    usePhoton();
  const { organization } = getOrganization();
  const { organizations } = getOrganizations();

  const { data } = useQuery(orgSettingsQuery, { client: clinicalClient });
  const federated = data?.organization?.settings?.providerUx?.federatedAuth ?? false;

  const onLogout = useCallback(() => {
    localStorage.removeItem('previouslyAuthed');
    logout({ returnTo: window.location.href, federated });
  }, [logout, federated]);

  const onSwitchOrganization = useCallback(() => {
    clearOrganization();
  }, [clearOrganization]);

  return (
    <Box as="nav" bg="navy" py="3">
      <Container>
        <Flex justifyContent="space-between">
          <HStack>
            <LinkBox as={RouterLink} to="/">
              <Logo pr="4" />
            </LinkBox>
            {isDesktop && (
              <ButtonGroup spacing="1">
                <NavButton label="Prescriptions" icon={TbPrescription} link="/prescriptions" />
                <NavButton label="Patients" icon={FiUsers} link="/patients" />
                <NavButton label="Orders" icon={FiShoppingCart} link="/orders" />
              </ButtonGroup>
            )}
          </HStack>
          {isDesktop ? (
            <HStack spacing="4">
              <ButtonGroup variant="ghost" spacing="1">
                <NavButton label="" icon={FiHelpCircle} link="/support" />
              </ButtonGroup>
              <Menu autoSelect={false}>
                <MenuButton>
                  <Tooltip label={user?.name} aria-label={user?.name}>
                    <Avatar
                      name={typeof user?.name === 'string' ? user.name : ''}
                      src={typeof user?.image === 'string' ? user.image : ''}
                      boxSize="10"
                    />
                  </Tooltip>
                </MenuButton>
                <MenuList py="0">
                  <VStack alignItems={'start'} py={'2.5'} px={'3'} roundedTop={'md'} gap={'1'}>
                    <Text fontWeight="medium" fontSize="md">
                      {user?.name}
                    </Text>
                    <Text color="muted" fontSize="sm">
                      {user?.email}
                    </Text>
                    <Text color="muted" fontSize="sm">
                      {organization?.name && organization.name}
                    </Text>
                  </VStack>
                  <MenuDivider my={0} py={0} />
                  <MenuItem
                    as={RouterLink}
                    to="/settings"
                    icon={<Icon as={FiSettings} boxSize="4" color={theme.colors.slate['500']} />}
                    fontSize={'sm'}
                  >
                    Settings
                  </MenuItem>
                  <MenuItem
                    icon={<Icon as={FiRepeat} boxSize="4" color={theme.colors.slate['500']} />}
                    fontSize={'sm'}
                    onClick={onSwitchOrganization}
                    hidden={!organizations || organizations.length <= 1}
                  >
                    Switch Organization
                  </MenuItem>
                  <MenuDivider my={0} py={0} />
                  <MenuItem
                    textColor="red"
                    onClick={onLogout}
                    fontSize={'sm'}
                    icon={<Icon as={FiLogOut} boxSize="4" />}
                    roundedBottom={'md'}
                  >
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
          ) : (
            <>
              <IconButton
                aria-label="Options"
                colorScheme="gray"
                icon={<FiMenu />}
                onClick={onToggle}
              />
              <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                  <Flex as="section" minH="100vh">
                    <Flex
                      flex="1"
                      bg="bg-surface"
                      overflowY="auto"
                      boxShadow={useColorModeValue('sm', 'sm-dark')}
                      maxW={{ base: 'full', sm: 'xs' }}
                      py={{ base: '6', sm: '8' }}
                      px={{ base: '4', sm: '6' }}
                    >
                      <Stack justify="space-between" align="center" spacing="1">
                        <Stack spacing={{ base: '5', sm: '6' }} shouldWrapChildren>
                          <Logo bgIsWhite />
                          <Stack spacing="1">
                            <NavButton
                              label="Prescriptions"
                              icon={TbPrescription}
                              link="/prescriptions"
                              onClick={onToggle}
                              bgIsWhite
                            />
                            <NavButton
                              label="Patients"
                              icon={FiUsers}
                              link="/patients"
                              onClick={onToggle}
                              bgIsWhite
                            />
                            <NavButton
                              label="Orders"
                              icon={FiShoppingCart}
                              link="/orders"
                              onClick={onToggle}
                              bgIsWhite
                            />
                          </Stack>
                        </Stack>
                        <Stack spacing={{ base: '5', sm: '6' }}>
                          <Stack spacing="1">
                            <NavButton
                              label="Support"
                              icon={FiHelpCircle}
                              link="/support"
                              onClick={onToggle}
                              bgIsWhite
                            />
                            <NavButton
                              label="Settings"
                              icon={FiSettings}
                              link="/settings"
                              onClick={onToggle}
                              bgIsWhite
                            />
                            <NavButton
                              label="Switch Organization"
                              onClick={onSwitchOrganization}
                              icon={FiRepeat}
                              bgIsWhite
                              link=""
                              hidden={!organizations || organizations.length <= 1}
                            />
                            <NavButton
                              label="Logout"
                              onClick={onLogout}
                              textColor="red"
                              iconColor="red"
                              icon={FiLogOut}
                              bgIsWhite
                              link=""
                            />
                          </Stack>
                          {/* <Onboarding/> */}
                          <Divider />
                          <UserProfile />
                        </Stack>
                      </Stack>
                    </Flex>
                  </Flex>
                </DrawerContent>
              </Drawer>
            </>
          )}
        </Flex>
      </Container>
    </Box>
  );
};
