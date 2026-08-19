import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import ConfirmationDialog from './ConfirmationDialog';

const meta: Meta<typeof ConfirmationDialog> = {
  title: 'Common/ConfirmationDialog',
  component: ConfirmationDialog,
  tags: ['autodocs'],
  argTypes: {
    title: { control: 'text' },
    message: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof ConfirmationDialog>;

export const Open: Story = {
  args: {
    isOpen: true,
    title: '장소를 삭제하시겠습니까?',
    message: '삭제된 장소는 복구할 수 없습니다.',
    onConfirm: fn(),
    onCancel: fn(),
    onClose: fn(),
  },
};

export const LoginPrompt: Story = {
  args: {
    isOpen: true,
    title: '로그인이 필요합니다',
    message: '로그인하고 나만의 장소를 저장해보세요!',
    onConfirm: fn(),
    onCancel: fn(),
    onClose: fn(),
  },
};

export const Interactive: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div>
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold"
        >
          삭제하기
        </button>
        <ConfirmationDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="장소를 삭제하시겠습니까?"
          message="삭제된 장소는 복구할 수 없습니다."
          onConfirm={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </div>
    );
  },
};
