/**
 * DashboardConfigPanel Component
 * Floating settings panel for guest dashboard customization
 * Quick access to view preferences, filters, and display options
 */

import { useState } from 'react';
import '../../styles/dashboard-config.css';

export default function DashboardConfigPanel({ isOpen, onClose, config, onConfigChange }) {
  const [localConfig, setLocalConfig] = useState(config);

  function handleConfigUpdate(key, value) {
    const newConfig = { ...localConfig, [key]: value };
    setLocalConfig(newConfig);
    onConfigChange(newConfig);
  }

  if (!isOpen) return null;

  return (
    <>
      <div className="config-overlay" onClick={onClose}></div>
      <div className="config-panel">
        {/* Header */}
        <div className="config-header">
          <h3 className="config-title">Dashboard Settings</h3>
          <button
            className="config-close-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="config-content">
          {/* View Preferences */}
          <div className="config-section">
            <h4 className="config-section-title">View Preferences</h4>
            <div className="config-options">
              <label className="config-option">
                <input
                  type="radio"
                  name="view"
                  value="card"
                  checked={localConfig.view === 'card'}
                  onChange={(e) => handleConfigUpdate('view', e.target.value)}
                />
                <span className="config-option-label">Card View</span>
              </label>
              <label className="config-option">
                <input
                  type="radio"
                  name="view"
                  value="list"
                  checked={localConfig.view === 'list'}
                  onChange={(e) => handleConfigUpdate('view', e.target.value)}
                />
                <span className="config-option-label">List View</span>
              </label>
              <label className="config-option">
                <input
                  type="radio"
                  name="view"
                  value="compact"
                  checked={localConfig.view === 'compact'}
                  onChange={(e) => handleConfigUpdate('view', e.target.value)}
                />
                <span className="config-option-label">Compact View</span>
              </label>
            </div>
          </div>

          {/* Filter Options */}
          <div className="config-section">
            <h4 className="config-section-title">Filters</h4>
            <div className="config-toggles">
              <label className="config-toggle">
                <span className="config-toggle-label">Show cancelled proposals</span>
                <input
                  type="checkbox"
                  checked={localConfig.showCancelled}
                  onChange={(e) => handleConfigUpdate('showCancelled', e.target.checked)}
                />
                <span className="config-toggle-switch"></span>
              </label>
              <label className="config-toggle">
                <span className="config-toggle-label">Show rejected proposals</span>
                <input
                  type="checkbox"
                  checked={localConfig.showRejected}
                  onChange={(e) => handleConfigUpdate('showRejected', e.target.checked)}
                />
                <span className="config-toggle-switch"></span>
              </label>
            </div>
          </div>

          {/* Sort Options */}
          <div className="config-section">
            <h4 className="config-section-title">Sort By</h4>
            <select
              className="config-select"
              value={localConfig.sortBy}
              onChange={(e) => handleConfigUpdate('sortBy', e.target.value)}
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="price-desc">Highest Price</option>
              <option value="price-asc">Lowest Price</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* Notification Preferences */}
          <div className="config-section">
            <h4 className="config-section-title">Notifications</h4>
            <div className="config-toggles">
              <label className="config-toggle">
                <span className="config-toggle-label">Email notifications</span>
                <input
                  type="checkbox"
                  checked={localConfig.emailNotifications}
                  onChange={(e) => handleConfigUpdate('emailNotifications', e.target.checked)}
                />
                <span className="config-toggle-switch"></span>
              </label>
              <label className="config-toggle">
                <span className="config-toggle-label">Desktop notifications</span>
                <input
                  type="checkbox"
                  checked={localConfig.desktopNotifications}
                  onChange={(e) => handleConfigUpdate('desktopNotifications', e.target.checked)}
                />
                <span className="config-toggle-switch"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="config-footer">
          <button
            className="config-reset-btn"
            onClick={() => {
              const defaultConfig = {
                view: 'card',
                showCancelled: false,
                showRejected: false,
                sortBy: 'date-desc',
                emailNotifications: true,
                desktopNotifications: false
              };
              setLocalConfig(defaultConfig);
              onConfigChange(defaultConfig);
            }}
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    </>
  );
}
