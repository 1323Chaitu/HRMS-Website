
import { useEffect, useMemo, useState } from "react";
import {
  Wallet,
  Users,
  CheckCircle,
  Clock,
  Search,
  RefreshCw,
  Plus,
  X,
} from "lucide-react";

import { getEmployees } from "../services/employeeService";
import {
  getPayroll,
  createPayroll,
  updatePayrollStatus,
  calculateSalary,
} from "../services/payrollService";

import "../styles/Payroll.css";

const MONTHS = [
  "January", "February", "March", "April",
  "May", "June", "July", "August",
  "September", "October", "November", "December",
];

const Payroll = () => {
  const now = new Date();

  const [employees, setEmployees] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState(String(now.getFullYear()));

  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    month: MONTHS[now.getMonth()],
    year: String(now.getFullYear()),
    basicSalary: "",
    hra: "",
    allowances: "",
    deductions: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [employeeData, payrollData] = await Promise.all([
        getEmployees(),
        getPayroll(),
      ]);

      setEmployees(employeeData);
      setPayroll(payrollData);
    } catch (err) {
      setError(err.message || "Unable to load payroll data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedEmployee = employees.find(
    (employee) => employee.id === formData.employeeId
  );

  const salaryCalculation = calculateSalary({
    basicSalary: formData.basicSalary,
    hra: formData.hra,
    allowances: formData.allowances,
    deductions: formData.deductions,
  });

  const filteredPayroll = useMemo(() => {
    return payroll.filter((record) => {
      const employee = employees.find(
        (item) => item.id === record.employeeId
      );

      const searchText = search.toLowerCase();

      const matchesSearch =
        (employee?.name || "").toLowerCase().includes(searchText) ||
        record.employeeId.toLowerCase().includes(searchText);

      const matchesMonth =
        monthFilter === "All" || record.month === monthFilter;

      const matchesYear =
        yearFilter === "All" || String(record.year) === yearFilter;

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter;

      return (
        matchesSearch &&
        matchesMonth &&
        matchesYear &&
        matchesStatus
      );
    });
  }, [payroll, employees, search, monthFilter, yearFilter, statusFilter]);

  const totalPayroll = filteredPayroll.reduce(
    (sum, record) => sum + Number(record.netSalary || 0),
    0
  );

  const processedCount = filteredPayroll.filter(
    (record) => record.status === "Processed"
  ).length;

  const pendingCount = filteredPayroll.filter(
    (record) => record.status === "Pending"
  ).length;

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openModal = () => {
    setError("");
    setMessage("");

    setFormData({
      employeeId: "",
      month: MONTHS[now.getMonth()],
      year: String(now.getFullYear()),
      basicSalary: "",
      hra: "0",
      allowances: "0",
      deductions: "0",
    });

    setShowModal(true);
  };

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!formData.employeeId || !formData.basicSalary) {
      setError("Please select an employee and enter basic salary.");
      return;
    }

    const basicSalary = Number(formData.basicSalary);
    const hra = Number(formData.hra);
    const allowances = Number(formData.allowances);
    const deductions = Number(formData.deductions);
    const year = Number(formData.year);

    if (
      ![basicSalary, hra, allowances, deductions].every(Number.isFinite) ||
      basicSalary <= 0 ||
      hra < 0 ||
      allowances < 0 ||
      deductions < 0 ||
      !Number.isInteger(year) ||
      year < 2000 ||
      year > 2100
    ) {
      setError("Enter valid salary amounts and year.");
      return;
    }

    if (deductions > basicSalary + hra + allowances) {
      setError("Deductions cannot exceed gross salary.");
      return;
    }

    const duplicate = payroll.some(
      (record) =>
        record.employeeId === formData.employeeId &&
        record.month === formData.month &&
        Number(record.year) === year
    );

    if (duplicate) {
      setError("Payroll already exists for this employee and month.");
      return;
    }

    try {
      setSaving(true);

      const calculation = calculateSalary({
        basicSalary,
        hra,
        allowances,
        deductions,
      });

      const newRecord = {
        id: `PAY${Date.now()}`,
        employeeId: formData.employeeId,
        employeeName: selectedEmployee?.name || "",
        month: formData.month,
        year,
        basicSalary,
        hra,
        allowances,
        deductions,
        grossSalary: calculation.grossSalary,
        netSalary: calculation.netSalary,
        status: "Pending",
        generatedDate: new Date().toISOString().split("T")[0],
      };

      await createPayroll(newRecord);

      setPayroll((previous) => [...previous, newRecord]);
      setShowModal(false);
      setMessage("Payroll generated successfully!");
    } catch (err) {
      setError(err.message || "Unable to generate payroll.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (record) => {
    try {
      setError("");
      setMessage("");

      await updatePayrollStatus(record.id, "Processed");

      setPayroll((previous) =>
        previous.map((item) =>
          item.id === record.id
            ? { ...item, status: "Processed" }
            : item
        )
      );

      setMessage("Payroll marked as processed.");
    } catch (err) {
      setError(err.message || "Unable to update payroll status.");
    }
  };

  const getEmployeeName = (record) => {
    const employee = employees.find(
      (item) => item.id === record.employeeId
    );

    return employee?.name || record.employeeName || record.employeeId;
  };

  return (
    <div className="payroll-page">

      {/* Header */}
      <div className="payroll-header">
        <div>
          <h1>Payroll Management</h1>
          <p>Manage employee salaries and monthly payments.</p>
        </div>

        <div className="payroll-header-actions">
          <button
            className="payroll-refresh-btn"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw size={17} /> Refresh
          </button>

          <button className="payroll-add-btn" onClick={openModal}>
            <Plus size={18} /> Generate Payroll
          </button>
        </div>
      </div>

      {message && <div className="payroll-alert success">{message}</div>}
      {error && <div className="payroll-alert error">{error}</div>}

      {/* Statistics */}
      <div className="payroll-stat-grid">
        <div className="payroll-stat-card">
          <div className="payroll-stat-icon purple">
            <Wallet size={23} />
          </div>
          <div>
            <span>Total Net Payroll</span>
            <h2>{formatCurrency(totalPayroll)}</h2>
          </div>
        </div>

        <div className="payroll-stat-card">
          <div className="payroll-stat-icon blue">
            <Users size={23} />
          </div>
          <div>
            <span>Payroll Records</span>
            <h2>{filteredPayroll.length}</h2>
          </div>
        </div>

        <div className="payroll-stat-card">
          <div className="payroll-stat-icon green">
            <CheckCircle size={23} />
          </div>
          <div>
            <span>Processed</span>
            <h2>{processedCount}</h2>
          </div>
        </div>

        <div className="payroll-stat-card">
          <div className="payroll-stat-icon orange">
            <Clock size={23} />
          </div>
          <div>
            <span>Pending</span>
            <h2>{pendingCount}</h2>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="payroll-filters">
        <div className="payroll-search">
          <Search size={18} />
          <input
            placeholder="Search employee name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
        >
          <option value="All">All Months</option>
          {MONTHS.map((month) => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>

        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="All">All Years</option>
          {Array.from(
            new Set(payroll.map((record) => String(record.year)))
          ).sort().reverse().map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processed">Processed</option>
        </select>
      </div>

      {/* Payroll Table */}
      <div className="payroll-table-card">
        <div className="payroll-table-heading">
          <div>
            <h2>Employee Payroll Records</h2>
            <p>Monthly salary and payment details.</p>
          </div>
          <span>{filteredPayroll.length} records</span>
        </div>

        {loading ? (
          <p className="payroll-empty">Loading payroll records...</p>
        ) : (
          <div className="payroll-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Period</th>
                  <th>Basic Salary</th>
                  <th>Gross Salary</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayroll.length > 0 ? (
                  filteredPayroll.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <strong>{getEmployeeName(record)}</strong>
                        <small>{record.employeeId}</small>
                      </td>

                      <td>{record.month} {record.year}</td>
                      <td>{formatCurrency(record.basicSalary)}</td>
                      <td>
                        {formatCurrency(
                          record.grossSalary ??
                          (Number(record.basicSalary || 0) +
                            Number(record.hra || 0) +
                            Number(record.allowances || 0))
                        )}
                      </td>
                      <td>{formatCurrency(record.deductions)}</td>
                      <td className="payroll-net-salary">
                        {formatCurrency(record.netSalary)}
                      </td>

                      <td>
                        <span
                          className={`payroll-status ${record.status.toLowerCase()}`}
                        >
                          {record.status}
                        </span>
                      </td>

                      <td>
                        {record.status === "Pending" ? (
                          <button
                            className="payroll-process-btn"
                            onClick={() => handleStatusUpdate(record)}
                          >
                            Mark Processed
                          </button>
                        ) : (
                          <span className="payroll-completed">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="payroll-empty">
                      No payroll records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Generate Payroll Modal */}
      {showModal && (
        <div
          className="payroll-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="payroll-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="payroll-modal-header">
              <div>
                <h2>Generate Payroll</h2>
                <p>Enter employee salary information.</p>
              </div>

              <button
                className="payroll-close-btn"
                onClick={() => setShowModal(false)}
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleGeneratePayroll}>
              <div className="payroll-form-grid">

                <div className="payroll-form-group full">
                  <label>Employee</label>
                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees
                      .filter((employee) => employee.status === "Active")
                      .map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} ({employee.id})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="payroll-form-group">
                  <label>Month</label>
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleFormChange}
                  >
                    {MONTHS.map((month) => (
                      <option key={month}>{month}</option>
                    ))}
                  </select>
                </div>

                <div className="payroll-form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    name="year"
                    min="2000"
                    max="2100"
                    value={formData.year}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="payroll-form-group">
                  <label>Basic Salary (₹)</label>
                  <input
                    type="number"
                    name="basicSalary"
                    min="1"
                    value={formData.basicSalary}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="payroll-form-group">
                  <label>HRA (₹)</label>
                  <input
                    type="number"
                    name="hra"
                    min="0"
                    value={formData.hra}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="payroll-form-group">
                  <label>Other Allowances (₹)</label>
                  <input
                    type="number"
                    name="allowances"
                    min="0"
                    value={formData.allowances}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="payroll-form-group">
                  <label>Deductions (₹)</label>
                  <input
                    type="number"
                    name="deductions"
                    min="0"
                    value={formData.deductions}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="payroll-calculation-preview">
                <div>
                  <span>Gross Salary</span>
                  <strong>{formatCurrency(salaryCalculation.grossSalary)}</strong>
                </div>
                <div>
                  <span>Total Deductions</span>
                  <strong>{formatCurrency(salaryCalculation.totalDeductions)}</strong>
                </div>
                <div className="payroll-preview-net">
                  <span>Net Salary</span>
                  <strong>{formatCurrency(salaryCalculation.netSalary)}</strong>
                </div>
              </div>

              <button
                type="submit"
                className="payroll-submit-btn"
                disabled={saving}
              >
                {saving ? "Generating..." : "Generate Payroll"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
