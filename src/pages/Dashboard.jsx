
import { useEffect, useState, useCallback } from "react";

import {
  Users,
  UserCheck,
  UserX,
  CalendarClock,
  Wallet,
  RefreshCw,
  ArrowUpRight
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import { getDashboardData } from "../services/dashboardService";

import "../styles/Dashboard.css";

const COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6"
];

function getLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function Dashboard() {
  const [data, setData] = useState({
    employees: [],
    attendance: [],
    leaves: [],
    payroll: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getDashboardData();

      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <RefreshCw className="loading-icon" size={30} />
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>Unable to load dashboard</h3>
        <p>{error}</p>

        <button onClick={fetchDashboard}>
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  const {
    employees,
    attendance,
    leaves,
    payroll
  } = data;

  // Current date
  const today = getLocalDate();

  // Employee statistics
  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  // Today's attendance
  const todayAttendance = attendance.filter(
    (record) => record.date === today
  );

  const presentToday = todayAttendance.filter(
    (record) =>
      record.status === "Present" ||
      record.status === "Late"
  ).length;

  const absentToday = todayAttendance.filter(
    (record) => record.status === "Absent"
  ).length;

  // Pending leave applications
  const pendingLeaves = leaves.filter(
    (leave) => leave.status === "Pending"
  ).length;

  // Current month payroll
  const currentMonth = new Date().toLocaleString(
    "en-US",
    { month: "long" }
  );

  const currentYear = new Date().getFullYear();

  const monthlyPayroll = payroll
    .filter(
      (record) =>
        record.month === currentMonth &&
        Number(record.year) === currentYear
    )
    .reduce(
      (total, record) =>
        total + Number(record.netSalary || 0),
      0
    );

  // Department-wise employee distribution
  const departmentCounts = employees.reduce(
    (result, employee) => {
      const department = employee.department || "Other";

      result[department] = (result[department] || 0) + 1;

      return result;
    },
    {}
  );

  const departmentData = Object.entries(
    departmentCounts
  ).map(([name, value]) => ({
    name,
    value
  }));

  // Last seven days attendance
  const attendanceData = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date();

      date.setDate(date.getDate() - (6 - index));

      const dateString = getLocalDate(date);

      const dayRecords = attendance.filter(
        (record) => record.date === dateString
      );

      return {
        day: date.toLocaleDateString("en-US", {
          weekday: "short"
        }),

        Present: dayRecords.filter(
          (record) => record.status === "Present"
        ).length,

        Late: dayRecords.filter(
          (record) => record.status === "Late"
        ).length,

        Absent: dayRecords.filter(
          (record) => record.status === "Absent"
        ).length
      };
    }
  );

  // Recently joined employees
  const recentEmployees = [...employees]
    .sort(
      (a, b) =>
        new Date(b.joiningDate) -
        new Date(a.joiningDate)
    )
    .slice(0, 5);

  // Dashboard statistics
  const stats = [
    {
      title: "Total Employees",
      value: totalEmployees,
      subtitle: `${activeEmployees} active employees`,
      icon: Users,
      color: "blue"
    },
    {
      title: "Present Today",
      value: presentToday,
      subtitle: `${absentToday} absent today`,
      icon: UserCheck,
      color: "green"
    },
    {
      title: "Absent Today",
      value: absentToday,
      subtitle: `${todayAttendance.length} attendance records`,
      icon: UserX,
      color: "red"
    },
    {
      title: "Pending Leaves",
      value: pendingLeaves,
      subtitle: "Awaiting approval",
      icon: CalendarClock,
      color: "orange"
    },
    {
      title: "Monthly Payroll",
      value: `₹${monthlyPayroll.toLocaleString("en-IN")}`,
      subtitle: `${currentMonth} ${currentYear}`,
      icon: Wallet,
      color: "purple"
    }
  ];

  return (
    <div className="dashboard">

      {/* Dashboard Heading */}
      <div className="dashboard-heading">
        <div>
          <h1>Dashboard Overview</h1>
          <p>
            Welcome back! Here's what's happening
            in your organization.
          </p>
        </div>

        <div className="dashboard-heading-right">
          <span className="dashboard-date">
            {new Date().toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}
          </span>

          <button
            className="refresh-button"
            onClick={fetchDashboard}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div className="stat-card" key={item.title}>

              <div className="stat-top">
                <span>{item.title}</span>

                <div className={`stat-icon ${item.color}`}>
                  <Icon size={21} />
                </div>
              </div>

              <h2>{item.value}</h2>

              <div className="stat-change">
                <ArrowUpRight size={15} />
                {item.subtitle}
              </div>

            </div>
          );
        })}

      </div>

      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <div>
          <h2>Welcome to SmartHRMS!</h2>

          <p>
            Manage your employees, attendance,
            payroll and organizational activities
            from one place.
          </p>
        </div>

        <Users size={65} />
      </div>

      {/* Charts */}
      <div className="charts-grid">

        {/* Attendance Chart */}
        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Attendance Overview</h3>
              <p>Employee attendance for the last 7 days</p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />

                <Tooltip />
                <Legend />

                <Bar
                  dataKey="Present"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="Late"
                  fill="#f59e0b"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="Absent"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />

              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Chart */}
        <div className="dashboard-panel">
          <div className="panel-heading">
            <div>
              <h3>Department Distribution</h3>
              <p>Employees across departments</p>
            </div>
          </div>

          <div className="chart-container">
            {departmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    label
                  >
                    {departmentData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="empty-chart">
                No department data available.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Recent Employees */}
      <div className="dashboard-panel recent-panel">

        <div className="panel-heading">
          <div>
            <h3>Recent Employees</h3>
            <p>Latest employees added to the organization</p>
          </div>

          <span className="employee-count">
            {totalEmployees} Employees
          </span>
        </div>

        <div className="table-wrapper">
          <table className="recent-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-name">
                      <div className="employee-initial">
                        {employee.name.charAt(0)}
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
                    {new Date(
                      employee.joiningDate
                    ).toLocaleDateString("en-IN")}
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        employee.status === "Active"
                          ? "status-active"
                          : "status-inactive"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))}

              {recentEmployees.length === 0 && (
                <tr>
                  <td colSpan="5">
                    No employees available.
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

export default Dashboard;
