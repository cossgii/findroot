import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import EmptyState from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'Common/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  argTypes: {
    message: { control: 'text' },
    description: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    message: '검색 결과가 없습니다.',
  },
  decorators: [(Story) => <div className="w-96"><Story /></div>],
};

export const WithDescription: Story = {
  args: {
    message: '아직 등록된 장소가 없습니다.',
    description: '첫 번째 장소를 등록해보세요.',
  },
  decorators: [(Story) => <div className="w-96"><Story /></div>],
};
