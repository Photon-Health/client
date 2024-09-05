import { Box, Stack, useBreakpointValue, useColorMode } from '@chakra-ui/react';

export const SplitLayout = (props: any) => {
  const { children } = props;

  const isMobileAndTablet = useBreakpointValue({ base: true, md: true, lg: false });
  const { colorMode } = useColorMode();

  return (
    <Stack
      flexDir={isMobileAndTablet ? 'column' : 'row'}
      gap={5}
      width="100%"
      maxW="1400"
      justify="center"
    >
      <Box
        width={isMobileAndTablet ? '100%' : 'full'}
        alignSelf={isMobileAndTablet ? 'center' : 'flex-start'}
        mt={2}
        px={isMobileAndTablet ? 4 : 0}
      >
        {children[0]}
      </Box>
      {children[1] ? (
        <Box
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          rounded="lg"
          shadow="md"
          minW="400px"
          alignSelf={isMobileAndTablet ? 'center' : 'flex-start'}
          mt={2}
          p={6}
        >
          {children[1]}
        </Box>
      ) : null}
    </Stack>
  );
};
