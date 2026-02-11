import React, { useState, useCallback } from 'react';
import { generatePassword, calculatePasswordStrength, getPasswordStrengthLabel, PasswordOptions } from '../utils/passwordGenerator';
import './PasswordGenerator.css';

interface Props {
  onPasswordGenerated?: (password: string) => void;
}

const PasswordGenerator: React.FC<Props> = ({ onPasswordGenerated }) => {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
  });

  const handleGenerate = useCallback(() => {
    const newPassword = generatePassword(options);
    setPassword(newPassword);
    setCopied(false);
    if (onPasswordGenerated) {
      onPasswordGenerated(newPassword);
    }
  }, [options, onPasswordGenerated]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = calculatePasswordStrength(password);
  const strengthInfo = getPasswordStrengthLabel(strength);

  return (
    <div className="password-generator">
      <h3>Password Generator</h3>
      
      <div className="password-display">
        <input
          type="text"
          value={password}
          readOnly
          placeholder="Click Generate to create a password"
        />
        <button onClick={handleCopy} disabled={!password} className="copy-btn">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {password && (
        <div className="strength-meter">
          <div 
            className="strength-bar" 
            style={{ width: `${strength}%`, backgroundColor: strengthInfo.color }}
          />
          <span style={{ color: strengthInfo.color }}>{strengthInfo.label}</span>
        </div>
      )}

      <div className="options">
        <div className="option">
          <label>Length: {options.length}</label>
          <input
            type="range"
            min="8"
            max="64"
            value={options.length}
            onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
          />
        </div>

        <div className="checkboxes">
          <label>
            <input
              type="checkbox"
              checked={options.includeUppercase}
              onChange={(e) => setOptions({ ...options, includeUppercase: e.target.checked })}
            />
            Uppercase (A-Z)
          </label>

          <label>
            <input
              type="checkbox"
              checked={options.includeLowercase}
              onChange={(e) => setOptions({ ...options, includeLowercase: e.target.checked })}
            />
            Lowercase (a-z)
          </label>

          <label>
            <input
              type="checkbox"
              checked={options.includeNumbers}
              onChange={(e) => setOptions({ ...options, includeNumbers: e.target.checked })}
            />
            Numbers (0-9)
          </label>

          <label>
            <input
              type="checkbox"
              checked={options.includeSymbols}
              onChange={(e) => setOptions({ ...options, includeSymbols: e.target.checked })}
            />
            Symbols (!@#$%...)
          </label>
        </div>
      </div>

      <button onClick={handleGenerate} className="generate-btn">
        Generate Password
      </button>
    </div>
  );
};

export default PasswordGenerator;
