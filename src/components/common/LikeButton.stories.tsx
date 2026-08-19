import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SessionProvider } from 'next-auth/react';
import LikeButton from './LikeButton';

const meta: Meta<typeof LikeButton> = {
  title: 'Common/LikeButton',
  component: LikeButton,
  tags: ['autodocs'],
  argTypes: {
    initialIsLiked: { control: 'boolean' },
    initialLikesCount: { control: 'number' },
  },
};

export default meta;
type Story = StoryObj<typeof LikeButton>;

const mockSession = {
  user: { id: 'user-1', name: '테스트 사용자', email: 'test@test.com', image: null },
  expires: new Date(Date.now() + 86400000).toISOString(),
};

export const Liked: Story = {
  args: {
    placeId: 'place-1',
    initialIsLiked: true,
    initialLikesCount: 42,
  },
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession as any}>
        <Story />
      </SessionProvider>
    ),
  ],
};

export const NotLiked: Story = {
  args: {
    placeId: 'place-1',
    initialIsLiked: false,
    initialLikesCount: 41,
  },
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession as any}>
        <Story />
      </SessionProvider>
    ),
  ],
};

export const Unauthenticated: Story = {
  args: {
    placeId: 'place-1',
    initialIsLiked: false,
    initialLikesCount: 15,
  },
  decorators: [
    (Story) => (
      <SessionProvider session={null}>
        <Story />
      </SessionProvider>
    ),
  ],
};

export const ForRoute: Story = {
  args: {
    routeId: 'route-1',
    initialIsLiked: true,
    initialLikesCount: 128,
  },
  decorators: [
    (Story) => (
      <SessionProvider session={mockSession as any}>
        <Story />
      </SessionProvider>
    ),
  ],
};
