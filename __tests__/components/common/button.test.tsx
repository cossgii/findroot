/// <reference types="@testing-library/jest-dom" />

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '~/src/components/common/Button';

describe('Button', () => {
  it('버튼 텍스트를 올바르게 렌더링해야 한다', () => {
    render(<Button>클릭하세요</Button>);
    const buttonElement = screen.getByText(/클릭하세요/i);
    expect(buttonElement).toBeInTheDocument();
  });

  it('기본 variant와 size가 적용되어야 한다', () => {
    render(<Button>테스트 버튼</Button>);
    const buttonElement = screen.getByRole('button', { name: /테스트 버튼/i });
    expect(buttonElement).toBeInTheDocument();
  });

  it('disabled 상태를 올바르게 처리해야 한다', () => {
    render(<Button disabled>비활성화 버튼</Button>);
    const buttonElement = screen.getByRole('button', { name: /비활성화 버튼/i });
    expect(buttonElement).toBeDisabled();
  });

  it('variant prop에 따라 올바른 스타일을 적용해야 한다', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    let buttonElement = screen.getByText(/Primary/i);
    expect(buttonElement).toHaveClass('bg-primary-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    buttonElement = screen.getByText(/Secondary/i);
    expect(buttonElement).toHaveClass('bg-secondary-600');

    rerender(<Button variant="outlined">Outlined</Button>);
    buttonElement = screen.getByText(/Outlined/i);
    expect(buttonElement).toHaveClass('border-primary-600');
  });

  it('size prop에 따라 올바른 스타일을 적용해야 한다', () => {
    const { rerender } = render(<Button size="small">Small</Button>);
    let buttonElement = screen.getByText(/Small/i);
    expect(buttonElement).toHaveClass('h-[40px]');

    rerender(<Button size="large">Large</Button>);
    buttonElement = screen.getByText(/Large/i);
    expect(buttonElement).toHaveClass('h-[44px]');
  });

  it('클릭 이벤트를 올바르게 처리해야 한다', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>클릭 가능한 버튼</Button>);
    const buttonElement = screen.getByText(/클릭 가능한 버튼/i);
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});