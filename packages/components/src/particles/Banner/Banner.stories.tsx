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

        {/* wrap the banner in a div of a width of   and make sure the banner fits full width*/}
        <div class="w-96">
          <Banner status="info" name="info-banner-1">
            This is a banner using parent's width
          </Banner>
        </div>
        <Banner status="info" withoutIcon name="info-banner-2">
          This is an info banner without an icon
        </Banner>
        {/* Add a "name" parameter and it will be saved in local storage so it doesn't show again */}
        <Banner status="info" withoutIcon closable>
          <div class="flex flex-col gap-2">
            <div class="text-sm">New Medication Search</div>
            <div class="text-sm text-gray-700">
              You can now search for any treatment in the standard search without using advanced
              search.
            </div>
          </div>
        </Banner>
      </div>
    );
  }
};
