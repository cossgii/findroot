/// <reference types="@testing-library/jest-dom" />

import React from 'react';
import { render, screen } from '@testing-library/react';
import Button from '~/src/components/common/button'; // 수정된 경로 사용

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
});