import { ReactNode } from 'react';
import { StatsigProvider, useClientAsyncInit } from '@statsig/react-bindings';
import { StatsigAutoCapturePlugin } from '@statsig/web-analytics';
import { StatsigSessionReplayPlugin } from '@statsig/session-replay';

export const StatsigWrapper = ({
  clientId,
  userId,
  children
}: {
  clientId: string;
  userId: string;
  children: ReactNode;
}) => {
  const { client } = useClientAsyncInit(
    clientId,
    { userID: userId },
    {
      plugins: [new StatsigAutoCapturePlugin(), new StatsigSessionReplayPlugin()]
    }
  );

  return <StatsigProvider client={client}>{children}</StatsigProvider>;
};
