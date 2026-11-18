const API_URL = "http://localhost:5000";

export const loginUser = async (username, password) => {
  try {
    const response = await fetch(
      `${API_URL}/users?username=${encodeURIComponent(username)}`
    );

    if (!response.ok) {
      throw new Error("Unable to connect to server");
    }

    const users = await response.json();

    const user = users.find(
      (item) => item.password === password
    );

    if (!user) {
      throw new Error("Invalid username or password");
    }

    if (user.active === false) {
      throw new Error("This account is inactive. Contact your administrator.");
    }

    // Verify that the linked employee still exists and is active.
    if (user.role === "employee" || user.employeeId) {
      const employeeResponse = await fetch(
        `${API_URL}/employees/${encodeURIComponent(user.employeeId)}`
      );

      if (!employeeResponse.ok) {
        throw new Error("Employee account not found.");
      }

      const employee = await employeeResponse.json();

      if (employee.status !== "Active") {
        throw new Error("Your employee account is inactive. Contact your administrator.");
      }
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
      employeeId: user.employeeId
    };

  } catch (error) {
    throw new Error(error.message || "Login failed");
  }
};