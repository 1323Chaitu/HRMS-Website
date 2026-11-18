
import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  RefreshCw,
} from "lucide-react";

import {
  getLeaves,
  updateLeaveStatus,
} from "../services/leaveService";

import "../styles/LeaveManagement.css";

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLeaves();
      setLeaves(data);
    } catch (err) {
      setError(err.message || "Unable to load leave applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusUpdate = async (leaveId, status) => {
    try {
      setUpdatingId(leaveId);
      setError("");
      setMessage("");

      await updateLeaveStatus(leaveId, status);

      setLeaves((previousLeaves) =>
        previousLeaves.map((leave) =>
          leave.id === leaveId
            ? { ...leave, status }
            : leave
        )
      );

      setMessage(`Leave application ${status.toLowerCase()} successfully.`);
    } catch (err) {
      setError(err.message || "Unable to update leave application.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredLeaves = useMemo(() => {
    return leaves.filter((leave) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        (leave.employeeName || "").toLowerCase().includes(searchText) ||
        (leave.employeeId || "").toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All" || leave.status === statusFilter;

      const matchesType =
        typeFilter === "All" || leave.leaveType === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [leaves, search, statusFilter, typeFilter]);

  const pendingCount = leaves.filter(
    (leave) => leave.status === "Pending"
  ).length;

  const approvedCount = leaves.filter(
    (leave) => leave.status === "Approved"
  ).length;

  const rejectedCount = leaves.filter(
    (leave) => leave.status === "Rejected"
  ).length;

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDays = (leave) => {
    if (Number(leave.days) > 0) return Number(leave.days);
    if (!leave.startDate || !leave.endDate) return 0;

    const start = new Date(`${leave.startDate}T00:00:00`);
    const end = new Date(`${leave.endDate}T00:00:00`);

    return Math.max(
      0,
      Math.round((end - start) / 86400000) + 1
    );
  };

  return (
    <div className="leave-management-page">

      {/* Page Header */}
      <div className="leave-admin-header">
        <div>
          <h1>Leave Management</h1>
          <p>Review and manage employee leave applications.</p>
        </div>

        <button
          className="leave-refresh-button"
          onClick={fetchLeaves}
          disabled={loading}
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="leave-admin-stats">
        <div className="leave-admin-stat-card">
          <div className="leave-admin-stat-icon total">
            <CalendarDays size={23} />
          </div>
          <div>
            <span>Total Applications</span>
            <h2>{leaves.length}</h2>
          </div>
        </div>

        <div className="leave-admin-stat-card">
          <div className="leave-admin-stat-icon pending">
            <Clock size={23} />
          </div>
          <div>
            <span>Pending</span>
            <h2>{pendingCount}</h2>
          </div>
        </div>

        <div className="leave-admin-stat-card">
          <div className="leave-admin-stat-icon approved">
            <CheckCircle size={23} />
          </div>
          <div>
            <span>Approved</span>
            <h2>{approvedCount}</h2>
          </div>
        </div>

        <div className="leave-admin-stat-card">
          <div className="leave-admin-stat-icon rejected">
            <XCircle size={23} />
          </div>
          <div>
            <span>Rejected</span>
            <h2>{rejectedCount}</h2>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="leave-admin-message success">
          {message}
        </div>
      )}

      {error && (
        <div className="leave-admin-message error">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="leave-admin-filters">
        <div className="leave-admin-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search employee name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Leave Types</option>
          <option value="Casual Leave">Casual Leave</option>
          <option value="Sick Leave">Sick Leave</option>
          <option value="Earned Leave">Earned Leave</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="leave-admin-table-card">
        <div className="leave-admin-table-heading">
          <div>
            <h2>Employee Leave Applications</h2>
            <p>Review applications and update their status.</p>
          </div>
          <span>{filteredLeaves.length} applications</span>
        </div>

        {loading ? (
          <p className="leave-admin-empty">Loading applications...</p>
        ) : (
          <div className="leave-admin-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td>
                        <strong>
                          {leave.employeeName || "Employee"}
                        </strong>
                        <small>{leave.employeeId}</small>
                      </td>

                      <td>{leave.leaveType}</td>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td>{calculateDays(leave)}</td>
                      <td className="leave-admin-reason">
                        {leave.reason || "--"}
                      </td>

                      <td>
                        <span
                          className={`leave-admin-status ${(leave.status || "Pending").toLowerCase()}`}
                        >
                          {leave.status || "Pending"}
                        </span>
                      </td>

                      <td>
                        {leave.status === "Pending" ? (
                          <div className="leave-admin-actions">
                            <button
                              className="leave-approve-button"
                              disabled={updatingId === leave.id}
                              onClick={() =>
                                handleStatusUpdate(leave.id, "Approved")
                              }
                            >
                              {updatingId === leave.id
                                ? "Updating..."
                                : "Approve"}
                            </button>

                            <button
                              className="leave-reject-button"
                              disabled={updatingId === leave.id}
                              onClick={() =>
                                handleStatusUpdate(leave.id, "Rejected")
                              }
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="leave-action-completed">
                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="leave-admin-empty">
                      No leave applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;
