
import { useState } from "react";
import { CalendarDays, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { applyForLeave } from "../services/leaveService";

import "../styles/EmployeeLeave.css";

const EmployeeLeave = ({ onLeaveSubmitted }) => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    leaveType: "Casual Leave",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;

    const start = new Date(`${formData.startDate}T00:00:00`);
    const end = new Date(`${formData.endDate}T00:00:00`);

    return Math.round((end - start) / 86400000) + 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
      setError("Please complete all fields.");
      return;
    }

    const start = new Date(`${formData.startDate}T00:00:00`);
    const end = new Date(`${formData.endDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      setError("Leave start date cannot be in the past.");
      return;
    }

    if (end < start) {
      setError("End date cannot be earlier than start date.");
      return;
    }

    const days = calculateDays();

    if (days > 30) {
      setError("A single leave application cannot exceed 30 days.");
      return;
    }

    try {
      setLoading(true);

      const leaveData = {
        id: `LEV${Date.now()}`,
        employeeId: user.employeeId,
        employeeName: user.username || user.name || user.employeeId,
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days,
        reason: formData.reason.trim(),
        appliedDate: new Date().toISOString().split("T")[0],
        status: "Pending",
      };

      await applyForLeave(leaveData);

      setMessage("Leave application submitted successfully!");

      setFormData({
        leaveType: "Casual Leave",
        startDate: "",
        endDate: "",
        reason: "",
      });

      if (onLeaveSubmitted) {
        onLeaveSubmitted();
      }
    } catch (err) {
      setError(err.message || "Unable to submit leave application.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="leave-application-card">
      <div className="leave-section-heading">
        <div>
          <h2>Apply for Leave</h2>
          <p>Submit a new leave request for admin approval.</p>
        </div>
        <CalendarDays size={25} />
      </div>

      {message && <div className="leave-success">{message}</div>}
      {error && <div className="leave-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="leave-form-grid">
          <div className="leave-form-group">
            <label>Leave Type</label>
            <select
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
            >
              <option>Casual Leave</option>
              <option>Sick Leave</option>
              <option>Earned Leave</option>
            </select>
          </div>

          <div className="leave-form-group">
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              min={new Date().toLocaleDateString("en-CA")}
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div className="leave-form-group">
            <label>End Date</label>
            <input
              type="date"
              name="endDate"
              min={formData.startDate || new Date().toLocaleDateString("en-CA")}
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="leave-form-group">
            <label>Total Days</label>
            <input
              type="text"
              value={calculateDays() > 0 ? `${calculateDays()} day(s)` : "Select dates"}
              readOnly
            />
          </div>
        </div>

        <div className="leave-form-group">
          <label>Reason for Leave</label>
          <textarea
            name="reason"
            rows="4"
            placeholder="Enter the reason for your leave..."
            value={formData.reason}
            onChange={handleChange}
            maxLength={500}
          />
        </div>

        <button type="submit" disabled={loading}>
          <Send size={17} />
          {loading ? "Submitting..." : "Submit Leave Application"}
        </button>
      </form>
    </div>
  );
};

export default EmployeeLeave;
