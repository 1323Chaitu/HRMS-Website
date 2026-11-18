
const API_URL = "http://localhost:5000/payroll";

// Get all payroll records
export const getPayroll = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch payroll records");
  }

  return response.json();
};

// Get payroll records for a particular employee
export const getEmployeePayroll = async (employeeId) => {
  const response = await fetch(
    `${API_URL}?employeeId=${encodeURIComponent(employeeId)}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch employee payroll");
  }

  return response.json();
};

// Generate a new payroll record
export const createPayroll = async (payrollData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payrollData),
  });

  if (!response.ok) {
    throw new Error("Failed to generate payroll");
  }

  return response.json();
};

// Update payroll record
export const updatePayroll = async (payrollId, payrollData) => {
  const response = await fetch(`${API_URL}/${payrollId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payrollData),
  });

  if (!response.ok) {
    throw new Error("Failed to update payroll");
  }

  return response.json();
};

// Update payment status
export const updatePayrollStatus = async (payrollId, status) => {
  return updatePayroll(payrollId, { status });
};

// Calculate salary breakdown
export const calculateSalary = ({
  basicSalary = 0,
  hra = 0,
  allowances = 0,
  deductions = 0,
}) => {
  const grossSalary =
    Number(basicSalary) +
    Number(hra) +
    Number(allowances);

  const totalDeductions = Number(deductions);

  const netSalary = grossSalary - totalDeductions;

  return {
    grossSalary,
    totalDeductions,
    netSalary,
  };
};
