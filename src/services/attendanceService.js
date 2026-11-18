
const API_URL = "http://localhost:5000/attendance";

// Get all attendance records
export const getAttendance = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch attendance records");
  }

  return response.json();
};

// Get attendance for a particular employee
export const getEmployeeAttendance = async (employeeId) => {
  const response = await fetch(
    `${API_URL}?employeeId=${encodeURIComponent(employeeId)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch employee attendance");
  }

  return response.json();
};

// Get today's local date
export const getTodayDate = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

// Get current local time
const getCurrentTime = () => {
  const date = new Date();

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
};

// Check in
export const checkInEmployee = async (employeeId) => {
  const today = getTodayDate();

  const records = await getEmployeeAttendance(employeeId);

  const existingRecord = records.find(
    (record) => record.date === today
  );

  if (existingRecord) {
    throw new Error("Attendance has already been marked today.");
  }

  const checkIn = getCurrentTime();

  const status = checkIn >= "09:15" ? "Late" : "Present";

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: `ATT${Date.now()}`,
      employeeId,
      date: today,
      status,
      checkIn,
      checkOut: ""
    })
  });

  if (!response.ok) {
    throw new Error("Unable to record check-in.");
  }

  return response.json();
};

// Check out
export const checkOutEmployee = async (employeeId) => {
  const today = getTodayDate();

  const records = await getEmployeeAttendance(employeeId);

  const existingRecord = records.find(
    (record) => record.date === today
  );

  if (!existingRecord) {
    throw new Error("Please check in before checking out.");
  }

  if (existingRecord.status === "Absent") {
    throw new Error("Absent attendance cannot be checked out.");
  }

  if (!existingRecord.checkIn) {
    throw new Error("Check-in time is missing.");
  }

  if (existingRecord.checkOut) {
    throw new Error("You have already checked out today.");
  }

  const response = await fetch(
    `${API_URL}/${existingRecord.id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        checkOut: getCurrentTime()
      })
    }
  );

  if (!response.ok) {
    throw new Error("Unable to record check-out.");
  }

  return response.json();
};

// Admin marks an employee absent
export const markEmployeeAbsent = async (employeeId, date) => {
  const records = await getEmployeeAttendance(employeeId);

  const existingRecord = records.find(
    (record) => record.date === date
  );

  if (existingRecord) {
    throw new Error("Attendance is already recorded for this employee.");
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      id: `ATT${Date.now()}`,
      employeeId,
      date,
      status: "Absent",
      checkIn: "",
      checkOut: ""
    })
  });

  if (!response.ok) {
    throw new Error("Unable to mark employee absent.");
  }

  return response.json();
};
