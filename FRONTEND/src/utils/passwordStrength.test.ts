import { describe, it, expect } from 'vitest';
import { evaluatePasswordStrength, hasSequentialPattern, hasRepeatedChars } from './passwordStrength';

describe('passwordStrength utility', () => {
  it('should evaluate empty password as Very Weak with 0% percentage', () => {
    const res = evaluatePasswordStrength('');
    expect(res.level).toBe('Very Weak');
    expect(res.percentage).toBe(0);
    expect(res.score).toBe(0);
    expect(res.requirements.every((r) => !r.satisfied)).toBe(true);
  });

  it('should identify common weak passwords as Very Weak', () => {
    const res1 = evaluatePasswordStrength('password');
    expect(res1.level).toBe('Very Weak');

    const res2 = evaluatePasswordStrength('admin123');
    expect(res2.level).toBe('Very Weak');

    const res3 = evaluatePasswordStrength('stockflow');
    expect(res3.level).toBe('Very Weak');
  });

  it('should evaluate short passwords (< 6 chars) as Very Weak', () => {
    const res = evaluatePasswordStrength('A1!');
    expect(res.level).toBe('Very Weak');
    expect(res.score).toBe(0);
  });

  it('should evaluate simple passwords with low diversity as Weak', () => {
    const res = evaluatePasswordStrength('a1b2c3d');
    expect(res.level).toBe('Weak');
    expect(res.score).toBe(1);
  });

  it('should evaluate fair passwords (e.g. mixed types but length < 12) as Fair', () => {
    const res = evaluatePasswordStrength('Abc12345');
    expect(res.level).toBe('Fair');
    expect(res.score).toBe(2);
  });

  it('should evaluate strong passwords (length >= 12, mixed chars) as Strong', () => {
    const res = evaluatePasswordStrength('StrongPass123');
    expect(res.level).toBe('Strong');
    expect(res.score).toBe(3);
  });

  it('should evaluate very strong passwords (length >= 12, all 5 requirements met) as Very Strong', () => {
    const res = evaluatePasswordStrength('VeryStrongP@ss123');
    expect(res.level).toBe('Very Strong');
    expect(res.score).toBe(4);
    expect(res.requirements.every((r) => r.satisfied)).toBe(true);
  });

  it('should evaluate individual requirements correctly', () => {
    const res = evaluatePasswordStrength('Abc!');
    const reqMap = new Map(res.requirements.map((r) => [r.id, r.satisfied]));

    expect(reqMap.get('min12Chars')).toBe(false);
    expect(reqMap.get('uppercase')).toBe(true);
    expect(reqMap.get('lowercase')).toBe(true);
    expect(reqMap.get('number')).toBe(false);
    expect(reqMap.get('specialChar')).toBe(true);
  });

  it('should detect repeated characters', () => {
    expect(hasRepeatedChars('aaa123')).toBe(true);
    expect(hasRepeatedChars('1111')).toBe(true);
    expect(hasRepeatedChars('abcde')).toBe(false);
  });

  it('should detect sequential patterns and apply score deduction', () => {
    expect(hasSequentialPattern('abc1234')).toBe(true);
    expect(hasSequentialPattern('qwerty123')).toBe(true);
    expect(hasSequentialPattern('x8z9p2m')).toBe(false);

    // Password with sequential pattern gets score deducted to Very Weak
    const res = evaluatePasswordStrength('abcdefg');
    expect(res.level).toBe('Very Weak');
  });
});
