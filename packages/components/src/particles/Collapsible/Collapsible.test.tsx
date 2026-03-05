import { render, screen } from '@solidjs/testing-library';
import { test, vi } from 'vitest';
import '@testing-library/jest-dom';
import Collapsible from './index';
import userEvent from '@testing-library/user-event';
import { createSignal } from 'solid-js';

test('collapsible is closed by default', () => {
  render(() => (
    <Collapsible openLabel="Hide" closedLabel="Show">
      <div>Content</div>
    </Collapsible>
  ));

  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
  expect(screen.getByText('Content')).not.toBeVisible();
});

test('collapsible opens when button is clicked', async () => {
  const user = userEvent.setup();

  render(() => (
    <Collapsible openLabel="Hide" closedLabel="Show">
      <div>Content</div>
    </Collapsible>
  ));

  await user.click(screen.getByRole('button'));

  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Content')).toBeVisible();
});

test('collapsible calls onOpenChange when toggled', async () => {
  const onOpenChange = vi.fn();
  const user = userEvent.setup();

  render(() => (
    <Collapsible openLabel="Hide" closedLabel="Show" onOpenChange={onOpenChange}>
      <div>Content</div>
    </Collapsible>
  ));

  await user.click(screen.getByRole('button'));
  expect(onOpenChange).toHaveBeenCalledWith(true);

  await user.click(screen.getByRole('button'));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

test('collapsible respects defaultOpen prop', () => {
  render(() => (
    <Collapsible openLabel="Hide" closedLabel="Show" defaultOpen>
      <div>Content</div>
    </Collapsible>
  ));

  expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Content')).toBeVisible();
});

test('collapsible shows correct label based on open state', async () => {
  const user = userEvent.setup();

  render(() => (
    <Collapsible openLabel="Hide" closedLabel="Show">
      <div>Content</div>
    </Collapsible>
  ));

  expect(screen.getByText('Show')).toBeInTheDocument();

  await user.click(screen.getByRole('button'));
  expect(screen.getByText('Hide')).toBeInTheDocument();
});

describe('controlled component', () => {
  test('isOpen=true shows content', () => {
    render(() => (
      <Collapsible openLabel="Hide" closedLabel="Show" isOpen={true}>
        <div>Content</div>
      </Collapsible>
    ));

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Content')).toBeVisible();
  });

  test('isOpen=false hides content', () => {
    render(() => (
      <Collapsible openLabel="Hide" closedLabel="Show" isOpen={false}>
        <div>Content</div>
      </Collapsible>
    ));

    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Content')).not.toBeVisible();
  });

  test('isOpen prop reactively controls visibility', () => {
    const [isOpen, setIsOpen] = createSignal(false);

    render(() => (
      <Collapsible openLabel="Hide" closedLabel="Show" isOpen={isOpen()}>
        <div>Content</div>
      </Collapsible>
    ));

    expect(screen.getByText('Content')).not.toBeVisible();
    setIsOpen(true);
    expect(screen.getByText('Content')).toBeVisible();
  });
});

describe('alwaysOpen', () => {
  test('alwaysOpen overrides internal open state', () => {
    render(() => (
      <Collapsible openLabel="Hide" closedLabel="Show" alwaysOpen>
        <div>Content</div>
      </Collapsible>
    ));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Content')).toBeVisible();
  });

  test('alwaysOpen overrides isOpen=false', () => {
    render(() => (
      <Collapsible openLabel="Hide" closedLabel="Show" alwaysOpen isOpen={false}>
        <div>Content</div>
      </Collapsible>
    ));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('Content')).toBeVisible();
  });
});
