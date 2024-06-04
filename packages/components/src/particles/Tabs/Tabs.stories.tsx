import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps, createSignal } from 'solid-js';
import Tabs, { TabsProps } from '.';

type TabsStory = StoryObj<TabsProps<any>>;

const meta: Meta<ComponentProps<typeof Tabs>> = {
  title: 'Tabs',
  // @ts-ignore
  component: Tabs,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;

export const Default: TabsStory = {
  // @ts-ignore
  render: () => {
    const tabs = ['Send to Patient', 'Local Pickup', 'Mail Order'];
    const [tab, setTab] = createSignal(tabs[0]);
    return <Tabs tabs={tabs} activeTab={tab()} setActiveTab={(newTab: string) => setTab(newTab)} />;
  }
};
