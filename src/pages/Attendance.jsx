
import { useEffect, useMemo, useState } from "react";

import {
  CalendarCheck,
  UserCheck,
  UserX,
  Clock,
  RefreshCw,
  Search
} from "lucide-react";

import { getEmployees } from "../services/employeeService";

import {
  getAttendance,
  getTodayDate,
  markEmployeeAbsent
} from "../services/attendanceService";

import "../styles/Attendance.css";

function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [employeeData, attendanceData] = await Promise.all([
        getEmployees(),
        getAttendance()
      ]);

      setEmployees(employeeData);
      setAttendance(attendanceData);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const dailyRecords = useMemo(() => {
    return employees
      .filter((employee) => employee.status === "Active")
      .map((employee) => {
        const record = attendance.find(
          (item) =>
            item.employeeId === employee.id &&
            item.date === selectedDate
        );

        return {
          ...employee,
          attendanceId: record?.id || null,
          attendanceStatus: record?.status || "Not Marked",
          checkIn: record?.checkIn || "-",
          checkOut: record?.checkOut || "-"
        };
      });
  }, [employees, attendance, selectedDate]);

  const presentCount = dailyRecords.filter(
    (record) =>
      record.attendanceStatus === "Present" ||
      record.attendanceStatus === "Late"
  ).length;

  const lateCount = dailyRecords.filter(
    (record) => record.attendanceStatus === "Late"
  ).length;

  const absentCount = dailyRecords.filter(
    (record) => record.attendanceStatus === "Absent"
  ).length;

  const pendingCount = dailyRecords.filter(
    (record) => record.attendanceStatus === "Not Marked"
  ).length;

  const filteredRecords = dailyRecords.filter((record) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      record.name.toLowerCase().includes(searchValue) ||
      record.id.toLowerCase().includes(searchValue);

    const matchesDepartment =
      department === "All" ||
      record.department === department;

    const matchesStatus =
      statusFilter === "All" ||
      record.attendanceStatus === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const departments = [
    ...new Set(employees.map((employee) => employee.department))
  ].filter(Boolean);

  const handleMarkAbsent = async (employee) => {
    const confirmed = window.confirm(
      `Mark ${employee.name} as absent on ${selectedDate}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const result = await markEmployeeAbsent(
        employee.id,
        selectedDate
      );

      setAttendance((previous) => [...previous, result]);

      setSuccess(`${employee.name} marked as absent.`);
      window.setTimeout(() => setSuccess(""), 3000);

    } catch (err) {
      setError(err.message);
    }
  };

  const attendanceRate =
    dailyRecords.length > 0
      ? Math.round((presentCount / dailyRecords.length) * 100)
      : 0;

  return (
    <div className="attendance-page">

      <div className="attendance-heading">
        <div>
          <h1>Attendance Management</h1>
          <p>Monitor and manage daily employee attendance.</p>
        </div>

        <button
          className="attendance-refresh"
          onClick={fetchData}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="attendance-error">{error}</div>
      )}

      {success && (
        <div className="attendance-success">{success}</div>
      )}

      <div className="attendance-date-filter">
        <CalendarCheck size={19} />

        <label htmlFor="attendance-date">
          Select Date
        </label>

        <input
          id="attendance-date"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {/* Statistics */}
      <div className="attendance-stats">

        <div className="attendance-stat-card">
          <UsersIcon />
          <div>
            <span>Total Active Employees</span>
            <h2>{dailyRecords.length}</h2>
          </div>
        </div>

        <div className="attendance-stat-card">
          <UserCheck size={23} />
          <div>
            <span>Present</span>
            <h2>{presentCount}</h2>
          </div>
        </div>

        <div className="attendance-stat-card">
          <UserX size={23} />
          <div>
            <span>Absent</span>
            <h2>{absentCount}</h2>
          </div>
        </div>

        <div className="attendance-stat-card">
          <Clock size={23} />
          <div>
            <span>Late Arrivals</span>
            <h2>{lateCount}</h2>
          </div>
        </div>

      </div>

      <div className="attendance-rate-panel">
        <div>
          <h3>Attendance Rate</h3>
          <p>
            {presentCount} out of {dailyRecords.length} active employees
            recorded as present or late.
          </p>
        </div>

        <strong>{attendanceRate}%</strong>
      </div>

      {/* Attendance Records */}
      <div className="attendance-table-panel">

        <div className="attendance-toolbar">

          <div className="attendance-search">
            <Search size={18} />

            <input
              placeholder="Search employee..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="All">All Departments</option>

            {departments.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Present">Present</option>
            <option value="Late">Late</option>
            <option value="Absent">Absent</option>
            <option value="Not Marked">Not Marked</option>
          </select>

        </div>

        {loading ? (
          <div className="attendance-loading">
            <RefreshCw size={25} />
            <p>Loading attendance records...</p>
          </div>
        ) : (
          <div className="attendance-table-wrapper">
            <table className="attendance-table">

              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="attendance-employee">
                        <strong>{record.name}</strong>
                        <small>{record.id}</small>
                      </div>
                    </td>

                    <td>{record.department}</td>

                    <td>{record.checkIn}</td>
                    <td>{record.checkOut}</td>

                    <td>
                      <span
                        className={`attendance-badge ${record.attendanceStatus
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        {record.attendanceStatus}
                      </span>
                    </td>

                    <td>
                      {record.attendanceStatus === "Not Marked" ? (
                        <button
                          className="mark-absent-btn"
                          onClick={() => handleMarkAbsent(record)}
                        >
                          Mark Absent
                        </button>
                      ) : (
                        <span className="attendance-recorded">
                          Recorded
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan="6" className="attendance-empty">
                      No attendance records found.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        )}

        <div className="attendance-footer">
          Showing {filteredRecords.length} of {dailyRecords.length} employees
          <span>{pendingCount} not marked</span>
        </div>

      </div>

    </div>
  );
}

function UsersIcon() {
  return <CalendarCheck size={23} />;
}

export default Attendance;
