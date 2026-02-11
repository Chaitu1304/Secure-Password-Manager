import React, { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import PasswordGenerator from './components/PasswordGenerator';
import PasswordForm from './components/PasswordForm';
import PasswordList from './components/PasswordList';
import { PasswordEntry } from './types';
import { clearLocalData, clearEncryptionKey, getEncryptionKey, encryptPassword, decryptPassword } from './utils/encryption';
import apiService, { PasswordEntryAPI } from './services/api';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'passwords' | 'generator'>('passwords');
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  // Convert API response to local PasswordEntry format
  const convertFromAPI = useCallback((entry: PasswordEntryAPI, key: string): PasswordEntry => {
    return {
      id: entry._id,
      title: entry.title,
      username: entry.username,
      password: decryptPassword(entry.encryptedPassword, key),
      url: entry.url,
      notes: entry.notes,
      category: entry.category,
      createdAt: new Date(entry.createdAt),
      updatedAt: new Date(entry.updatedAt),
    };
  }, []);

  // Load passwords from API
  const loadPasswords = useCallback(async (key: string) => {
    const response = await apiService.getPasswords();
    if (response.data) {
      const decryptedPasswords = response.data.map(entry => convertFromAPI(entry, key));
      setPasswords(decryptedPasswords);
    }
  }, [convertFromAPI]);

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedKey = getEncryptionKey();
    const user = localStorage.getItem('user');

    if (token && storedKey && user) {
      setEncryptionKey(storedKey);
      setUserEmail(JSON.parse(user).email);
      setIsAuthenticated(true);
      loadPasswords(storedKey);
    }
    setIsLoading(false);
  }, [loadPasswords]);

  const handleLogin = useCallback(async (key: string) => {
    setEncryptionKey(key);
    setIsAuthenticated(true);
    const user = localStorage.getItem('user');
    if (user) {
      setUserEmail(JSON.parse(user).email);
    }
    await loadPasswords(key);
  }, [loadPasswords]);

  const handleLogout = () => {
    apiService.logout();
    clearLocalData();
    clearEncryptionKey();
    setIsAuthenticated(false);
    setEncryptionKey('');
    setPasswords([]);
    setShowForm(false);
    setEditingEntry(undefined);
    setUserEmail('');
  };

  const handleSavePassword = async (entry: PasswordEntry) => {
    const encryptedPassword = encryptPassword(entry.password, encryptionKey);
    
    if (editingEntry) {
      // Update existing password
      const response = await apiService.updatePassword(entry.id, {
        title: entry.title,
        username: entry.username,
        encryptedPassword,
        url: entry.url,
        notes: entry.notes,
        category: entry.category,
      });

      if (response.data) {
        setPasswords(passwords.map(p => p.id === entry.id ? entry : p));
      }
    } else {
      // Create new password
      const response = await apiService.createPassword({
        title: entry.title,
        username: entry.username,
        encryptedPassword,
        url: entry.url,
        notes: entry.notes,
        category: entry.category,
      });

      if (response.data) {
        const newEntry = convertFromAPI(response.data, encryptionKey);
        setPasswords([newEntry, ...passwords]);
      }
    }

    setShowForm(false);
    setEditingEntry(undefined);
  };

  const handleDeletePassword = (id: string) => {
    setShowConfirmDelete(id);
  };

  const confirmDelete = async () => {
    if (showConfirmDelete) {
      const response = await apiService.deletePassword(showConfirmDelete);
      if (!response.error) {
        setPasswords(passwords.filter(p => p.id !== showConfirmDelete));
      }
      setShowConfirmDelete(null);
    }
  };

  const handleEdit = (entry: PasswordEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account and ALL passwords? This cannot be undone!')) {
      await apiService.deleteAccount();
      handleLogout();
    }
  };

  // Auto-lock after 5 minutes of inactivity
  useEffect(() => {
    if (!isAuthenticated) return;

    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        handleLogout();
      }, 5 * 60 * 1000); // 5 minutes
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimeout));
    resetTimeout();

    return () => {
      clearTimeout(timeout);
      events.forEach(event => window.removeEventListener(event, resetTimeout));
    };
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">🔐</div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="logo">🔐</span>
          <h1>Secure Password Manager</h1>
        </div>
        <div className="header-right">
          <span className="user-email">{userEmail}</span>
          <button className="logout-btn" onClick={handleLogout}>
            🔒 Logout
          </button>
        </div>
      </header>

      <nav className="app-nav">
        <button 
          className={`nav-btn ${activeTab === 'passwords' ? 'active' : ''}`}
          onClick={() => setActiveTab('passwords')}
        >
          🗝️ Passwords
        </button>
        <button 
          className={`nav-btn ${activeTab === 'generator' ? 'active' : ''}`}
          onClick={() => setActiveTab('generator')}
        >
          ⚡ Generator
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'passwords' && (
          <>
            <div className="toolbar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search passwords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="add-btn" onClick={() => { setEditingEntry(undefined); setShowForm(true); }}>
                + Add Password
              </button>
            </div>

            <PasswordList
              passwords={passwords}
              onEdit={handleEdit}
              onDelete={handleDeletePassword}
              searchQuery={searchQuery}
            />
          </>
        )}

        {activeTab === 'generator' && (
          <PasswordGenerator />
        )}
      </main>

      {showForm && (
        <PasswordForm
          onSubmit={handleSavePassword}
          onCancel={() => { setShowForm(false); setEditingEntry(undefined); }}
          initialData={editingEntry}
        />
      )}

      {showConfirmDelete && (
        <div className="confirm-overlay">
          <div className="confirm-dialog">
            <h3>Delete Password?</h3>
            <p>This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={() => setShowConfirmDelete(null)}>
                Cancel
              </button>
              <button className="delete-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <button className="reset-btn" onClick={handleDeleteAccount}>
          Delete Account
        </button>
      </footer>
    </div>
  );
}

export default App;
