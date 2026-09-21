import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput Component', () => {
  it('should render as type password by default', () => {
    const { container } = render(<PasswordInput label="Password" id="test-password" />);
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('should toggle visibility when eye button is clicked', () => {
    const { container } = render(<PasswordInput label="Password" id="test-password" />);
    const input = container.querySelector('input') as HTMLInputElement;
    const toggleBtn = screen.getByRole('button', { name: /show password/i });

    // Click to show password
    fireEvent.click(toggleBtn);
    expect(input.type).toBe('text');

    // Click again to hide password
    const hideBtn = screen.getByRole('button', { name: /hide password/i });
    fireEvent.click(hideBtn);
    expect(input.type).toBe('password');
  });

  it('should support independent visibility states across multiple PasswordInputs', () => {
    const { container } = render(
      <div>
        <PasswordInput label="Password" id="pwd-1" />
        <PasswordInput label="Confirm Password" id="pwd-2" />
      </div>
    );

    const inputs = container.querySelectorAll('input');
    const buttons = screen.getAllByRole('button', { name: /show password/i });
    expect(buttons.length).toBe(2);

    // Toggle only the first field
    fireEvent.click(buttons[0]);

    expect(inputs[0].type).toBe('text');
    expect(inputs[1].type).toBe('password');
  });
});
