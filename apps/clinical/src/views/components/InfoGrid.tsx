import { Grid, GridItem, Text } from '@chakra-ui/react';
import React from 'react';

interface InfoGridProps {
  name: string;
  children: React.ReactNode;
}

function InfoGrid({ name, children }: InfoGridProps) {
  return (
    <Grid
      templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(6, 1fr)' }}
      gap={{ base: 0, md: 4 }}
      w="100%"
      mb={{ base: 2, md: 0 }}
    >
      <GridItem colSpan={1}>
        <Text fontSize="sm" color="gray.500" style={{ lineHeight: '24px' }}>
          {name}
        </Text>
      </GridItem>
      <GridItem colSpan={5}>{children}</GridItem>
    </Grid>
  );
}

export default InfoGrid;
