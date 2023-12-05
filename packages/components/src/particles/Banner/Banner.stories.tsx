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
        <Banner status="info" text="This is an info banner" />
      </div>
    );
  }
};
