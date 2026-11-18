import { useEffect, useState } from "react";
import {
  Building2,
  Clock,
  CalendarDays,
  SlidersHorizontal,
  Plus,
  Trash2,
  Save,
  RefreshCw
} from "lucide-react";

import {
  getSettings,
  saveSettings
} from "../services/settingsService";

import "../styles/Settings.css";

function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSettings();
      setSettings({
        ...data,
        leaveTypes: data.leaveTypes || []
      });
    } catch (err) {
      setError(err.message || "Unable to load settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const updateField = (field, value) => {
    setSettings((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const updateLeaveType = (index, field, value) => {
    setSettings((previous) => ({
      ...previous,
      leaveTypes: previous.leaveTypes.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    }));
  };

  const addLeaveType = () => {
    setSettings((previous) => ({
      ...previous,
      leaveTypes: [
        ...previous.leaveTypes,
        { name: "", days: 1 }
      ]
    }));
  };

  const removeLeaveType = (index) => {
    setSettings((previous) => ({
      ...previous,
      leaveTypes: previous.leaveTypes.filter(
        (_, itemIndex) => itemIndex !== index
      )
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!settings.companyName.trim()) {
        throw new Error("Company name is required.");
      }

      if (!settings.officeStartTime || !settings.officeEndTime) {
        throw new Error("Please enter office working hours.");
      }

      if (
        settings.officeStartTime >= settings.officeEndTime
      ) {
        throw new Error("Office end time must be later than start time.");
      }

      if (
        settings.leaveTypes.some(
          (item) => !item.name.trim() || Number(item.days) < 1
        )
      ) {
        throw new Error("Enter a valid name and allowance for every leave type.");
      }

      const cleanedSettings = {
        ...settings,
        companyName: settings.companyName.trim(),
        companyEmail: settings.companyEmail.trim(),
        companyPhone: settings.companyPhone.trim(),
        companyAddress: settings.companyAddress.trim(),
        lateAfterMinutes: Number(settings.lateAfterMinutes),
        leaveTypes: settings.leaveTypes.map((item) => ({
          name: item.name.trim(),
          days: Number(item.days)
        }))
      };

      const saved = await saveSettings(cleanedSettings);
      setSettings(saved);
      setSuccess("Settings saved successfully!");

    } catch (err) {
      setError(err.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-loading">
        <RefreshCw size={22} />
        <p>Loading settings...</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="settings-page">
        <div className="settings-error">
          {error || "Settings could not be loaded."}
        </div>

        <button
          className="settings-save-btn"
          onClick={loadSettings}
          type="button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="settings-page">

      <div className="settings-heading">
        <div>
          <h1>Settings</h1>
          <p>Manage company details and HRMS configuration.</p>
        </div>
      </div>

      {success && (
        <div className="settings-success">
          {success}
        </div>
      )}

      {error && (
        <div className="settings-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSave}>

        {/* Company Profile */}
        <section className="settings-card">
          <div className="settings-section-heading">
            <Building2 size={22} />
            <div>
              <h2>Company Profile</h2>
              <p>Basic organization information.</p>
            </div>
          </div>

          <div className="settings-grid">

            <div className="settings-field">
              <label>Company Name *</label>
              <input
                value={settings.companyName}
                onChange={(e) =>
                  updateField("companyName", e.target.value)
                }
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="settings-field">
              <label>Company Email</label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) =>
                  updateField("companyEmail", e.target.value)
                }
                placeholder="company@example.com"
              />
            </div>

            <div className="settings-field">
              <label>Company Phone</label>
              <input
                value={settings.companyPhone}
                onChange={(e) =>
                  updateField("companyPhone", e.target.value)
                }
                placeholder="Enter contact number"
              />
            </div>

            <div className="settings-field full-width">
              <label>Company Address</label>
              <textarea
                value={settings.companyAddress}
                onChange={(e) =>
                  updateField("companyAddress", e.target.value)
                }
                placeholder="Enter company address"
                rows="3"
              />
            </div>

          </div>
        </section>

        {/* Attendance Settings */}
        <section className="settings-card">
          <div className="settings-section-heading">
            <Clock size={22} />
            <div>
              <h2>Attendance Settings</h2>
              <p>Configure standard office working hours.</p>
            </div>
          </div>

          <div className="settings-grid">

            <div className="settings-field">
              <label>Office Start Time</label>
              <input
                type="time"
                value={settings.officeStartTime}
                onChange={(e) =>
                  updateField("officeStartTime", e.target.value)
                }
                required
              />
            </div>

            <div className="settings-field">
              <label>Office End Time</label>
              <input
                type="time"
                value={settings.officeEndTime}
                onChange={(e) =>
                  updateField("officeEndTime", e.target.value)
                }
                required
              />
            </div>

            <div className="settings-field">
              <label>Late Arrival Threshold (Minutes)</label>
              <input
                type="number"
                min="0"
                value={settings.lateAfterMinutes}
                onChange={(e) =>
                  updateField("lateAfterMinutes", e.target.value)
                }
                required
              />
              <small>
                Minutes after office start time before an arrival is considered late.
              </small>
            </div>

          </div>
        </section>

        {/* Leave Settings */}
        <section className="settings-card">
          <div className="settings-section-heading">
            <CalendarDays size={22} />
            <div>
              <h2>Leave Settings</h2>
              <p>Configure available leave types and annual allowances.</p>
            </div>
          </div>

          <div className="leave-settings-list">

            {settings.leaveTypes.map((item, index) => (
              <div className="leave-setting-row" key={index}>

                <div className="settings-field">
                  <label>Leave Type</label>
                  <input
                    value={item.name}
                    onChange={(e) =>
                      updateLeaveType(index, "name", e.target.value)
                    }
                    placeholder="Leave name"
                    required
                  />
                </div>

                <div className="settings-field">
                  <label>Annual Allowance (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={item.days}
                    onChange={(e) =>
                      updateLeaveType(index, "days", e.target.value)
                    }
                    required
                  />
                </div>

                <button
                  type="button"
                  className="leave-remove-btn"
                  onClick={() => removeLeaveType(index)}
                  title="Remove leave type"
                >
                  <Trash2 size={18} />
                </button>

              </div>
            ))}

          </div>

          <button
            type="button"
            className="leave-add-btn"
            onClick={addLeaveType}
          >
            <Plus size={17} />
            Add Leave Type
          </button>
        </section>

        {/* System Preferences */}
        <section className="settings-card">
          <div className="settings-section-heading">
            <SlidersHorizontal size={22} />
            <div>
              <h2>System Preferences</h2>
              <p>Configure how dates are displayed.</p>
            </div>
          </div>

          <div className="settings-grid">
            <div className="settings-field">
              <label>Date Format</label>
              <select
                value={settings.dateFormat}
                onChange={(e) =>
                  updateField("dateFormat", e.target.value)
                }
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="settings-actions">
          <button
            type="submit"
            className="settings-save-btn"
            disabled={saving}
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default Settings;