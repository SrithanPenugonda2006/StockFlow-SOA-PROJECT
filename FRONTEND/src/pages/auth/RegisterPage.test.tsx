import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { RegisterPage } from './RegisterPage';
import { ToastProvider } from '../../context/ToastContext';
import { authApi } from '../../api/authApi';

vi.mock('../../api/authApi', () => ({
  authApi: {
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
    register: vi.fn(),
  },
}));

describe('RegisterPage Password Validation & Email Uniqueness Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegisterPage = () => {
    return render(
      <MemoryRouter>
        <ToastProvider>
          <RegisterPage />
        </ToastProvider>
      </MemoryRouter>
    );
  };

  it('should render Password and Confirm Password fields with eye toggles', () => {
    renderRegisterPage();
    expect(screen.getByPlaceholderText('Create password')).toBeDefined();
    expect(screen.getByPlaceholderText('Confirm password')).toBeDefined();
    expect(screen.getAllByRole('button', { name: /show password/i }).length).toBe(2);
  });

  it('should display duplicate email error when sendOtp receives HTTP 409 Conflict', async () => {
    (authApi.sendOtp as any).mockRejectedValue({
      response: {
        status: 409,
        data: { message: 'Email address is already registered.' },
      },
    });

    renderRegisterPage();
    const emailInput = screen.getByPlaceholderText('name@example.com');
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });

    const sendOtpBtn = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(sendOtpBtn);

    await waitFor(() => {
      expect(screen.getAllByText('This email address is already registered.').length).toBeGreaterThan(0);
    });
  });

  it('should clear duplicate email error when user edits the email field', async () => {
    (authApi.sendOtp as any).mockRejectedValue({
      response: {
        status: 409,
        data: { message: 'Email address is already registered.' },
      },
    });

    renderRegisterPage();
    const emailInput = screen.getByPlaceholderText('name@example.com');
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });

    const sendOtpBtn = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(sendOtpBtn);

    await waitFor(() => {
      expect(screen.getAllByText('This email address is already registered.').length).toBeGreaterThan(0);
    });

    // User changes email address
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });

    await waitFor(() => {
      expect(screen.queryAllByText('This email address is already registered.').length).toBe(0);
    });
  });

  it('should block registration for empty password', () => {
    renderRegisterPage();
    const submitBtn = screen.getByRole('button', { name: /verify email to register/i }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('should show "Password is too weak." and block registration for Very Weak password (e.g. "123456")', () => {
    renderRegisterPage();
    const pwdInput = screen.getByPlaceholderText('Create password');
    fireEvent.change(pwdInput, { target: { value: '123456' } });

    expect(screen.getByText('Password is too weak.')).toBeDefined();
    expect(screen.getByText('Please choose a Strong or Very Strong password.')).toBeDefined();
    const submitBtn = screen.getByRole('button', { name: /verify email to register/i }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(true);
  });

  it('should show "Passwords do not match" when confirm password differs', () => {
    renderRegisterPage();
    const pwdInput = screen.getByPlaceholderText('Create password');
    const confirmInput = screen.getByPlaceholderText('Confirm password');

    fireEvent.change(pwdInput, { target: { value: 'StockFlow@2026Secure!' } });
    fireEvent.change(confirmInput, { target: { value: 'DifferentPass!' } });

    expect(screen.getByText('Passwords do not match')).toBeDefined();
  });

  it('should show "Passwords match" when confirm password matches', () => {
    renderRegisterPage();
    const pwdInput = screen.getByPlaceholderText('Create password');
    const confirmInput = screen.getByPlaceholderText('Confirm password');

    fireEvent.change(pwdInput, { target: { value: 'StockFlow@2026Secure!' } });
    fireEvent.change(confirmInput, { target: { value: 'StockFlow@2026Secure!' } });

    expect(screen.getByText('Passwords match')).toBeDefined();
  });

  it('should call register API when email is verified, password is Very Strong, and passwords match', async () => {
    (authApi.register as any).mockResolvedValue({ message: 'User registered' });
    (authApi.sendOtp as any).mockResolvedValue({ message: 'OTP sent' });
    (authApi.verifyOtp as any).mockResolvedValue({ verified: true });

    renderRegisterPage();
    const usernameInput = screen.getByPlaceholderText('Choose username');
    const emailInput = screen.getByPlaceholderText('name@example.com');
    const pwdInput = screen.getByPlaceholderText('Create password');
    const confirmInput = screen.getByPlaceholderText('Confirm password');

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(emailInput, { target: { value: 'unique@example.com' } });
    fireEvent.change(pwdInput, { target: { value: 'StockFlow@2026Secure!' } });
    fireEvent.change(confirmInput, { target: { value: 'StockFlow@2026Secure!' } });

    const sendOtpBtn = screen.getByRole('button', { name: /send otp/i });
    fireEvent.click(sendOtpBtn);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('000000')).toBeDefined();
    });

    const otpInput = screen.getByPlaceholderText('000000');
    fireEvent.change(otpInput, { target: { value: '123456' } });

    await waitFor(() => {
      const verifyOtpBtn = screen.getByRole('button', { name: /verify otp/i }) as HTMLButtonElement;
      expect(verifyOtpBtn.disabled).toBe(false);
    });

    const verifyOtpBtn = screen.getByRole('button', { name: /verify otp/i });
    fireEvent.click(verifyOtpBtn);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /register account/i })).toBeDefined();
    });

    const submitBtn = screen.getByRole('button', { name: /register account/i }) as HTMLButtonElement;
    expect(submitBtn.disabled).toBe(false);

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'unique@example.com',
        password: 'StockFlow@2026Secure!',
        role: 'CUSTOMER',
      });
    });
  });
});
