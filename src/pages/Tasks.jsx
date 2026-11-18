import { useEffect, useMemo, useState } from "react";
import {
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "../services/taskService";
import { getEmployees } from "../services/employeeService";
import "../styles/Tasks.css";

const emptyForm = {
  title: "",
  description: "",
  employeeId: "",
  priority: "Medium",
  dueDate: "",
  status: "Pending",
};

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [taskData, employeeData] = await Promise.all([
        getTasks(),
        getEmployees(),
      ]);

      setTasks(taskData);
      setEmployees(employeeData);
    } catch (err) {
      setError("Unable to load tasks. Check that JSON Server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getEmployeeName = (employeeId) => {
    const employee = employees.find((item) => item.id === employeeId);
    return employee?.name || "Unknown Employee";
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

  const overdueCount = tasks.filter(
    (task) =>
      task.status !== "Completed" &&
      task.dueDate &&
      task.dueDate < today
  ).length;

  const filteredTasks = useMemo(() => {
    const term = search.toLowerCase();

    return tasks.filter((task) => {
      const employeeName = getEmployeeName(task.employeeId);

      const matchesSearch =
        (task.title || "").toLowerCase().includes(term) ||
        (task.description || "").toLowerCase().includes(term) ||
        employeeName.toLowerCase().includes(term) ||
        (task.employeeId || "").toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All" || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === "All" || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, employees, search, statusFilter, priorityFilter]);

  const openCreateModal = () => {
    setEditingTask(null);
    setForm({
      ...emptyForm,
      employeeId: employees[0]?.id || "",
    });
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || "",
      description: task.description || "",
      employeeId: task.employeeId || "",
      priority: task.priority || "Medium",
      dueDate: task.dueDate || "",
      status: task.status || "Pending",
    });
    setShowModal(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const employee = employees.find(
        (item) => item.id === form.employeeId
      );

      if (!employee) {
        alert("Please select an employee.");
        return;
      }

      const taskData = {
        ...form,
        employeeName: employee.name,
        updatedAt: new Date().toISOString(),
      };

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await createTask({
          ...taskData,
          id: `TASK${Date.now()}`,
          createdAt: new Date().toISOString(),
        });
      }

      setShowModal(false);
      setEditingTask(null);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      alert(err.message || "Unable to save task.");
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTaskStatus(taskId, status);
      await loadData();
    } catch (err) {
      alert("Unable to update task status.");
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;

    try {
      await deleteTask(task.id);
      await loadData();
    } catch (err) {
      alert("Unable to delete task.");
    }
  };

  if (loading) {
    return <div className="tasks-loading">Loading tasks...</div>;
  }

  return (
    <div className="tasks-page">
      <div className="tasks-heading">
        <div>
          <h1>Task Management</h1>
          <p>Assign tasks, monitor progress and manage deadlines.</p>
        </div>

        <button
          className="tasks-primary-btn"
          onClick={openCreateModal}
          disabled={employees.length === 0}
        >
          + Assign New Task
        </button>
      </div>

      {error && <div className="tasks-error">{error}</div>}

      <div className="tasks-stats">
        <div className="tasks-stat-card">
          <span>Total Tasks</span>
          <strong>{tasks.length}</strong>
        </div>
        <div className="tasks-stat-card">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="tasks-stat-card">
          <span>In Progress</span>
          <strong>{inProgressCount}</strong>
        </div>
        <div className="tasks-stat-card">
          <span>Completed</span>
          <strong>{completedCount}</strong>
        </div>
        <div className="tasks-stat-card">
          <span>Overdue</span>
          <strong>{overdueCount}</strong>
        </div>
      </div>

      <div className="tasks-toolbar">
        <input
          placeholder="Search task or employee..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      <div className="tasks-table-wrapper">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Assigned Employee</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTasks.map((task) => {
              const overdue =
                task.status !== "Completed" &&
                task.dueDate &&
                task.dueDate < today;

              return (
                <tr key={task.id}>
                  <td>
                    <strong>{task.title}</strong>
                    <small>{task.description}</small>
                  </td>
                  <td>
                    <strong>{getEmployeeName(task.employeeId)}</strong>
                    <small>{task.employeeId}</small>
                  </td>
                  <td>
                    <span
                      className={`tasks-priority ${task.priority?.toLowerCase()}`}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td>
                    {task.dueDate || "—"}
                    {overdue && (
                      <small className="tasks-overdue-label">Overdue</small>
                    )}
                  </td>
                  <td>
                    <select
                      className="tasks-status-select"
                      value={task.status || "Pending"}
                      onChange={(event) =>
                        handleStatusChange(task.id, event.target.value)
                      }
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </td>
                  <td>
                    <div className="tasks-actions">
                      <button onClick={() => openEditModal(task)}>Edit</button>
                      <button
                        className="delete"
                        onClick={() => handleDelete(task)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan="6" className="tasks-empty">
                  No tasks found. Assign your first task.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="tasks-modal-overlay">
          <div className="tasks-modal">
            <div className="tasks-modal-heading">
              <div>
                <h2>{editingTask ? "Edit Task" : "Assign New Task"}</h2>
                <p>Enter the task details and assign an employee.</p>
              </div>

              <button
                type="button"
                className="tasks-close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="tasks-form-grid">
                <label className="tasks-full-width">
                  Task Title *
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="e.g. Complete employee onboarding"
                    required
                  />
                </label>

                <label className="tasks-full-width">
                  Description *
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Describe the task..."
                    required
                  />
                </label>

                <label>
                  Assign Employee *
                  <select
                    name="employeeId"
                    value={form.employeeId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select employee</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} ({employee.id})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Priority
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </label>

                <label>
                  Due Date *
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                    required
                  />
                </label>

                <label>
                  Status
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </label>
              </div>

              <div className="tasks-modal-actions">
                <button
                  type="button"
                  className="tasks-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="tasks-primary-btn">
                  {editingTask ? "Save Changes" : "Assign Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tasks;