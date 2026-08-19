import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import RouteToggle from './RouteToggle';

const meta: Meta<typeof RouteToggle> = {
  title: 'Common/RouteToggle',
  component: RouteToggle,
  tags: ['autodocs'],
  argTypes: {
    routeView: { control: 'radio', options: ['districts', 'routes'] },
  },
};

export default meta;
type Story = StoryObj<typeof RouteToggle>;

export const Districts: Story = {
  args: {
    routeView: 'districts',
    onToggleClick: fn(),
  },
};

export const Routes: Story = {
  args: {
    routeView: 'routes',
    onToggleClick: fn(),
  },
};
