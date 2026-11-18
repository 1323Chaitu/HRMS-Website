
import { useEffect, useState } from "react";
import { X } from "lucide-react";

import "../styles/EmployeeModal.css";

const initialForm = {
  name: "",
  email: "",
  department: "",
  designation: "",
  phone: "",
  joiningDate: "",
  salary: "",
  status: "Active"
};

function EmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  employee
}) {
  const [formData, setFormData] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (employee) {
      setFormData({
        ...initialForm,
        ...employee,
        salary: String(employee.salary ?? "")
      });
    } else {
      setFormData(initialForm);
    }

    setError("");
  }, [employee, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
  const { name, value } = e.target;

  const updatedValue =
    name === "phone"
      ? value.replace(/\D/g, "").slice(0, 10)
      : value;

    setFormData((previous) => ({
      ...previous,
      [name]: updatedValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!/^[A-Za-z\s.'-]{2,60}$/.test(formData.name.trim())) {
      setError("Enter a valid employee name.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (!/^\d{10}$/.test(formData.phone)) {
      setError("Phone number must contain exactly 10 digits.");
      return;
    }

    if (Number(formData.salary) <= 0) {
      setError("Enter a valid salary.");
      return;
    }

    if (!formData.joiningDate) {
      setError("Please select a joining date.");
      return;
    }

    if (!formData.department || !formData.designation) {
      setError("Please complete department and designation.");
      return;
    }

    onSubmit({
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      salary: Number(formData.salary)
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="employee-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>
              {employee ? "Edit Employee" : "Add New Employee"}
            </h2>

            <p>Enter employee information below.</p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
          >
            <X size={21} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">

            <div className="form-group">
              <label>Employee Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="form-group">
              <label>Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              >
                <option value="">Select Department</option>
                <option>Human Resources</option>
                <option>IT</option>
                <option>Finance</option>
                <option>Marketing</option>
                <option>Sales</option>
                <option>Operations</option>
              </select>
            </div>

            <div className="form-group">
              <label>Designation *</label>
              <input
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="Enter designation"
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10 digit mobile number"
                maxLength={10}
                inputMode="numeric"
                
                required
              />
            </div>

            <div className="form-group">
              <label>Joining Date *</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Monthly Salary (₹) *</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Enter salary"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label>Employment Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

          </div>

          {error && (
            <div className="form-error">{error}</div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button type="submit" className="save-btn">
              {employee ? "Update Employee" : "Save Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeModal;
