import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Avatar, AvatarImage, AvatarFallback } from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Common/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://i.pravatar.cc/150?img=1" alt="사용자" />
      <AvatarFallback />
    </Avatar>
  ),
  args: { size: 'large' },
};

export const Fallback: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src={undefined} alt="사용자" />
      <AvatarFallback />
    </Avatar>
  ),
  args: { size: 'large' },
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {(['small', 'medium', 'large'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Avatar size={size}>
            <AvatarImage src="https://i.pravatar.cc/150?img=3" alt="사용자" />
            <AvatarFallback />
          </Avatar>
          <span className="text-xs text-gray-500">{size}</span>
        </div>
      ))}
    </div>
  ),
};

export const FallbackSizes: Story = {
  render: () => (
    <div className="flex items-end gap-4">
      {(['small', 'medium', 'large'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Avatar size={size}>
            <AvatarFallback />
          </Avatar>
          <span className="text-xs text-gray-500">{size}</span>
        </div>
      ))}
    </div>
  ),
};
