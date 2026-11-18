
const API_URL = "http://localhost:5000/leaves";

// Get all leave applications
export const getLeaves = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch leave applications");
  }

  return response.json();
};

// Get leave applications for a particular employee
export const getEmployeeLeaves = async (employeeId) => {
  const response = await fetch(
    `${API_URL}?employeeId=${encodeURIComponent(employeeId)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch employee leave history");
  }

  return response.json();
};

// Submit a new leave application
export const applyForLeave = async (leaveData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(leaveData),
  });

  if (!response.ok) {
    throw new Error("Failed to submit leave application");
  }

  return response.json();
};

// Approve or reject a leave application
export const updateLeaveStatus = async (leaveId, status) => {
  const response = await fetch(`${API_URL}/${leaveId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to update leave status");
  }

  return response.json();
};
