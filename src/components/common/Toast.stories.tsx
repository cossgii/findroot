import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useSetAtom } from 'jotai';
import Toast from './Toast';
import { toastsAtom, type ToastState } from '~/src/stores/toast-store';

const meta: Meta<typeof Toast> = {
  title: 'Common/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

const ToastDemo = ({ toasts }: { toasts: ToastState[] }) => {
  const setToasts = useSetAtom(toastsAtom);

  useEffect(() => {
    setToasts(toasts);
    return () => setToasts([]);
  }, [setToasts, toasts]);

  return (
    <div className="h-48 bg-gray-50 flex items-center justify-center rounded-lg">
      <p className="text-sm text-gray-400">Toast가 우측 하단에 표시됩니다</p>
      <Toast />
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <ToastDemo
      toasts={[{ id: '1', message: '저장되었습니다.', duration: 0 }]}
    />
  ),
};

export const Multiple: Story = {
  render: () => (
    <ToastDemo
      toasts={[
        { id: '1', message: '장소가 추가되었습니다.', duration: 0 },
        { id: '2', message: '이미지 업로드 중...', duration: 0 },
      ]}
    />
  ),
};

export const WithAction: Story = {
  render: () => (
    <ToastDemo
      toasts={[
        {
          id: '1',
          message: '좋아요 처리 중 오류가 발생했습니다.',
          duration: 0,
          actionLabel: '재시도',
          onAction: () => {},
        },
      ]}
    />
  ),
};
