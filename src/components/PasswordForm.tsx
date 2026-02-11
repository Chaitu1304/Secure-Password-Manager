import React, { useState } from 'react';
import { PasswordEntry, CATEGORIES } from '../types';
import { generatePassword, calculatePasswordStrength, getPasswordStrengthLabel } from '../utils/passwordGenerator';
import { v4 as uuidv4 } from 'uuid';
import './PasswordForm.css';

interface Props {
  onSubmit: (entry: PasswordEntry) => void;
  onCancel: () => void;
  initialData?: PasswordEntry;
}

const PasswordForm: React.FC<Props> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    username: initialData?.username || '',
    password: initialData?.password || '',
    url: initialData?.url || '',
    notes: initialData?.notes || '',
    category: initialData?.category || 'other',
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeneratePassword = () => {
    const password = generatePassword({
      length: 20,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });
    setFormData(prev => ({ ...prev, password }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: PasswordEntry = {
      id: initialData?.id || uuidv4(),
      ...formData,
      createdAt: initialData?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    onSubmit(entry);
  };

  const strength = calculatePasswordStrength(formData.password);
  const strengthInfo = getPasswordStrengthLabel(strength);

  return (
    <div className="password-form-overlay">
      <form className="password-form" onSubmit={handleSubmit}>
        <h2>{initialData ? 'Edit Password' : 'Add New Password'}</h2>

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Gmail, Netflix, Bank"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Username / Email *</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="your@email.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter or generate password"
              required
            />
            <button
              type="button"
              className="toggle-visibility"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
            <button
              type="button"
              className="generate-btn-small"
              onClick={handleGeneratePassword}
            >
              Generate
            </button>
          </div>
          {formData.password && (
            <div className="password-strength">
              <div 
                className="strength-indicator"
                style={{ width: `${strength}%`, backgroundColor: strengthInfo.color }}
              />
              <span style={{ color: strengthInfo.color }}>{strengthInfo.label}</span>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="url">Website URL</label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional information..."
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            {initialData ? 'Update' : 'Save'} Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordForm;
