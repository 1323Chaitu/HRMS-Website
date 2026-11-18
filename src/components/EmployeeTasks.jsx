import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getEmployeeTasks,
  updateTaskStatus,
} from "../services/taskService";
import "../styles/EmployeeTasks.css";

function EmployeeTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    if (!user?.employeeId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getEmployeeTasks(user.employeeId);
      setTasks(
        data.sort(
          (a, b) =>
            new Date(a.dueDate || "9999-12-31") -
            new Date(b.dueDate || "9999-12-31")
        )
      );
    } catch (err) {
      setError("Unable to load your assigned tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [user?.employeeId]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status);
      await loadTasks();
    } catch (err) {
      alert("Unable to update task status.");
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const pendingCount = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const inProgressCount = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const completedCount = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  if (loading) {
    return (
      <section className="employee-tasks-section">
        <p>Loading your tasks...</p>
      </section>
    );
  }

  return (
    <section className="employee-tasks-section">
      <div className="employee-tasks-heading">
        <div>
          <h2>My Assigned Tasks</h2>
          <p>View your assigned work and update its progress.</p>
        </div>
      </div>

      {error && <div className="employee-tasks-error">{error}</div>}

      <div className="employee-tasks-summary">
        <div>
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>
        <div>
          <span>In Progress</span>
          <strong>{inProgressCount}</strong>
        </div>
        <div>
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="employee-tasks-empty">
          <h3>No tasks assigned yet</h3>
          <p>Your manager's assigned tasks will appear here.</p>
        </div>
      ) : (
        <div className="employee-tasks-list">
          {tasks.map((task) => {
            const overdue =
              task.status !== "Completed" &&
              task.dueDate &&
              task.dueDate < today;

            return (
              <article className="employee-task-card" key={task.id}>
                <div className="employee-task-main">
                  <div>
                    <h3>{task.title}</h3>
                    <p>{task.description}</p>
                  </div>

                  <span
                    className={`employee-task-priority ${task.priority?.toLowerCase()}`}
                  >
                    {task.priority || "Medium"} Priority
                  </span>
                </div>

                <div className="employee-task-footer">
                  <div>
                    <span>Due date</span>
                    <strong>{task.dueDate || "Not specified"}</strong>
                    {overdue && (
                      <span className="employee-task-overdue">Overdue</span>
                    )}
                  </div>

                  <label>
                    Task Status
                    <select
                      value={task.status || "Pending"}
                      onChange={(event) =>
                        handleStatusChange(task.id, event.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default EmployeeTasks;