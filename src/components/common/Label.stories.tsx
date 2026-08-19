import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Label } from './Label';

const meta: Meta<typeof Label> = {
  title: 'Common/Label',
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: { children: '이메일' },
};

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-64">
      <Label htmlFor="email-demo">이메일</Label>
      <input
        id="email-demo"
        type="email"
        placeholder="이메일을 입력해주세요"
        className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm outline-none"
      />
    </div>
  ),
};
