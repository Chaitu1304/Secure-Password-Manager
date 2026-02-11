import CryptoJS from 'crypto-js';

/**
 * Derives a key from the master password using PBKDF2
 */
export const deriveKey = (masterPassword: string, salt: string): string => {
  return CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: 256 / 32,
    iterations: 100000,
  }).toString();
};

/**
 * Generates a random salt
 */
export const generateSalt = (): string => {
  return CryptoJS.lib.WordArray.random(128 / 8).toString();
};

/**
 * Encrypts data using AES-256 (for client-side password encryption)
 */
export const encrypt = (data: string, key: string): string => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

/**
 * Decrypts data using AES-256 (for client-side password decryption)
 */
export const decrypt = (encryptedData: string, key: string): string => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '';
  }
};

/**
 * Encrypts a password using the user's encryption key
 */
export const encryptPassword = (password: string, encryptionKey: string): string => {
  return encrypt(password, encryptionKey);
};

/**
 * Decrypts a password using the user's encryption key
 */
export const decryptPassword = (encryptedPassword: string, encryptionKey: string): string => {
  return decrypt(encryptedPassword, encryptionKey);
};

/**
 * Creates an encryption key from master password and user salt
 */
export const createEncryptionKey = (masterPassword: string, salt: string): string => {
  return deriveKey(masterPassword, salt);
};

/**
 * Clears all local storage data (for logout)
 */
export const clearLocalData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('encryptionKey');
};

/**
 * Stores the encryption key securely in session storage
 * Note: In production, consider more secure storage methods
 */
export const storeEncryptionKey = (key: string): void => {
  sessionStorage.setItem('encryptionKey', key);
};

/**
 * Retrieves the encryption key from session storage
 */
export const getEncryptionKey = (): string | null => {
  return sessionStorage.getItem('encryptionKey');
};

/**
 * Clears the encryption key from session storage
 */
export const clearEncryptionKey = (): void => {
  sessionStorage.removeItem('encryptionKey');
};
