import React, { useState } from 'react';
import { calculatePasswordStrength, getPasswordStrengthLabel } from '../utils/passwordGenerator';
import { createEncryptionKey, storeEncryptionKey } from '../utils/encryption';
import apiService from '../services/api';
import './Login.css';

interface Props {
  onLogin: (encryptionKey: string) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        // Register new user
        if (password.length < 8) {
          setError('Master password must be at least 8 characters');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }

        const response = await apiService.register(email, password);
        
        if (response.error) {
          setError(response.error);
          setIsLoading(false);
          return;
        }

        if (response.data) {
          const encryptionKey = createEncryptionKey(password, response.data.user.salt);
          storeEncryptionKey(encryptionKey);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          onLogin(encryptionKey);
        }
      } else {
        // Login existing user
        const response = await apiService.login(email, password);
        
        if (response.error) {
          setError(response.error);
          setIsLoading(false);
          return;
        }

        if (response.data) {
          const encryptionKey = createEncryptionKey(password, response.data.user.salt);
          storeEncryptionKey(encryptionKey);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          onLogin(encryptionKey);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
    
    setIsLoading(false);
  };

  const strength = calculatePasswordStrength(password);
  const strengthInfo = getPasswordStrengthLabel(strength);

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <span className="login-icon">🔐</span>
          <h1>Secure Password Manager</h1>
          <p>{isRegister ? 'Create your account' : 'Sign in to your account'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="master-password">Master Password</label>
            <input
              type="password"
              id="master-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter master password"
              required
            />
            {isRegister && password && (
              <div className="strength-meter">
                <div 
                  className="strength-bar"
                  style={{ width: `${strength}%`, backgroundColor: strengthInfo.color }}
                />
                <span style={{ color: strengthInfo.color }}>{strengthInfo.label}</span>
              </div>
            )}
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm master password"
                required
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="login-toggle">
          <p>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              className="toggle-btn"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
            >
              {isRegister ? 'Sign In' : 'Register'}
            </button>
          </p>
        </div>

        {isRegister && (
          <div className="login-info">
            <p>⚠️ Remember your master password! It cannot be recovered if lost.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
