import React, { useState } from 'react';
import { PasswordEntry, CATEGORIES } from '../types';
import './PasswordList.css';

interface Props {
  passwords: PasswordEntry[];
  onEdit: (entry: PasswordEntry) => void;
  onDelete: (id: string) => void;
  searchQuery: string;
}

const PasswordList: React.FC<Props> = ({ passwords, onEdit, onDelete, searchQuery }) => {
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleVisibility = (id: string) => {
    setVisiblePasswords(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social': return '💬';
      case 'work': return '💼';
      case 'finance': return '💰';
      case 'shopping': return '🛒';
      default: return '📁';
    }
  };

  const filteredPasswords = passwords.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (filteredPasswords.length === 0) {
    return (
      <div className="password-list-empty">
        {searchQuery ? (
          <>
            <span className="empty-icon">🔍</span>
            <p>No passwords found matching "{searchQuery}"</p>
          </>
        ) : (
          <>
            <span className="empty-icon">🔐</span>
            <p>No passwords saved yet</p>
            <p className="empty-hint">Click "Add Password" to get started</p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="password-list">
      {filteredPasswords.map(entry => (
        <div key={entry.id} className="password-card">
          <div className="card-header">
            <div className="card-title">
              <span className="category-icon">{getCategoryIcon(entry.category)}</span>
              <div>
                <h3>{entry.title}</h3>
                <span className="category-badge">{getCategoryLabel(entry.category)}</span>
              </div>
            </div>
            <div className="card-actions">
              <button 
                className="action-btn edit" 
                onClick={() => onEdit(entry)}
                title="Edit"
              >
                ✏️
              </button>
              <button 
                className="action-btn delete" 
                onClick={() => onDelete(entry.id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>

          <div className="card-field">
            <label>Username</label>
            <div className="field-value">
              <span>{entry.username}</span>
              <button 
                className="copy-btn-small"
                onClick={() => copyToClipboard(entry.username, `user-${entry.id}`)}
              >
                {copiedId === `user-${entry.id}` ? '✓' : '📋'}
              </button>
            </div>
          </div>

          <div className="card-field">
            <label>Password</label>
            <div className="field-value">
              <span className="password-value">
                {visiblePasswords.has(entry.id) ? entry.password : '••••••••••••'}
              </span>
              <button 
                className="copy-btn-small"
                onClick={() => toggleVisibility(entry.id)}
              >
                {visiblePasswords.has(entry.id) ? '👁️' : '👁️‍🗨️'}
              </button>
              <button 
                className="copy-btn-small"
                onClick={() => copyToClipboard(entry.password, `pass-${entry.id}`)}
              >
                {copiedId === `pass-${entry.id}` ? '✓' : '📋'}
              </button>
            </div>
          </div>

          {entry.url && (
            <div className="card-field">
              <label>Website</label>
              <div className="field-value">
                <a href={entry.url} target="_blank" rel="noopener noreferrer">
                  {entry.url}
                </a>
              </div>
            </div>
          )}

          {entry.notes && (
            <div className="card-field">
              <label>Notes</label>
              <p className="notes">{entry.notes}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PasswordList;
