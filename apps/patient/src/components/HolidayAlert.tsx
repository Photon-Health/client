import React from 'react';
import { Card, CardBody, HStack, Icon, Text, VStack } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { FiInfo } from 'react-icons/fi';

const holidays = [
  '2024-05-27', // Memorial Day
  '2024-07-04', // july 4
  '2024-09-02', // labor day
  '2024-11-28', // Thanksgiving
  '2024-12-24', // Christmas Eve
  '2024-12-25', // Christmas
  '2024-12-31', // New Years Eve
  '2025-01-01', // New years
  '2025-05-26', // Memorial Day
  '2025-09-01', // Labor Day
  '2025-07-04', // july 4
  '2025-11-27', // Thanksgiving
  '2025-12-24', // Christmas Eve
  '2025-12-25', // Christmas
  '2025-12-31' // New Years Eve
];

function showHolidayDisclaimer() {
  const today = dayjs();
  const formattedToday = today.format('YYYY-MM-DD');

  // Check if today is a holiday
  if (holidays.includes(formattedToday)) {
    return true;
  }

  const dayOfWeek = today.day(); // 0 (Sunday) to 6 (Saturday)

  // Check if today is Sunday or Saturday
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    const nextMonday = today.day(8); // Get the next Monday
    const isNextMondayHoliday = holidays.includes(nextMonday.format('YYYY-MM-DD'));
    return isNextMondayHoliday; // true if the next Monday is a holiday, false otherwise
  } else {
    return false; // It's not the weekend
  }
}

export const HolidayAlert = ({ children }: { children: React.ReactNode | React.ReactNode[] }) => {
  return showHolidayDisclaimer() ? (
    <VStack align="span" spacing={2} px="2">
      <Card
        bgColor="white"
        border="1px solid"
        borderColor="orange.500"
        borderRadius="2xl"
        background="#FFFAEB"
        mx={{ base: -3, md: undefined }}
        color="orange.500"
      >
        <CardBody p={3}>
          <HStack>
            <Icon color="orange.500" as={FiInfo} fontWeight="bold" />
            <Text fontWeight="semibold">{children}</Text>
          </HStack>
        </CardBody>
      </Card>
    </VStack>
  ) : null;
};
