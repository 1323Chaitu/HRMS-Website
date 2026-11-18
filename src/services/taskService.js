const API_URL = "http://localhost:5000";

export const getTasks = async () => {
  const response = await fetch(`${API_URL}/tasks`);
  if (!response.ok) throw new Error("Failed to fetch tasks");
  return response.json();
};

export const getEmployeeTasks = async (employeeId) => {
  const response = await fetch(
    `${API_URL}/tasks?employeeId=${encodeURIComponent(employeeId)}`
  );
  if (!response.ok) throw new Error("Failed to fetch employee tasks");
  return response.json();
};

export const createTask = async (taskData) => {
  const response = await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) throw new Error("Failed to create task");
  return response.json();
};

export const updateTask = async (taskId, taskData) => {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) throw new Error("Failed to update task");
  return response.json();
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) throw new Error("Failed to update task status");
  return response.json();
};

export const deleteTask = async (taskId) => {
  const response = await fetch(`${API_URL}/tasks/${taskId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to delete task");
  return true;
};