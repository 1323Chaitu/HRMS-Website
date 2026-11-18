
import {
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

import "../styles/EmployeeLeaveHistory.css";

const LEAVE_ENTITLEMENTS = {
  "Casual Leave": 12,
  "Sick Leave": 10,
  "Earned Leave": 15,
};

const calculateDays = (leave) => {
  if (Number(leave.days) > 0) {
    return Number(leave.days);
  }

  if (!leave.startDate || !leave.endDate) {
    return 0;
  }

  const start = new Date(`${leave.startDate}T00:00:00`);
  const end = new Date(`${leave.endDate}T00:00:00`);

  return Math.max(
    0,
    Math.round((end - start) / 86400000) + 1
  );
};

const formatDate = (date) => {
  if (!date) return "--";

  return new Date(`${date}T00:00:00`).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const EmployeeLeaveHistory = ({ leaves = [] }) => {
  const approvedLeaves = leaves.filter(
    (leave) => leave.status === "Approved"
  );

  const pendingCount = leaves.filter(
    (leave) => leave.status === "Pending"
  ).length;

  const approvedCount = approvedLeaves.length;

  const rejectedCount = leaves.filter(
    (leave) => leave.status === "Rejected"
  ).length;

  const leaveBalances = Object.entries(LEAVE_ENTITLEMENTS).map(
    ([leaveType, totalDays]) => {
      const usedDays = approvedLeaves
        .filter((leave) => leave.leaveType === leaveType)
        .reduce((total, leave) => total + calculateDays(leave), 0);

      return {
        leaveType,
        totalDays,
        usedDays,
        remainingDays: Math.max(0, totalDays - usedDays),
      };
    }
  );

  const sortedLeaves = [...leaves].sort((a, b) => {
    return (b.appliedDate || b.startDate || "").localeCompare(
      a.appliedDate || a.startDate || ""
    );
  });

  return (
    <div className="employee-leave-history">

      {/* Leave Balance */}
      <section className="leave-balance-section">
        <div className="leave-history-heading">
          <div>
            <h2>My Leave Balance</h2>
            <p>Overview of your annual leave entitlement.</p>
          </div>

          <CalendarDays size={25} />
        </div>

        <div className="leave-balance-grid">
          {leaveBalances.map((balance) => {
            const percentage =
              balance.totalDays > 0
                ? Math.min(
                    100,
                    (balance.usedDays / balance.totalDays) * 100
                  )
                : 0;

            return (
              <div
                className="leave-balance-card"
                key={balance.leaveType}
              >
                <h3>{balance.leaveType}</h3>

                <div className="leave-balance-number">
                  <strong>{balance.remainingDays}</strong>
                  <span>days remaining</span>
                </div>

                <div className="leave-progress-track">
                  <div
                    className="leave-progress-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="leave-balance-details">
                  <span>Used: {balance.usedDays}</span>
                  <span>Total: {balance.totalDays}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="leave-balance-note">
          Leave balances are calculated from approved applications only.
        </div>
      </section>

      {/* Leave Summary */}
      <section className="leave-summary-section">
        <div className="leave-summary-card">
          <Clock size={21} />
          <div>
            <strong>{pendingCount}</strong>
            <span>Pending</span>
          </div>
        </div>

        <div className="leave-summary-card">
          <CheckCircle size={21} />
          <div>
            <strong>{approvedCount}</strong>
            <span>Approved</span>
          </div>
        </div>

        <div className="leave-summary-card">
          <XCircle size={21} />
          <div>
            <strong>{rejectedCount}</strong>
            <span>Rejected</span>
          </div>
        </div>
      </section>

      {/* Leave History */}
      <section className="leave-history-section">
        <div className="leave-history-heading">
          <div>
            <h2>My Leave History</h2>
            <p>View all your submitted leave applications.</p>
          </div>
        </div>

        <div className="leave-history-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>From</th>
                <th>To</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Applied On</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {sortedLeaves.length > 0 ? (
                sortedLeaves.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.leaveType}</td>
                    <td>{formatDate(leave.startDate)}</td>
                    <td>{formatDate(leave.endDate)}</td>
                    <td>{calculateDays(leave)}</td>
                    <td className="leave-reason-cell">
                      {leave.reason || "--"}
                    </td>
                    <td>{formatDate(leave.appliedDate)}</td>
                    <td>
                      <span
                        className={`leave-history-status ${(
                          leave.status || "Pending"
                        ).toLowerCase()}`}
                      >
                        {leave.status || "Pending"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="leave-empty-message">
                    You haven't submitted any leave applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default EmployeeLeaveHistory;
