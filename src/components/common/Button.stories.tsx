import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outlined'],
    },
    size: {
      control: 'select',
      options: ['small', 'large'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    size: 'large',
    children: '확인',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    size: 'large',
    children: '취소',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    size: 'large',
    children: '더보기',
  },
};

export const Small: Story = {
  args: {
    variant: 'primary',
    size: 'small',
    children: '소형 버튼',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'primary',
    size: 'large',
    disabled: true,
    children: '비활성화',
  },
};

export const DisabledOutlined: Story = {
  args: {
    variant: 'outlined',
    size: 'large',
    disabled: true,
    children: '비활성화 아웃라인',
  },
};
