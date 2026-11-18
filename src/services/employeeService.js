const API_URL = "http://localhost:5000/employees";
const USERS_URL = "http://localhost:5000/users";

const checkResponse = async (response, message) => {
  if (!response.ok) {
    throw new Error(message);
  }

  return response.json();
};

// Generate a temporary password for a new employee.
const generateTemporaryPassword = () => {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `HRMS@${randomPart}1`;
};

// Generate a username from the employee's email.
const generateUsername = (email, existingUsers) => {
  const emailPrefix = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const baseUsername = emailPrefix || "employee";

  let username = baseUsername;
  let counter = 1;

  const existingUsernames = existingUsers.map(
    (user) => user.username.toLowerCase()
  );

  while (existingUsernames.includes(username.toLowerCase())) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};

// Get all employees.
export const getEmployees = async () => {
  const response = await fetch(API_URL);
  return checkResponse(response, "Failed to fetch employees");
};

// Get all login accounts.
export const getUsers = async () => {
  const response = await fetch(USERS_URL);
  return checkResponse(response, "Failed to fetch login accounts");
};

// Create a login account for an employee if one does not exist.
const ensureEmployeeAccount = async (employee, existingUsers) => {
  const existingAccount = existingUsers.find(
    (user) => user.employeeId === employee.id
  );

  // Do not create duplicate accounts.
  if (existingAccount) {
    const shouldBeActive = employee.status === "Active";

    if (existingAccount.active !== shouldBeActive) {
      const updateResponse = await fetch(
        `${USERS_URL}/${existingAccount.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            active: shouldBeActive
          })
        }
      );

      await checkResponse(
        updateResponse,
        "Failed to update employee login status"
      );

      existingAccount.active = shouldBeActive;
    }

    return null;
  }

  // Do not create accounts for inactive employees.
  if (employee.status !== "Active") {
    return null;
  }

  const username = generateUsername(employee.email, existingUsers);
  const password = generateTemporaryPassword();

  const newUser = {
    username,
    password,
    role: "employee",
    employeeId: employee.id,
    active: true
  };

  const response = await fetch(USERS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newUser)
  });

  const createdUser = await checkResponse(
    response,
    "Employee was saved, but login account creation failed"
  );

  existingUsers.push(createdUser);

  return {
    employeeId: employee.id,
    employeeName: employee.name,
    username,
    password
  };
};

// Add new employee and automatically create login account.
export const addEmployee = async (employeeData) => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(employeeData)
  });

  const createdEmployee = await checkResponse(
    response,
    "Failed to add employee"
  );

  try {
    const users = await getUsers();

    const credentials = await ensureEmployeeAccount(
      createdEmployee,
      users
    );

    return {
      employee: createdEmployee,
      credentials
    };

  } catch (error) {
    // Roll back the employee record if account creation fails.
    await fetch(`${API_URL}/${createdEmployee.id}`, {
      method: "DELETE"
    });

    throw error;
  }
};

// Update employee and synchronize login account status.
export const updateEmployee = async (id, employeeData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(employeeData)
  });

  const updatedEmployee = await checkResponse(
    response,
    "Failed to update employee"
  );

  const users = await getUsers();

  const linkedUser = users.find(
    (user) => user.employeeId === id
  );

  if (linkedUser) {
    const accountResponse = await fetch(
      `${USERS_URL}/${linkedUser.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          active: updatedEmployee.status === "Active"
        })
      }
    );

    await checkResponse(
      accountResponse,
      "Employee updated, but login account status could not be updated"
    );
  } else if (updatedEmployee.status === "Active") {
    // Create an account if an active employee does not have one.
    await ensureEmployeeAccount(updatedEmployee, users);
  }

  return updatedEmployee;
};

// Delete employee and their linked login account.
export const deleteEmployee = async (id) => {
  const users = await getUsers();

  const linkedUser = users.find(
    (user) => user.employeeId === id
  );

  if (linkedUser) {
    const userResponse = await fetch(
      `${USERS_URL}/${linkedUser.id}`,
      {
        method: "DELETE"
      }
    );

    if (!userResponse.ok) {
      throw new Error("Failed to delete employee login account");
    }
  }

  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error("Failed to delete employee");
  }

  return true;
};

// Create missing accounts for existing active employees.
// Existing accounts are preserved and never duplicated.
export const createMissingEmployeeAccounts = async () => {
  const [employees, users] = await Promise.all([
    getEmployees(),
    getUsers()
  ]);

  const createdCredentials = [];

  for (const employee of employees) {
    const credentials = await ensureEmployeeAccount(
      employee,
      users
    );

    if (credentials) {
      createdCredentials.push(credentials);
    }
  }

  return createdCredentials;
};