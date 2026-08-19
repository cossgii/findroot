import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Input from './Input';

const meta: Meta<typeof Input> = {
  title: 'Common/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password'],
    },
    disabled: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    type: 'text',
    placeholder: '입력해주세요',
  },
};

export const WithValue: Story = {
  args: {
    type: 'text',
    value: '입력된 값',
  },
};

export const ErrorState: Story = {
  args: {
    type: 'text',
    placeholder: '이메일을 입력해주세요',
    error: 'error',
    value: 'invalid-email',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: '비밀번호를 입력해주세요',
  },
};

export const Disabled: Story = {
  args: {
    type: 'text',
    placeholder: '비활성화된 입력',
    disabled: true,
  },
};
