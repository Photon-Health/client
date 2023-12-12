import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Heading,
  HStack,
  SkeletonText,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';

import { useNavigate } from 'react-router-dom';
import { formatPhone } from '../../../../utils';

interface PatientCardProps {
  loading: boolean;
  patient: any;
}

export const PatientCard = ({ loading, patient }: PatientCardProps) => {
  const navigate = useNavigate();

  const isMobile = useBreakpointValue({ base: true, md: false });

  return (
    <Card bg="bg-surface">
      <CardHeader>
        <HStack w="full" justify="space-between">
          <Heading size="xxs">Patient</Heading>
          <Button onClick={() => navigate('/orders/new')} size="xs">
            Change
          </Button>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <Grid templateColumns={isMobile ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)'} gap={2}>
          <GridItem>
            <Grid
              templateAreas={`"name nameVal" "sexAtBirth sexAtBirthVal" "gender genderVal"`}
              gridTemplateColumns={isMobile ? '85px 1fr' : 'auto 1fr'}
              gap={4}
            >
              <GridItem area="name">
                <Text color="gray.500">Patient</Text>
              </GridItem>
              <GridItem area="nameVal" alignSelf="center">
                {loading ? (
                  <SkeletonText
                    isLoaded={!loading}
                    noOfLines={1}
                    width="120px"
                    alignSelf="center"
                    skeletonHeight="4"
                  />
                ) : (
                  <Text data-dd-privacy="mask">{patient?.name.full}</Text>
                )}
              </GridItem>
              <GridItem area="sexAtBirth" whiteSpace="nowrap">
                <Text color="gray.500">Sex at Birth</Text>
              </GridItem>
              <GridItem area="sexAtBirthVal" alignSelf="center">
                {loading ? (
                  <SkeletonText
                    isLoaded={!loading}
                    noOfLines={1}
                    width="60px"
                    alignSelf="center"
                    skeletonHeight="4"
                  />
                ) : patient?.sex ? (
                  <Text data-dd-privacy="mask">{patient?.sex}</Text>
                ) : (
                  <Text as="i">None</Text>
                )}
              </GridItem>
              <GridItem area="gender">
                <Text color="gray.500">Gender</Text>
              </GridItem>
              <GridItem area="genderVal" alignSelf="center">
                {loading ? (
                  <SkeletonText
                    isLoaded={!loading}
                    noOfLines={1}
                    width="80px"
                    alignSelf="center"
                    skeletonHeight="4"
                  />
                ) : patient?.gender ? (
                  <Text data-dd-privacy="mask">{patient?.gender}</Text>
                ) : (
                  <Text as="i">None</Text>
                )}
              </GridItem>
            </Grid>
          </GridItem>
          <GridItem>
            <Grid
              templateAreas={`"phone phoneVal" "email emailVal"`}
              gridTemplateColumns={isMobile ? '85px 1fr' : 'auto 1fr'}
              gap={4}
            >
              <GridItem area="phone">
                <Text color="gray.500">Phone</Text>
              </GridItem>
              <GridItem area="phoneVal" alignSelf="center" whiteSpace="nowrap">
                {loading ? (
                  <SkeletonText
                    isLoaded={!loading}
                    noOfLines={1}
                    width="110px"
                    alignSelf="center"
                    skeletonHeight="4"
                  />
                ) : patient?.phone ? (
                  <Text data-dd-privacy="mask">{formatPhone(patient.phone)}</Text>
                ) : (
                  <Text as="i">None</Text>
                )}
              </GridItem>
              <GridItem area="email">
                <Text color="gray.500">Email</Text>
              </GridItem>
              <GridItem area="emailVal" alignSelf="center" wordBreak="break-all">
                {loading ? (
                  <SkeletonText
                    isLoaded={!loading}
                    noOfLines={1}
                    width="110px"
                    alignSelf="center"
                    skeletonHeight="4"
                  />
                ) : patient?.email ? (
                  <Text data-dd-privacy="mask">{patient.email}</Text>
                ) : (
                  <Text as="i">None</Text>
                )}
              </GridItem>
            </Grid>
          </GridItem>
        </Grid>
      </CardBody>
    </Card>
  );
};
