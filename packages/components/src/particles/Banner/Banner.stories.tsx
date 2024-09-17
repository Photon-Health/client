import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps } from 'solid-js';
import Text from '../Text';
import Banner, { BannerProps } from './';

type BannerStory = StoryObj<BannerProps>;

const meta: Meta<ComponentProps<typeof Banner>> = {
  title: 'Banner',
  // @ts-ignore
  component: Banner,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;

export const Default: BannerStory = {
  // @ts-ignore
  render: () => {
    return (
      <div class="max-w-md flex flex-col items-start gap-y-10">
        <Banner status="info" name="info-banner-1">
          This is an info banner
        </Banner>
        <Banner status="info" withoutIcon name="info-banner-2">
          This is an info banner without an icon
        </Banner>
        {/* Add a "name" parameter and it will be saved in local storage so it doesn't show again */}
        <Banner status="info" withoutIcon closable>
          This is a closable info banner
        </Banner>
      </div>
    );
  }
};
