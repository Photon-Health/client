import type { Meta, StoryObj } from '@storybook/html';
import { ComponentProps, For } from 'solid-js';
import Text, { TextProps } from '.';

type TextStory = StoryObj<TextProps>;

const meta: Meta<ComponentProps<typeof Text>> = {
  title: 'Text',
  // @ts-ignore
  component: Text,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;

export const Default: TextStory = {
  // @ts-ignore
  render: () => {
    return (
      <div class="max-w-md flex flex-col items-start">
        <Text size="lg">This is large text</Text>
        <Text size="md">This is a text</Text>
        <Text size="sm">This is a small text</Text>
        <Text size="lg" color="gray">
          This is large text
        </Text>
        <Text size="md" color="gray">
          This is a text
        </Text>
        <Text size="sm" color="gray">
          This is a small text
        </Text>
      </div>
    );
  }
};

export const Loading: TextStory = {
  // @ts-ignore
  render: () => {
    return (
      <div class="max-w-md flex flex-col items-start">
        <Text size="lg" loading={true} sampleLoadingText="this is some Loading text">
          This is a text
        </Text>
        <Text
          size="md"
          loading={true}
          sampleLoadingText="Here is some much much longer loading text"
        >
          This is a text
        </Text>
        <Text size="sm" loading={true} sampleLoadingText="shorter">
          This is a text
        </Text>

        <Text size="lg" color="gray" loading={true} sampleLoadingText="this is some Loading text">
          This is a text
        </Text>
        <Text
          size="md"
          color="gray"
          loading={true}
          sampleLoadingText="Here is some much much longer loading text"
        >
          This is a text
        </Text>
        <Text size="sm" color="gray" loading={true} sampleLoadingText="shorter">
          This is a text
        </Text>
      </div>
    );
  }
};

export const SideBySide: TextStory = {
  // @ts-ignore
  render: () => {
    const text = 'This is some text';
    return (
      <div class="max-w-md grid grid-cols-2">
        <div class="flex flex-col items-start">
          <For each={Array(20)}>{() => <Text>{text}</Text>}</For>
        </div>
        <div class="flex flex-col items-start">
          <For each={Array(20)}>{() => <Text loading sampleLoadingText={text} />}</For>
        </div>
      </div>
    );
  }
};
