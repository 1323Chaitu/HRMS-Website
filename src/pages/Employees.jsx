import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Users,
  RefreshCw,
  X,
  KeyRound
} from "lucide-react";

import {
  getEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  createMissingEmployeeAccounts
} from "../services/employeeService";

import EmployeeModal from "../components/EmployeeModal";

import "../styles/Employee.css";

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewEmployee, setViewEmployee] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [credentials, setCredentials] = useState([]);
  const [creatingAccounts, setCreatingAccounts] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getEmployees();
      setEmployees(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        employee.name.toLowerCase().includes(searchValue) ||
        employee.id.toLowerCase().includes(searchValue) ||
        employee.email.toLowerCase().includes(searchValue);

      const matchesDepartment =
        departmentFilter === "All" ||
        employee.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All" ||
        employee.status === statusFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [employees, search, departmentFilter, statusFilter]);

  const handleAdd = () => {
    setSelectedEmployee(null);
    setModalOpen(true);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setModalOpen(true);
  };

  const handleSubmit = async (employeeData) => {
    try {
      setError("");
      setCredentials([]);

      if (selectedEmployee) {
        const updated = await updateEmployee(
          selectedEmployee.id,
          employeeData
        );

        setEmployees((previous) =>
          previous.map((employee) =>
            employee.id === updated.id ? updated : employee
          )
        );

        showSuccess("Employee updated successfully!");
      } else {
        const newEmployee = {
          ...employeeData,
          id: `EMP${Date.now()}`
        };

        const result = await addEmployee(newEmployee);

        setEmployees((previous) => [
          ...previous,
          result.employee
        ]);

        if (result.credentials) {
          setCredentials([result.credentials]);
          showSuccess(
            "Employee and login account created successfully!"
          );
        } else {
          showSuccess(
            "Employee added successfully. No login account was created because the employee is inactive."
          );
        }
      }

      setModalOpen(false);
      setSelectedEmployee(null);

    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateMissingAccounts = async () => {
    try {
      setError("");
      setSuccessMessage("");
      setCreatingAccounts(true);
      setCredentials([]);

      const result = await createMissingEmployeeAccounts();

      if (result.length > 0) {
        setCredentials(result);
        showSuccess(
          `${result.length} employee login account(s) created successfully!`
        );
      } else {
        showSuccess(
          "All active employees already have login accounts."
        );
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setCreatingAccounts(false);
    }
  };

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${employee.name}? Their linked login account will also be deleted.`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteEmployee(employee.id);

      setEmployees((previous) =>
        previous.filter((item) => item.id !== employee.id)
      );

      showSuccess("Employee and linked login account deleted successfully!");

    } catch (err) {
      setError(err.message);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);

    window.setTimeout(() => {
      setSuccessMessage("");
    }, 5000);
  };

  const copyCredentials = async (credential) => {
    const text = [
      `Employee: ${credential.employeeName}`,
      `Employee ID: ${credential.employeeId}`,
      `Username: ${credential.username}`,
      `Temporary Password: ${credential.password}`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      showSuccess("Login credentials copied successfully!");
    } catch {
      setError("Unable to copy credentials. Please copy them manually.");
    }
  };

  const activeCount = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const inactiveCount = employees.length - activeCount;

  const departments = [
    ...new Set(employees.map((employee) => employee.department))
  ].filter(Boolean);

  return (
    <div className="employees-page">

      {/* Heading */}
      <div className="employee-page-heading">
        <div>
          <h1>Employee Management</h1>
          <p>Manage your organization's employee information.</p>
        </div>

        <div style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap"
        }}>
          <button
            className="add-employee-btn"
            onClick={handleCreateMissingAccounts}
            disabled={creatingAccounts}
            type="button"
          >
            <KeyRound size={18} />
            {creatingAccounts
              ? "Creating Accounts..."
              : "Create Missing Login Accounts"}
          </button>

          <button
            className="add-employee-btn"
            onClick={handleAdd}
            type="button"
          >
            <Plus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="employee-error">
          {error}
        </div>
      )}

      {/* Generated Login Credentials */}
      {credentials.length > 0 && (
        <div
          style={{
            background: "#f0f7ff",
            border: "1px solid #bfdbfe",
            borderRadius: "10px",
            padding: "18px",
            marginBottom: "20px"
          }}
        >
          <h3 style={{ marginTop: 0 }}>
            <KeyRound size={18} style={{ verticalAlign: "middle" }} />
            {" "}Generated Employee Login Credentials
          </h3>

          <p>
            Share these credentials with the respective employees.
            Passwords are shown here only when the accounts are created.
          </p>

          {credentials.map((item) => (
            <div
              key={item.employeeId}
              style={{
                background: "#ffffff",
                border: "1px solid #dbeafe",
                borderRadius: "8px",
                padding: "14px",
                marginTop: "12px"
              }}
            >
              <p><strong>Employee:</strong> {item.employeeName}</p>
              <p><strong>Employee ID:</strong> {item.employeeId}</p>
              <p><strong>Username:</strong> {item.username}</p>
              <p><strong>Temporary Password:</strong> {item.password}</p>

              <button
                type="button"
                onClick={() => copyCredentials(item)}
                style={{
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: "6px",
                  background: "#2563eb",
                  color: "#ffffff",
                  cursor: "pointer"
                }}
              >
                Copy Credentials
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Statistics */}
      <div className="employee-stats">

        <div className="employee-stat-card">
          <Users size={22} />
          <div>
            <span>Total Employees</span>
            <h2>{employees.length}</h2>
          </div>
        </div>

        <div className="employee-stat-card">
          <Users size={22} />
          <div>
            <span>Active Employees</span>
            <h2>{activeCount}</h2>
          </div>
        </div>

        <div className="employee-stat-card">
          <Users size={22} />
          <div>
            <span>Inactive Employees</span>
            <h2>{inactiveCount}</h2>
          </div>
        </div>

      </div>

      {/* Employee Table Panel */}
      <div className="employee-table-panel">

        <div className="employee-toolbar">

          <div className="employee-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search by name, ID or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
          >
            <option value="All">All Departments</option>

            {departments.map((department) => (
              <option key={department} value={department}>
                {department}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            className="employee-refresh"
            onClick={fetchEmployees}
            title="Refresh employees"
            type="button"
          >
            <RefreshCw size={17} />
          </button>

        </div>

        {/* Table */}
        {loading ? (
          <div className="employee-loading">
            <RefreshCw size={25} />
            <p>Loading employees...</p>
          </div>
        ) : (
          <div className="employee-table-wrapper">
            <table className="employee-table">

              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Joining Date</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>

                    <td>
                      <div className="employee-table-name">
                        <div className="employee-avatar">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <strong>{employee.name}</strong>
                          <small>{employee.id}</small>
                        </div>
                      </div>
                    </td>

                    <td>{employee.department}</td>

                    <td>{employee.designation}</td>

                    <td>
                      {new Date(employee.joiningDate)
                        .toLocaleDateString("en-IN")}
                    </td>

                    <td>
                      ₹{Number(employee.salary).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={`employee-status ${
                          employee.status === "Active"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>

                    <td>
                      <div className="employee-actions">

                        <button
                          title="View"
                          onClick={() => setViewEmployee(employee)}
                          type="button"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          title="Edit"
                          onClick={() => handleEdit(employee)}
                          type="button"
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          title="Delete"
                          className="delete-action"
                          onClick={() => handleDelete(employee)}
                          type="button"
                        >
                          <Trash2 size={17} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan="7" className="empty-employees">
                      No employees found.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>
          </div>
        )}

        <div className="employee-table-footer">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>

      </div>

      {/* Add/Edit Modal */}
      <EmployeeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEmployee(null);
        }}
        onSubmit={handleSubmit}
        employee={selectedEmployee}
      />

      {/* View Employee Modal */}
      {viewEmployee && (
        <div
          className="modal-overlay"
          onClick={() => setViewEmployee(null)}
        >
          <div
            className="view-employee-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h2>Employee Details</h2>
                <p>Complete employee information</p>
              </div>

              <button
                className="modal-close"
                onClick={() => setViewEmployee(null)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <div className="view-employee-avatar">
              {viewEmployee.name.charAt(0).toUpperCase()}
            </div>

            <h3 className="view-employee-name">
              {viewEmployee.name}
            </h3>

            <p className="view-employee-id">
              {viewEmployee.id}
            </p>

            <div className="employee-detail-list">
              <p><strong>Email:</strong> {viewEmployee.email}</p>
              <p><strong>Phone:</strong> {viewEmployee.phone}</p>
              <p><strong>Department:</strong> {viewEmployee.department}</p>
              <p><strong>Designation:</strong> {viewEmployee.designation}</p>
              <p><strong>Joining Date:</strong> {viewEmployee.joiningDate}</p>
              <p>
                <strong>Salary:</strong> ₹
                {Number(viewEmployee.salary).toLocaleString("en-IN")}
              </p>
              <p><strong>Status:</strong> {viewEmployee.status}</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Employees;