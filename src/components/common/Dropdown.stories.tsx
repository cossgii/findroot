import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import Dropdown, { DropdownItem } from './Dropdown';

const meta: Meta<typeof Dropdown> = {
  title: 'Common/Dropdown',
  component: Dropdown,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const options = [
  { id: '1', label: '서울 전체' },
  { id: '2', label: '강남구' },
  { id: '3', label: '마포구' },
  { id: '4', label: '종로구' },
  { id: '5', label: '용산구' },
];

export const WithOptions: Story = {
  render: () => {
    const [value, setValue] = useState<(typeof options)[0] | undefined>(undefined);
    return (
      <div className="w-48">
        <Dropdown
          options={options}
          value={value}
          onChange={setValue}
          getOptionLabel={(opt) => opt.label}
          placeholder="자치구 선택"
        />
      </div>
    );
  },
};

export const WithSelectedValue: Story = {
  render: () => {
    const [value, setValue] = useState(options[1]);
    return (
      <div className="w-48">
        <Dropdown
          options={options}
          value={value}
          onChange={setValue}
          getOptionLabel={(opt) => opt.label}
          placeholder="자치구 선택"
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-48">
      <Dropdown
        options={options}
        value={options[0]}
        getOptionLabel={(opt) => opt.label}
        placeholder="자치구 선택"
        disabled
      />
    </div>
  ),
};

export const WithChildren: Story = {
  render: () => {
    return (
      <Dropdown
        trigger={
          <button className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            더보기 ▾
          </button>
        }
      >
        <DropdownItem onClick={() => {}}>수정하기</DropdownItem>
        <DropdownItem onClick={() => {}}>삭제하기</DropdownItem>
      </Dropdown>
    );
  },
};

export const WithMaxVisible: Story = {
  render: () => {
    const [value, setValue] = useState<(typeof options)[0] | undefined>(undefined);
    return (
      <div className="w-48">
        <Dropdown
          options={options}
          value={value}
          onChange={setValue}
          getOptionLabel={(opt) => opt.label}
          placeholder="자치구 선택"
          maxVisibleItems={3}
        />
      </div>
    );
  },
};
