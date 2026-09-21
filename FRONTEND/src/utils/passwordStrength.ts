export interface PasswordRequirement {
  id: string;
  label: string;
  satisfied: boolean;
}

export type PasswordStrengthLevel = 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  level: PasswordStrengthLevel;
  percentage: number;
  colorClass: string;
  textColorClass: string;
  requirements: PasswordRequirement[];
}

const COMMON_WEAK_PASSWORDS = new Set([
  'password',
  '123456',
  '12345678',
  '123456789',
  '12345',
  '1234567',
  'admin',
  'admin123',
  'password123',
  'qwerty',
  'stockflow',
  'stockflow123',
  'welcome',
  'letmein',
  '111111',
  '000000',
  'abc123',
  'monkey',
  'dragon',
  'master',
]);

/**
 * Checks if password contains simple sequential character patterns (e.g. 1234, abcd, qwerty)
 */
export function hasSequentialPattern(password: string): boolean {
  if (!password || password.length < 3) return false;
  const lower = password.toLowerCase();

  // Alphabetical sequences
  for (let i = 0; i < lower.length - 2; i++) {
    const code1 = lower.charCodeAt(i);
    const code2 = lower.charCodeAt(i + 1);
    const code3 = lower.charCodeAt(i + 2);
    if (code2 === code1 + 1 && code3 === code2 + 1) {
      return true;
    }
  }

  // Keyboard sequences
  const sequences = ['qwerty', 'asdfgh', 'zxcvbn', '1234567890'];
  for (const seq of sequences) {
    for (let i = 0; i <= seq.length - 3; i++) {
      const sub = seq.substring(i, i + 3);
      if (lower.includes(sub)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Checks if password has 3 or more repeated characters in a row (e.g. aaa, 111)
 */
export function hasRepeatedChars(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

/**
 * Evaluates password strength and checklist requirements
 */
export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const requirements: PasswordRequirement[] = [
    {
      id: 'min12Chars',
      label: 'At least 12 characters',
      satisfied: password.length >= 12,
    },
    {
      id: 'uppercase',
      label: 'Uppercase letter',
      satisfied: /[A-Z]/.test(password),
    },
    {
      id: 'lowercase',
      label: 'Lowercase letter',
      satisfied: /[a-z]/.test(password),
    },
    {
      id: 'number',
      label: 'Number',
      satisfied: /[0-9]/.test(password),
    },
    {
      id: 'specialChar',
      label: 'Special character',
      satisfied: /[^A-Za-z0-9]/.test(password),
    },
  ];

  if (!password) {
    return {
      score: 0,
      level: 'Very Weak',
      percentage: 0,
      colorClass: 'bg-gray-200',
      textColorClass: 'text-gray-500',
      requirements,
    };
  }

  const isCommonWeak = COMMON_WEAK_PASSWORDS.has(password.toLowerCase().trim());
  const hasSeq = hasSequentialPattern(password);
  const hasRep = hasRepeatedChars(password);

  let score = 0;

  // Base scoring from criteria
  if (requirements[1].satisfied) score++; // Uppercase
  if (requirements[2].satisfied) score++; // Lowercase
  if (requirements[3].satisfied) score++; // Number
  if (requirements[4].satisfied) score++; // Special char

  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Deductions for weaknesses
  if (hasSeq || hasRep) {
    score = Math.max(0, score - 1);
  }

  if (isCommonWeak) {
    score = 0;
  } else if (password.length < 6) {
    score = 0;
  } else if (password.length < 8) {
    score = Math.min(score, 1);
  } else if (password.length < 12) {
    score = Math.min(score, 2);
  } else if (score >= 4 && (!requirements[0].satisfied || !requirements[1].satisfied || !requirements[2].satisfied || !requirements[3].satisfied || !requirements[4].satisfied)) {
    // To reach level 4 (Very Strong), all 5 requirements should be met
    score = 3;
  }

  // Normalize score to range 0..4
  const normalizedScore = Math.max(0, Math.min(4, score));

  let level: PasswordStrengthLevel = 'Very Weak';
  let percentage = 20;
  let colorClass = 'bg-gray-900';
  let textColorClass = 'text-gray-900';

  switch (normalizedScore) {
    case 0:
      level = 'Very Weak';
      percentage = 20;
      colorClass = 'bg-gray-900';
      textColorClass = 'text-gray-900';
      break;
    case 1:
      level = 'Weak';
      percentage = 40;
      colorClass = 'bg-gray-700';
      textColorClass = 'text-gray-700';
      break;
    case 2:
      level = 'Fair';
      percentage = 60;
      colorClass = 'bg-gray-700';
      textColorClass = 'text-gray-600';
      break;
    case 3:
      level = 'Strong';
      percentage = 80;
      colorClass = 'bg-[#111111]';
      textColorClass = 'text-[#666666]';
      break;
    case 4:
      level = 'Very Strong';
      percentage = 100;
      colorClass = 'bg-gray-900';
      textColorClass = 'text-gray-900';
      break;
  }

  return {
    score: normalizedScore,
    level,
    percentage,
    colorClass,
    textColorClass,
    requirements,
  };
}

/**
 * Single source of truth helper to determine if password strength meets the minimum requirement (Strong or Very Strong)
 */
export function isPasswordStrengthAllowed(password: string): boolean {
  const result = evaluatePasswordStrength(password);
  return result.level === 'Strong' || result.level === 'Very Strong';
}
