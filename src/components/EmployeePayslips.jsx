
import { useEffect, useState } from "react";
import { Receipt, Printer, Eye, X, RefreshCw } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getEmployeePayroll } from "../services/payrollService";

import "../styles/EmployeePayslips.css";

const EmployeePayslips = () => {
  const { user } = useAuth();

  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getEmployeePayroll(user.employeeId);

      setRecords(
        [...data].sort((a, b) => {
          const dateA = Number(a.year) * 12;
          const dateB = Number(b.year) * 12;

          return dateB - dateA;
        })
      );
    } catch (err) {
      setError(err.message || "Unable to load payslips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.employeeId) {
      fetchPayslips();
    }
  }, [user?.employeeId]);

  const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });

  const getSalaryDetails = (record) => {
    const basicSalary = Number(record.basicSalary || 0);
    const hra = Number(record.hra || 0);
    const allowances = Number(record.allowances || 0);
    const deductions = Number(record.deductions || 0);

    const grossSalary =
      record.grossSalary !== undefined
        ? Number(record.grossSalary)
        : basicSalary + hra + allowances;

    const netSalary =
      record.netSalary !== undefined
        ? Number(record.netSalary)
        : grossSalary - deductions;

    return {
      basicSalary,
      hra,
      allowances,
      grossSalary,
      deductions,
      netSalary,
    };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <section className="employee-payslips">

      {/* Payslip Header */}
      <div className="payslip-section-header no-print">
        <div>
          <h2>My Payslips</h2>
          <p>View and print your monthly salary statements.</p>
        </div>

        <button
          className="payslip-refresh-btn"
          onClick={fetchPayslips}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="payslip-error no-print">
          {error}
        </div>
      )}

      {loading ? (
        <p className="payslip-empty no-print">Loading payslips...</p>
      ) : records.length === 0 ? (
        <div className="payslip-empty no-print">
          <Receipt size={35} />
          <p>No payroll records available yet.</p>
        </div>
      ) : (
        <div className="payslip-table-wrapper no-print">
          <table>
            <thead>
              <tr>
                <th>Payroll ID</th>
                <th>Month</th>
                <th>Basic Salary</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => {
                const salary = getSalaryDetails(record);

                return (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.month} {record.year}</td>
                    <td>{formatCurrency(salary.basicSalary)}</td>
                    <td className="payslip-net">
                      {formatCurrency(salary.netSalary)}
                    </td>
                    <td>
                      <span
                        className={`payslip-status ${(record.status || "Pending").toLowerCase()}`}
                      >
                        {record.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="payslip-view-btn"
                        onClick={() => setSelectedRecord(record)}
                      >
                        <Eye size={15} />
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Payslip Details */}
      {selectedRecord && (
        <div className="payslip-modal-overlay no-print">
          <div className="payslip-modal">

            <div className="payslip-modal-actions">
              <button
                className="payslip-print-btn"
                onClick={handlePrint}
              >
                <Printer size={17} />
                Print Payslip
              </button>

              <button
                className="payslip-close-btn"
                onClick={() => setSelectedRecord(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="printable-payslip" id="printable-payslip">
              <div className="payslip-document-header">
                <div>
                  <h1>EMPLOYEE PAYSLIP</h1>
                  <p>Monthly Salary Statement</p>
                </div>

                <Receipt size={38} />
              </div>

              <div className="payslip-document-info">
                <div>
                  <span>Employee ID</span>
                  <strong>{selectedRecord.employeeId}</strong>
                </div>

                <div>
                  <span>Payroll ID</span>
                  <strong>{selectedRecord.id}</strong>
                </div>

                <div>
                  <span>Pay Period</span>
                  <strong>
                    {selectedRecord.month} {selectedRecord.year}
                  </strong>
                </div>

                <div>
                  <span>Payment Status</span>
                  <strong>{selectedRecord.status}</strong>
                </div>
              </div>

              <h3 className="payslip-breakdown-title">
                Salary Breakdown
              </h3>

              {(() => {
                const salary = getSalaryDetails(selectedRecord);

                return (
                  <>
                    <table className="payslip-breakdown-table">
                      <tbody>
                        <tr>
                          <td>Basic Salary</td>
                          <td>{formatCurrency(salary.basicSalary)}</td>
                        </tr>
                        <tr>
                          <td>House Rent Allowance (HRA)</td>
                          <td>{formatCurrency(salary.hra)}</td>
                        </tr>
                        <tr>
                          <td>Other Allowances</td>
                          <td>{formatCurrency(salary.allowances)}</td>
                        </tr>
                        <tr className="payslip-gross-row">
                          <td>Gross Salary</td>
                          <td>{formatCurrency(salary.grossSalary)}</td>
                        </tr>
                        <tr>
                          <td>Total Deductions</td>
                          <td>{formatCurrency(salary.deductions)}</td>
                        </tr>
                        <tr className="payslip-net-row">
                          <td>Net Salary</td>
                          <td>{formatCurrency(salary.netSalary)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="payslip-net-highlight">
                      <span>Net Payable Amount</span>
                      <strong>{formatCurrency(salary.netSalary)}</strong>
                    </div>
                  </>
                );
              })()}

              <p className="payslip-footer">
                This is a computer-generated payslip for demonstration
                purposes.
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EmployeePayslips;
