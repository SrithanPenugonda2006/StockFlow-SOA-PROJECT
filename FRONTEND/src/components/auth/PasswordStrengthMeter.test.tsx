import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

describe('PasswordStrengthMeter Component', () => {
  it('should render default Very Weak state for empty password', () => {
    render(<PasswordStrengthMeter password="" />);
    expect(screen.getByText('Very Weak')).toBeDefined();
    expect(screen.getByText('At least 12 characters')).toBeDefined();
  });

  it('should update requirements checklist dynamically when requirements are satisfied', () => {
    const { rerender } = render(<PasswordStrengthMeter password="a1b2c3d" />);
    expect(screen.getByText('Weak')).toBeDefined();

    rerender(<PasswordStrengthMeter password="VeryStrongP@ss123" />);
    expect(screen.getByText('Very Strong')).toBeDefined();
  });
});
