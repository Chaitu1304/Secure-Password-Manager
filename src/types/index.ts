export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EncryptedData {
  data: string;
  iv: string;
}

export type Category = 'social' | 'work' | 'finance' | 'shopping' | 'other';

export const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'social', label: 'Social Media' },
  { value: 'work', label: 'Work' },
  { value: 'finance', label: 'Finance' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
];
