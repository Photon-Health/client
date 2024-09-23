import dayjs from 'dayjs';

export const roundUpTo15MinInterval = (pharmacyEstimatedReadyAt: Date): Date => {
  const estimatedReadyAtAsDayJs = dayjs(pharmacyEstimatedReadyAt);
  const minutes = estimatedReadyAtAsDayJs.minute();
  const roundedMinutes = Math.ceil(minutes / 15) * 15;
  if (roundedMinutes >= 60) {
    return estimatedReadyAtAsDayJs.add(1, 'hour').minute(0).toDate();
  } else {
    return estimatedReadyAtAsDayJs.minute(roundedMinutes).toDate();
  }
};
