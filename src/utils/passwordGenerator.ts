interface PasswordOptions {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeNumbers: boolean;
  includeSymbols: boolean;
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * Generates a secure random password based on specified options
 */
export const generatePassword = (options: PasswordOptions): string => {
  let charset = '';
  let password = '';
  const guaranteedChars: string[] = [];

  if (options.includeUppercase) {
    charset += UPPERCASE;
    guaranteedChars.push(UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)]);
  }
  if (options.includeLowercase) {
    charset += LOWERCASE;
    guaranteedChars.push(LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)]);
  }
  if (options.includeNumbers) {
    charset += NUMBERS;
    guaranteedChars.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
  }
  if (options.includeSymbols) {
    charset += SYMBOLS;
    guaranteedChars.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  }

  if (charset === '') {
    charset = LOWERCASE;
    guaranteedChars.push(LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)]);
  }

  // Fill the rest of the password
  const remainingLength = options.length - guaranteedChars.length;
  for (let i = 0; i < remainingLength; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  // Add guaranteed characters and shuffle
  password += guaranteedChars.join('');
  password = shuffleString(password);

  return password;
};

/**
 * Shuffles a string randomly
 */
const shuffleString = (str: string): string => {
  const arr = str.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
};

/**
 * Calculates password strength (0-100)
 */
export const calculatePasswordStrength = (password: string): number => {
  let score = 0;

  if (password.length === 0) return 0;
  
  // Length scoring
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 15;
  if (password.length >= 16) score += 15;

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/[0-9]/.test(password)) score += 10;
  if (/[^a-zA-Z0-9]/.test(password)) score += 20;

  return Math.min(score, 100);
};

/**
 * Returns a label and color for password strength
 */
export const getPasswordStrengthLabel = (strength: number): { label: string; color: string } => {
  if (strength < 25) return { label: 'Very Weak', color: '#dc3545' };
  if (strength < 50) return { label: 'Weak', color: '#fd7e14' };
  if (strength < 75) return { label: 'Good', color: '#ffc107' };
  return { label: 'Strong', color: '#28a745' };
};

export type { PasswordOptions };
