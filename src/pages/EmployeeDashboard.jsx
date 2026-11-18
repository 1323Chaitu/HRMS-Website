
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  LogOut,
  User,
  UserCheck,
  UserX,
  RefreshCw,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import {
  getTodayDate,
  getEmployeeAttendance,
  checkInEmployee,
  checkOutEmployee,
} from "../services/attendanceService";

import { getEmployeeLeaves } from "../services/leaveService";

import EmployeeLeave from "../components/EmployeeLeave";
import EmployeeLeaveHistory from "../components/EmployeeLeaveHistory";
import EmployeePayslips from "../components/EmployeePayslips";
import EmployeePerformance from "../components/EmployeePerformance";
import EmployeeTasks from "../components/EmployeeTasks";
import EmployeeDocuments from "../components/EmployeeDocuments";

import "../styles/EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [leaveHistory, setLeaveHistory] = useState([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [leaveRefresh, setLeaveRefresh] = useState(0);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const today = getTodayDate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const attendanceRecords = await getEmployeeAttendance(
        user.employeeId
      );

      const todayAttendance = attendanceRecords.find(
        (record) => record.date === today
      );

      setTodayRecord(todayAttendance || null);

      const sortedHistory = [...attendanceRecords].sort(
        (a, b) => b.date.localeCompare(a.date)
      );

      setHistory(sortedHistory);

      const leaves = await getEmployeeLeaves(user.employeeId);
      setLeaveHistory(leaves);
    } catch (err) {
      setError("Unable to load dashboard information.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.employeeId) {
      fetchDashboardData();
    }
  }, [user?.employeeId, leaveRefresh]);

  const handleAttendance = async (action) => {
    try {
      setActionLoading(true);
      setMessage("");
      setError("");

      if (action === "checkin") {
        await checkInEmployee(user.employeeId);
        setMessage("Check-in recorded successfully!");
      } else {
        await checkOutEmployee(user.employeeId);
        setMessage("Check-out recorded successfully!");
      }

      await fetchDashboardData();
    } catch (err) {
      setError(err.message || "Attendance action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (date) => {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const currentTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (loading) {
    return (
      <div className="employee-dashboard">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="employee-dashboard">

      <div className="employee-dashboard-header">
        <div>
          <h1>
            Welcome, {user?.username || user?.name || "Employee"}!
          </h1>
          <p>Manage your attendance, leaves and payslips.</p>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          <LogOut size={17} />
          Logout
        </button>
      </div>

      <div className="employee-info-card">
        <div className="employee-info-icon">
          <User size={28} />
        </div>

        <div>
          <h3>{user?.username || user?.name || "Employee"}</h3>
          <p>Employee ID: {user?.employeeId}</p>
          <p>Role: Employee</p>
        </div>
      </div>

      {/* Attendance */}
      <div className="employee-attendance-panel">
        <div className="employee-section-heading">
          <div>
            <h2>My Attendance</h2>
            <p>Record your daily check-in and check-out.</p>
          </div>
          <CalendarDays size={25} />
        </div>

        <div className="attendance-time-details">
          <div>
            <span>Today's Date</span>
            <h3>{formatDate(today)}</h3>
          </div>

          <div>
            <span>Current Time</span>
            <h3>{currentTime}</h3>
          </div>

          <div>
            <span>Attendance Status</span>
            <h3>{todayRecord?.status || "Not Marked"}</h3>
          </div>
        </div>

        {message && (
          <div className="attendance-message success">
            {message}
          </div>
        )}

        {error && (
          <div className="attendance-message error">
            {error}
          </div>
        )}

        {todayRecord?.status === "Absent" ? (
          <div className="attendance-message error">
            Your attendance has been marked as Absent today.
          </div>
        ) : (
          <>
            <div className="attendance-buttons">
              <button
                className="checkin-btn"
                onClick={() => handleAttendance("checkin")}
                disabled={actionLoading || !!todayRecord}
              >
                <UserCheck size={18} />
                {actionLoading && !todayRecord
                  ? "Processing..."
                  : "Check In"}
              </button>

              <button
                className="checkout-btn"
                onClick={() => handleAttendance("checkout")}
                disabled={
                  actionLoading ||
                  !todayRecord?.checkIn ||
                  !!todayRecord?.checkOut
                }
              >
                <UserX size={18} />
                {actionLoading && todayRecord?.checkIn
                  ? "Processing..."
                  : "Check Out"}
              </button>
            </div>

            {todayRecord && (
              <div className="attendance-time-details">
                <div>
                  <span>Check-in Time</span>
                  <h3>{todayRecord.checkIn || "--"}</h3>
                </div>

                <div>
                  <span>Check-out Time</span>
                  <h3>{todayRecord.checkOut || "Not checked out"}</h3>
                </div>
              </div>
            )}
          </>
        )}

        <button
          className="attendance-refresh-btn"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh Attendance
        </button>
      </div>

      {/* Attendance History */}
      <div className="employee-history">
        <div className="employee-section-heading">
          <div>
            <h2>Attendance History</h2>
            <p>Your recent attendance records.</p>
          </div>
          <Clock size={24} />
        </div>

        <div className="employee-history-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Status</th>
                <th>Check In</th>
                <th>Check Out</th>
              </tr>
            </thead>

            <tbody>
              {history.length > 0 ? (
                history.map((record) => (
                  <tr key={record.id}>
                    <td>{formatDate(record.date)}</td>
                    <td>
                      <span
                        className={`attendance-status ${record.status.toLowerCase()}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td>{record.checkIn || "--"}</td>
                    <td>{record.checkOut || "--"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Application */}
      <EmployeeLeave
        onLeaveSubmitted={() =>
          setLeaveRefresh((previous) => previous + 1)
        }
      />

      {/* Leave Balances and History */}
      <EmployeeLeaveHistory leaves={leaveHistory} />

      {/* Employee Payslips */}
      <EmployeePayslips />

      <EmployeePerformance />

      <EmployeeTasks />

      <EmployeeDocuments />

    </div>
  );
};

export default EmployeeDashboard;
