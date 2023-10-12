import {
  Avatar,
  Box,
  ButtonGroup,
  Container,
  Flex,
  HStack,
  LinkBox,
  IconButton,
  Tooltip,
  useColorModeValue,
  useBreakpointValue,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  useDisclosure,
  Divider,
  Stack
} from '@chakra-ui/react';

import { FiShoppingCart, FiSettings, FiUsers, FiMenu, FiHelpCircle } from 'react-icons/fi';
import { TbPrescription } from 'react-icons/tb';

import { Link as RouterLink } from 'react-router-dom';
import { usePhoton } from '@photonhealth/react';
import { Logo } from './Logo';
import { NavButton } from './NavButton';
import { UserProfile } from './UserProfile';

export const Nav = () => {
  const { user } = usePhoton();
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const { isOpen, onClose, onToggle } = useDisclosure();

  return (
    <Box as="nav" bg="bg-surface" py="3" boxShadow={useColorModeValue('sm', 'sm-dark')}>
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
                {/* <NavButton label="" icon={FiSearch} link="/search" /> */}
                <NavButton label="" icon={FiSettings} link="/settings" />
                <NavButton label="" icon={FiHelpCircle} link="/support" />
              </ButtonGroup>
              <Tooltip label={user?.name} aria-label={user?.name}>
                <Avatar
                  name={typeof user?.name === 'string' ? user.name : ''}
                  src={typeof user?.image === 'string' ? user.image : ''}
                  boxSize="10"
                />
              </Tooltip>
            </HStack>
          ) : (
            <>
              <IconButton aria-label="Options" icon={<FiMenu />} onClick={onToggle} />
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
                      <Stack justify="space-between" spacing="1">
                        <Stack spacing={{ base: '5', sm: '6' }} shouldWrapChildren>
                          <Logo />
                          <Stack spacing="1">
                            <NavButton
                              label="Prescriptions"
                              icon={TbPrescription}
                              link="/prescriptions"
                              onClick={onToggle}
                            />
                            <NavButton
                              label="Patients"
                              icon={FiUsers}
                              link="/patients"
                              onClick={onToggle}
                            />
                            <NavButton
                              label="Orders"
                              icon={FiShoppingCart}
                              link="/orders"
                              onClick={onToggle}
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
                            />
                            <NavButton
                              label="Settings"
                              icon={FiSettings}
                              link="/settings"
                              onClick={onToggle}
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
